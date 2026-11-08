import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/FamilyEditor.css";
import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import { Family, Mechanism } from "../types/chemistryModels";
import { MechanismCreationModal } from "../components/modals/MechanismCreationModal";
import { ValidationErrorsModal } from "../components/modals/ValidationErrorsModal";
import { ConfirmActionModal } from "../components/modals/ConfirmActionModal";
import { UUID } from "crypto";
import { getAllFamilies, getFamily } from "../API/API_GetMethods";
import { deleteFamily } from "../API/API_DeleteMethods";
import {
  apiToFrontendFamily,
  saveFamilyChanges,
  uploadFamily,
} from "../helpers/backendInteractions";
import { useAuth } from "../components/AuthContext";
import {
  addFamilyLocally,
  addUploadedFamilyIdLocally,
  cloneFamily,
  removeFamilyLocally,
  updateLocalStorageFamilyInfo,
} from "../helpers/localFamilies";
import { GeneralInfoView } from "../components/familyEditor/GeneralInfoView";
import { MechanismsView } from "../components/familyEditor/MechanismsView";
import { MechanismEditor } from "../components/MechanismEditor";
import { PhaseView } from "../components/familyEditor/PhaseView";
import { ReactionsView } from "../components/familyEditor/ReactionsView";
import { SpeciesView } from "../components/familyEditor/SpeciesView";
import { ContributorsView } from "../components/familyEditor/ContributorsView";
import {
  EditorSection,
  FamilyValidationProvider,
  useFamilyIssues,
} from "../components/familyEditor/FamilyValidationContext";
import { ProblemCount } from "../components/familyEditor/IssueIndicators";
import {
  countItemsWithIssues,
  validateFamily,
  ValidationIssue,
} from "../helpers/validationIssues";
import { AUTH_URL } from "../API/API_config";

export type ActiveView =
  | { type: "general" }
  | { type: "reactions" }
  | { type: "species" }
  | { type: "phases" }
  | { type: "mechanism"; mechanismId: UUID };

const FamilyEditor = () => {
  const { familyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [family, setFamily] = useState<Family | null>(null);
  const [originalFamily, setOriginalFamily] = useState<Family | null>(null);

  const [selectedView, setSelectedView] = useState<ActiveView>({
    type: "general",
  });

  // In-page feedback messages (no alert())
  const [inPageError, setInPageError] = useState<string | null>(null);
  const [inPageSuccess, setInPageSuccess] = useState<string | null>(null);

  // Modals state
  const [mechanismCreationModalOpen, setMechanismCreationModalOpen] =
    useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationIssue[]>(
    [],
  );
  const [openMakePublicModal, setOpenMakePublicModal] =
    useState<boolean>(false);

  // Permissions
  const isOwner = Boolean(user?.id && family?.owner?.id === user.id);
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isContributor = Boolean(
    user?.id && family?.contributorIds?.includes(user.id as UUID),
  );
  const isDraft = !family?.isInDatabase;
  const canEdit = isDraft || isOwner || isAdmin || isContributor;
  const canChangeVisibility =
    canEdit && Boolean(family?.isInDatabase) && (isOwner || isAdmin);

  const editorMode = family ? (canEdit ? "editing" : "viewing") : undefined;

  // Load target family based on URL parameters or local storage
  const loadFamilyFromSource = useCallback(async () => {
    setLoading(true);
    setInPageError(null);

    const searchParams = new URLSearchParams(location.search);
    const queryId = searchParams.get("id");
    const selectedEditorFamilyId = localStorage.getItem(
      "selectedEditorFamilyId",
    );
    const targetIdentifier = queryId || familyId || selectedEditorFamilyId;

    const selectMechanismIfStored = (fam: Family) => {
      const selectedMechId = localStorage.getItem("selectedEditorMechanismId");
      if (selectedMechId && fam.mechanisms) {
        const match = fam.mechanisms.find((m) => m.id === selectedMechId);
        if (match) {
          setSelectedView({ type: "mechanism", mechanismId: match.id });
        }
      }
    };

    const localFamilies: Family[] = JSON.parse(
      localStorage.getItem("localFamilies") || "[]",
    );

    // 1. If target matches a local draft
    if (targetIdentifier) {
      const draftMatch = localFamilies.find((f) => f.id === targetIdentifier);
      if (draftMatch) {
        setFamily(draftMatch);
        setOriginalFamily(structuredClone(draftMatch));
        selectMechanismIfStored(draftMatch);
        setLoading(false);
        return;
      }
    }

    // 2. If targetIdentifier is a valid UUID, attempt direct getFamily
    const isUuid =
      targetIdentifier &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        targetIdentifier,
      );
    if (isUuid) {
      try {
        const apiFam = await getFamily(targetIdentifier as UUID);
        if (apiFam) {
          const frontFam = apiToFrontendFamily(apiFam);
          setFamily(frontFam);
          setOriginalFamily(structuredClone(frontFam));
          selectMechanismIfStored(frontFam);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Direct fetch by UUID failed:", err);
      }
    }

    // 3. Fallback: Query all families
    try {
      const allDbFamilies = await getAllFamilies("?expand=true");
      if (targetIdentifier) {
        const match = allDbFamilies.find((f) => f.id === targetIdentifier);
        if (match) {
          const frontFam = apiToFrontendFamily(match);
          setFamily(frontFam);
          setOriginalFamily(structuredClone(frontFam));
          selectMechanismIfStored(frontFam);
          setLoading(false);
          return;
        }
      }

      // If no identifier specified, pick first local draft or first uploaded family
      if (!targetIdentifier) {
        if (localFamilies.length > 0) {
          setFamily(localFamilies[0]);
          setOriginalFamily(structuredClone(localFamilies[0]));
          selectMechanismIfStored(localFamilies[0]);
          setLoading(false);
          return;
        }

        const uploadedFamilyIds: string[] = JSON.parse(
          localStorage.getItem("uploadedFamilyIds") || "[]",
        );
        if (uploadedFamilyIds.length > 0) {
          try {
            const apiFam = await getFamily(uploadedFamilyIds[0] as UUID);
            if (apiFam) {
              const frontFam = apiToFrontendFamily(apiFam);
              setFamily(frontFam);
              setOriginalFamily(structuredClone(frontFam));
              selectMechanismIfStored(frontFam);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }

        if (allDbFamilies.length > 0) {
          const frontFam = apiToFrontendFamily(allDbFamilies[0]);
          setFamily(frontFam);
          setOriginalFamily(structuredClone(frontFam));
          selectMechanismIfStored(frontFam);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to query families:", err);
    }

    // Default: local draft if exists, else null
    if (localFamilies.length > 0) {
      setFamily(localFamilies[0]);
      setOriginalFamily(structuredClone(localFamilies[0]));
      selectMechanismIfStored(localFamilies[0]);
    } else {
      setFamily(null);
      setOriginalFamily(null);
    }
    setLoading(false);
  }, [familyId, location.search]);

  useEffect(() => {
    if (family) {
      localStorage.setItem(
        "activeEditorFamily",
        JSON.stringify({
          id: family.id,
          name: family.name,
          mode: canEdit ? "editing" : "viewing",
        }),
      );
    } else {
      localStorage.removeItem("activeEditorFamily");
    }
  }, [family, canEdit]);

  useEffect(() => {
    loadFamilyFromSource();
  }, [loadFamilyFromSource]);

  // Window unload confirmation when unsaved changes exist
  useEffect(() => {
    if (family?.isModified) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = null;
    }
    return () => {
      window.onbeforeunload = null;
    };
  }, [family?.isModified]);

  // Family update handler from subviews
  const updateFamily = (updated: Family) => {
    const isModified = true;
    const modifiedFamily = {
      ...updated,
      isModified,
    };
    setFamily(modifiedFamily);
  };

  // Discard changes: revert back to original pristine copy
  const handleDiscardChanges = () => {
    if (originalFamily) {
      setFamily(structuredClone(originalFamily));
      setInPageSuccess("Changes discarded.");
    }
  };

  // Save changes for current family
  const handleSaveChanges = async (): Promise<Family | null> => {
    if (!family) return null;
    setLoading(true);
    setInPageError(null);
    try {
      if (family.isInDatabase) {
        const saved = await saveFamilyChanges(family);
        setFamily(saved);
        setOriginalFamily(structuredClone(saved));
        setInPageSuccess("Changes saved successfully.");
        return saved;
      } else {
        const updatedDraft = { ...family, isModified: false };
        updateLocalStorageFamilyInfo([updatedDraft]);
        setFamily(updatedDraft);
        setOriginalFamily(structuredClone(updatedDraft));
        setInPageSuccess("Draft saved in browser.");
        return updatedDraft;
      }
    } catch (err) {
      console.error(err);
      setInPageError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving family.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Edit a copy one-click action
  const handleEditCopy = async () => {
    if (!family) return;
    setLoading(true);
    setInPageError(null);
    try {
      const copy = cloneFamily(family);
      if (user) {
        // Signed in user: save copy as private family in database
        const uploaded = await uploadFamily(copy, user);
        addUploadedFamilyIdLocally(uploaded.id);
        localStorage.setItem("selectedEditorFamilyId", uploaded.id);
        setFamily(uploaded);
        setOriginalFamily(structuredClone(uploaded));
        setSelectedView({ type: "general" });
        setInPageSuccess(`Created private copy "${uploaded.name}".`);
      } else {
        // Guest: save copy as draft in browser
        addFamilyLocally(copy);
        localStorage.setItem("selectedEditorFamilyId", copy.id);
        setFamily(copy);
        setOriginalFamily(structuredClone(copy));
        setSelectedView({ type: "general" });
        setInPageSuccess(`Created browser draft copy "${copy.name}".`);
      }
    } catch (err) {
      console.error(err);
      setInPageError(
        err instanceof Error
          ? err.message
          : "Failed to create a copy of this family.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Save guest draft to signed-in account
  const handleSaveDraftToAccount = async () => {
    if (!user || !family) return;
    setLoading(true);
    setInPageError(null);
    try {
      const uploaded = await uploadFamily(family, user);
      removeFamilyLocally(family);
      addUploadedFamilyIdLocally(uploaded.id);
      localStorage.setItem("selectedEditorFamilyId", uploaded.id);
      setFamily(uploaded);
      setOriginalFamily(structuredClone(uploaded));
      setInPageSuccess(`Saved "${uploaded.name}" to your account.`);
    } catch (err) {
      console.error(err);
      setInPageError(
        err instanceof Error
          ? err.message
          : "Failed to save draft to your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle Public / Private switch
  const handleTogglePublicSwitch = async () => {
    if (!family || family.isModified) return;

    if (!family.isPublic) {
      // Validate all mechanisms before making public
      const issues = await validateFamily(family);
      if (issues.length > 0) {
        setValidationErrors(issues);
        return;
      }
      setOpenMakePublicModal(true);
    } else {
      // Toggle to private
      setLoading(true);
      try {
        const saved = await saveFamilyChanges({
          ...family,
          isPublic: false,
          isModified: true,
        });
        setFamily(saved);
        setOriginalFamily(structuredClone(saved));
        setInPageSuccess(`"${saved.name}" is now private.`);
      } catch (err) {
        console.error(err);
        setInPageError(
          err instanceof Error ? err.message : "Failed to update visibility.",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const confirmMakePublic = async () => {
    if (!family) return;
    setOpenMakePublicModal(false);
    setLoading(true);
    try {
      const saved = await saveFamilyChanges({
        ...family,
        isPublic: true,
        isModified: true,
      });
      setFamily(saved);
      setOriginalFamily(structuredClone(saved));
      setInPageSuccess(`"${saved.name}" is now public.`);
    } catch (err) {
      console.error(err);
      setInPageError(
        err instanceof Error ? err.message : "Failed to make family public.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete family
  const confirmDeleteFamily = async () => {
    if (!family) return;
    setLoading(true);
    try {
      if (family.isInDatabase) {
        await deleteFamily(family.id);
      }
      removeFamilyLocally(family);
      setInPageSuccess(`Deleted family "${family.name}".`);
      setFamily(null);
      setOriginalFamily(null);
      navigate("/");
    } catch (err) {
      console.error(err);
      setInPageError(
        err instanceof Error ? err.message : "Failed to delete family.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Mechanism management inside the family
  const handleCreateMechanism = (newMech: Mechanism) => {
    if (!family) return;
    const mechWithFamilyId: Mechanism = {
      ...newMech,
      familyId: family.id,
    };
    updateFamily({
      ...family,
      mechanisms: [mechWithFamilyId, ...family.mechanisms],
    });
    setMechanismCreationModalOpen(false);
    setSelectedView({
      type: "mechanism",
      mechanismId: mechWithFamilyId.id as UUID,
    });
  };

  const handleUpdateMechanism = (updatedMechanism: Mechanism) => {
    if (!family) return;
    updateFamily({
      ...family,
      mechanisms: family.mechanisms.map((m) =>
        m.id === updatedMechanism.id ? updatedMechanism : m,
      ),
    });
  };

  const handleDeleteMechanism = (mechanismId: string) => {
    if (!family) return;
    updateFamily({
      ...family,
      mechanisms: family.mechanisms.filter((m) => m.id !== mechanismId),
    });
    setSelectedView({ type: "general" });
  };

  // Validation
  const validation = useFamilyIssues(family ?? undefined);
  const problemCounts = countItemsWithIssues(validation.issues);

  const openSection = (section: EditorSection) => {
    switch (section) {
      case "species":
        setSelectedView({ type: "species" });
        break;
      case "reactions":
        setSelectedView({ type: "reactions" });
        break;
      case "phases":
        setSelectedView({ type: "phases" });
        break;
      case "mechanisms":
        if (family && family.mechanisms.length > 0) {
          setSelectedView({
            type: "mechanism",
            mechanismId: family.mechanisms[0].id as UUID,
          });
        }
        break;
      default:
        setSelectedView({ type: "general" });
        break;
    }
  };

  // Current selected mechanism
  const currentMechanism = useMemo(() => {
    if (!family || selectedView.type !== "mechanism") return null;
    return (
      family.mechanisms.find((m) => m.id === selectedView.mechanismId) || null
    );
  }, [family, selectedView]);

  return (
    <div className="layout-family-editor">
      <header>
        <Header editorMode={editorMode} familyName={family?.name} />
      </header>

      <Paper square component="main" className="content-family-editor">
        {/* Top Header Bar spanning the whole editor */}
        <Box
          className="family-editor-topbar"
          sx={{
            px: { xs: 2, sm: 3 },
            pt: 2,
            pb: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {/* Left: Family Name, Visibility Chip, Owner, Public Switch */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  color: "text.primary",
                }}
              >
                {family ? family.name : "Families"}
              </Typography>

              {family && (
                <>
                  {/* Status chip */}
                  {!family.isInDatabase ? (
                    <Chip
                      size="small"
                      label="Draft in this browser"
                      color="warning"
                      variant="outlined"
                      data-testid="status-chip-draft"
                      sx={{
                        height: 24,
                        fontSize: "0.8rem",
                        borderRadius: "6px",
                      }}
                    />
                  ) : family.isPublic ? (
                    <Chip
                      size="small"
                      label="Public"
                      variant="outlined"
                      data-testid="status-chip-public"
                      sx={{
                        height: 24,
                        fontSize: "0.8rem",
                        borderRadius: "6px",
                      }}
                    />
                  ) : (
                    <Tooltip title="Private: only the owner, contributors, and admins can view">
                      <Chip
                        size="small"
                        icon={<LockIcon sx={{ fontSize: 14 }} />}
                        label="Private"
                        variant="outlined"
                        data-testid="status-chip-private"
                        sx={{
                          height: 24,
                          fontSize: "0.8rem",
                          borderRadius: "6px",
                        }}
                      />
                    </Tooltip>
                  )}

                  {/* Owner name shown when viewing someone else's family */}
                  {!canEdit && family.owner?.username && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 0.5, fontSize: "0.875rem" }}
                    >
                      {family.owner.username}
                    </Typography>
                  )}

                  {/* Owner / admin Public switch */}
                  {canChangeVisibility && (
                    <Tooltip
                      title={
                        family.isModified
                          ? "The switch is disabled when changes are not saved."
                          : ""
                      }
                    >
                      <span>
                        <FormControlLabel
                          labelPlacement="start"
                          sx={{ ml: 1, mr: 0 }}
                          label={
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.875rem" }}
                            >
                              Public
                            </Typography>
                          }
                          control={
                            <Switch
                              size="small"
                              checked={Boolean(family.isPublic)}
                              disabled={Boolean(family.isModified)}
                              onChange={handleTogglePublicSwitch}
                              data-testid="public-switch"
                            />
                          }
                        />
                      </span>
                    </Tooltip>
                  )}
                </>
              )}
            </Box>

            {/* Right: Actions (Unsaved changes / Save / Discard OR Edit a copy, and AddFamilyButton) */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              {family && canEdit && family.isModified && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                  data-testid="unsaved-changes-bar"
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "error.main",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ fontSize: "1.2rem", lineHeight: 0 }}
                    >
                      •
                    </Box>{" "}
                    Unsaved changes
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={handleDiscardChanges}
                    data-testid="discard-changes-button"
                    sx={{ textTransform: "none", minWidth: 70 }}
                  >
                    Discard
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => void handleSaveChanges()}
                    data-testid="save-changes-button"
                    sx={{ textTransform: "none", minWidth: 70 }}
                  >
                    Save
                  </Button>
                </Box>
              )}

              {family && !canEdit && (
                <Button
                  color="primary"
                  variant="contained"
                  size="small"
                  onClick={handleEditCopy}
                  data-testid="banner-edit-copy-button"
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Edit a copy
                </Button>
              )}
            </Box>
          </Box>

          {/* Read-Only Viewing Banner across the top if !canEdit */}
          {family && !canEdit && (
            <Alert
              severity="info"
              sx={{
                mt: 1.5,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                color: "text.primary",
                py: 0.5,
                px: 2,
                "& .MuiAlert-icon": { display: "none" },
              }}
              data-testid="readonly-viewing-banner"
            >
              You are viewing {family.owner?.username || "another user"}&apos;s
              family. Edit a copy to change it.
            </Alert>
          )}

          {/* Guest Draft Banner across the top if !family.isInDatabase */}
          {family && !family.isInDatabase && (
            <Alert
              severity="warning"
              sx={{
                mt: 1.5,
                py: 0.5,
                px: 2,
              }}
              action={
                user ? (
                  <Button
                    color="primary"
                    variant="contained"
                    size="small"
                    onClick={handleSaveDraftToAccount}
                    data-testid="save-draft-to-account-button"
                    sx={{ textTransform: "none" }}
                  >
                    Save to account
                  </Button>
                ) : (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      localStorage.removeItem("user");
                      window.location.assign(`${AUTH_URL}/google/login`);
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    Sign in
                  </Button>
                )
              }
              data-testid="guest-draft-banner"
            >
              {user
                ? "This draft stays only in this browser. Save it to your account to keep it permanently."
                : "This draft stays only in this browser. After sign-in, one click saves the draft to your account."}
            </Alert>
          )}

          {/* In-page Error and Success Alerts */}
          {inPageError && (
            <Alert
              severity="error"
              onClose={() => setInPageError(null)}
              sx={{ mt: 1.5 }}
              data-testid="in-page-error-alert"
            >
              {inPageError}
            </Alert>
          )}
          {inPageSuccess && (
            <Alert
              severity="success"
              onClose={() => setInPageSuccess(null)}
              sx={{ mt: 1.5 }}
              data-testid="in-page-success-alert"
            >
              {inPageSuccess}
            </Alert>
          )}
        </Box>

        {/* Lower Body: Left Sidebar + Main Content */}
        {!family ? (
          <Box sx={{ textAlign: "center", py: 8, flex: 1 }}>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              No family is currently selected.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/")}
              >
                Browse Families
              </Button>
            </Box>
          </Box>
        ) : (
          <Box className="family-editor-body">
            {/* Left Sidebar */}
            <Box
              className="family-editor-sidebar"
              sx={{
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {/* FAMILY Section Header */}
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    px: 1,
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  FAMILY
                </Typography>

                {/* General Info */}
                <SidebarItem
                  label="General Info"
                  isSelected={selectedView.type === "general"}
                  onClick={() => {
                    setSelectedView({ type: "general" });
                  }}
                  testId="family-info-tab"
                />

                {/* Reactions */}
                <SidebarItem
                  label="Reactions"
                  count={family.reactions.length}
                  problemCount={problemCounts.reaction}
                  isSelected={selectedView.type === "reactions"}
                  onClick={() => {
                    setSelectedView({ type: "reactions" });
                  }}
                  testId="family-reactions-tab"
                />

                {/* Species */}
                <SidebarItem
                  label="Species"
                  count={family.species.length}
                  problemCount={problemCounts.species}
                  isSelected={selectedView.type === "species"}
                  onClick={() => {
                    setSelectedView({ type: "species" });
                  }}
                  testId="family-species-tab"
                />

                {/* Phases */}
                <SidebarItem
                  label="Phases"
                  count={family.phases.length}
                  problemCount={problemCounts.phase}
                  isSelected={selectedView.type === "phases"}
                  onClick={() => {
                    setSelectedView({ type: "phases" });
                  }}
                  testId="family-phases-tab"
                />

                {/* MECHANISM Section Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 3,
                    mb: 0.5,
                    px: 1,
                  }}
                  data-testid="family-mechanisms-tab"
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    MECHANISM
                  </Typography>
                  {!canEdit ? null : (
                    <Tooltip title="Create a new mechanism">
                      <IconButton
                        size="small"
                        aria-label="Create a new mechanism"
                        data-testid="create-mechanism-button"
                        onClick={() => setMechanismCreationModalOpen(true)}
                        sx={{ p: 0.25 }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* Mechanisms list */}
                {family.mechanisms.length === 0 ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ px: 1, py: 1, display: "block" }}
                  >
                    No mechanisms yet
                  </Typography>
                ) : (
                  family.mechanisms.map((mech) => {
                    const reactionCount = mech.reactionIds?.length ?? 0;
                    const issuesForMech = validation.issues.filter(
                      (i) => i.mechanismId === mech.id,
                    ).length;
                    const isSelected =
                      selectedView.type === "mechanism" &&
                      selectedView.mechanismId === mech.id;

                    return (
                      <SidebarItem
                        key={mech.id}
                        label={mech.name || "<No Name>"}
                        count={reactionCount}
                        problemCount={issuesForMech}
                        isSelected={isSelected}
                        onClick={() => {
                          setSelectedView({
                            type: "mechanism",
                            mechanismId: mech.id as UUID,
                          });
                        }}
                        testId={`mechanism-item-${mech.id}`}
                      />
                    );
                  })
                )}
              </Box>
            </Box>

            {/* Main Content Area */}
            <Box className="family-editor-main">
              <FamilyValidationProvider value={{ ...validation, openSection }}>
                {selectedView.type === "general" && (
                  <GeneralInfoView
                    family={family}
                    updateFamily={updateFamily}
                    readOnly={!canEdit}
                    onPublish={handleSaveDraftToAccount}
                    onDelete={confirmDeleteFamily}
                    onChangeVisibility={(isPublic) => {
                      if (isPublic) {
                        handleTogglePublicSwitch();
                      } else {
                        saveFamilyChanges({
                          ...family,
                          isPublic: false,
                          isModified: true,
                        }).then((saved) => {
                          setFamily(saved);
                          setOriginalFamily(structuredClone(saved));
                        });
                      }
                    }}
                  />
                )}
                {selectedView.type === "reactions" && (
                  <ReactionsView
                    family={family}
                    updateFamily={updateFamily}
                    readOnly={!canEdit}
                  />
                )}
                {selectedView.type === "species" && (
                  <SpeciesView
                    family={family}
                    updateFamily={updateFamily}
                    readOnly={!canEdit}
                  />
                )}
                {selectedView.type === "phases" && (
                  <PhaseView
                    family={family}
                    updateFamily={updateFamily}
                    readOnly={!canEdit}
                  />
                )}
                {selectedView.type === "mechanism" &&
                  (currentMechanism ? (
                    <MechanismEditor
                      family={family}
                      mechanism={currentMechanism}
                      updateMechanism={handleUpdateMechanism}
                      onDeleteMechanism={handleDeleteMechanism}
                      readOnly={!canEdit}
                    />
                  ) : (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        Mechanism not found.
                      </Typography>
                    </Box>
                  ))}
              </FamilyValidationProvider>
            </Box>
          </Box>
        )}
      </Paper>

      <footer>
        <Footer />
      </footer>

      {/* Modals */}
      <MechanismCreationModal
        open={mechanismCreationModalOpen}
        familyId={family?.id ?? ("" as UUID)}
        onClose={() => setMechanismCreationModalOpen(false)}
        onSubmit={handleCreateMechanism}
      />

      <ValidationErrorsModal
        open={validationErrors.length > 0}
        onClose={() => setValidationErrors([])}
        message="Fix these problems before making this family public:"
        family={family ?? ({} as Family)}
        errors={validationErrors}
      />

      <ConfirmActionModal
        open={openMakePublicModal}
        message="Make Family Public?"
        subtitle="Making this family public allows anyone to view and clone it. Are you sure you want to proceed?"
        onClose={() => setOpenMakePublicModal(false)}
        onAction={() => void confirmMakePublic()}
        confirmLabel="Make Public"
        confirmColor="primary"
      />

      {loading && (
        <CircularProgress
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
          }}
          size="4rem"
        />
      )}
    </div>
  );
};

interface SidebarItemProps {
  label: string;
  count?: number;
  problemCount?: number;
  isSelected: boolean;
  onClick: () => void;
  testId?: string;
  ariaLabel?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  count,
  problemCount,
  isSelected,
  onClick,
  testId,
  ariaLabel,
}) => {
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      data-testid={testId}
      aria-label={ariaLabel || label}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 0.75,
        px: 1.5,
        my: 0.35,
        borderRadius: "8px",
        cursor: "pointer",
        border: "1px solid",
        borderColor: (theme) =>
          isSelected
            ? theme.palette.mode === "dark"
              ? "grey.500"
              : "grey.800"
            : "transparent",
        bgcolor: isSelected
          ? (theme) => alpha(theme.palette.text.primary, 0.06)
          : "transparent",
        "&:hover": {
          bgcolor: isSelected
            ? (theme) => alpha(theme.palette.text.primary, 0.1)
            : "action.hover",
        },
        transition: "all 0.15s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          minWidth: 0,
          pr: 1,
        }}
      >
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontWeight: isSelected ? 600 : 400,
            color: "text.primary",
            fontSize: "0.92rem",
          }}
        >
          {label}
        </Typography>
        {Boolean(problemCount && problemCount > 0) && (
          <ProblemCount count={problemCount!} />
        )}
      </Box>
      {count !== undefined && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.9rem",
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {count}
        </Typography>
      )}
    </Box>
  );
};

export {
  GeneralInfoView,
  MechanismsView,
  PhaseView,
  ReactionsView,
  SpeciesView,
  ContributorsView,
};

export default FamilyEditor;
