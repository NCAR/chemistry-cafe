import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ClearIcon from "@mui/icons-material/Clear";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/Dashboard.css";
import { APIFamily } from "../API/API_Interfaces";
import { Family, Mechanism } from "../types/chemistryModels";
import { getAllFamilies } from "../API/API_GetMethods";
import FamilyBrowser, {
  getMechanismVerification,
} from "../components/FamilyBrowser";
import {
  addFamilyLocally,
  addUploadedFamilyIdLocally,
  cloneFamily,
} from "../helpers/localFamilies";
import {
  apiToFrontendFamily,
  uploadFamily,
} from "../helpers/backendInteractions";
import { useAuth } from "../components/AuthContext";
import { FamilyCreationModal } from "../components/modals/FamilyCreationModal";
import { ImportFamilyModal } from "../components/modals/ImportFamilyModal";

const REACTION_TYPE_OPTIONS = [
  "ARRHENIUS",
  "BRANCHED",
  "EMISSION",
  "FIRST_ORDER_LOSS",
  "PHOTOLYSIS",
  "SURFACE",
  "TAYLOR_SERIES",
  "TERNARY_CHEMICAL_ACTIVATION",
  "TROE",
  "TUNNELING",
  "USER_DEFINED",
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State
  const viewParam = searchParams.get("view") || "all";
  const queryParam = searchParams.get("q") || "";
  const speciesParam = searchParams.get("species") || "";
  const reactionTypeParam = searchParams.get("reactionType") || "";
  const ownerParam = searchParams.get("owner") || "";
  const verifiedByParam = searchParams.get("verifiedBy") || "";
  const verifiedAfterParam = searchParams.get("verifiedAfter") || "";

  // Component Data State
  const [families, setFamilies] = useState<Family[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // UI state
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [openFamilyIds, setOpenFamilyIds] = useState<Set<string>>(new Set());
  const [familyCreationModalOpen, setFamilyCreationModalOpen] =
    useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);

  // Helper to update URL params while preserving existing ones
  const updateUrlParams = (
    updates: Record<string, string | null | undefined>,
  ) => {
    const nextParams = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined) {
        nextParams.delete(key);
      } else if (key === "q") {
        if (value === "") {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      } else if (value.trim() === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value.trim());
      }
    }

    // Default view in URL: keep view if specified or if searching, e.g. /?view=all&q=NO2
    if (!nextParams.has("view")) {
      nextParams.set("view", viewParam);
    }

    setSearchParams(nextParams, { replace: true });
  };

  // Fetch API families and local draft families
  useEffect(() => {
    const abortController = new AbortController();

    const fetchFamilyData = async () => {
      try {
        setLoadingFamilies(true);
        const apiFamilies: APIFamily[] = await getAllFamilies("?expand=true");
        const convertedApiFamilies = apiFamilies.map(apiToFrontendFamily);

        let localDrafts: Family[] = [];
        try {
          const stored = JSON.parse(
            localStorage.getItem("localFamilies") || "[]",
          );
          if (Array.isArray(stored)) {
            localDrafts = stored;
          }
        } catch {
          localDrafts = [];
        }

        // De-duplicate: exclude local draft if an API family has the same ID
        const apiIds = new Set(convertedApiFamilies.map((f) => f.id));
        const uniqueLocalDrafts = localDrafts.filter((f) => !apiIds.has(f.id));

        setFamilies([...uniqueLocalDrafts, ...convertedApiFamilies]);
      } catch (err: unknown) {
        if (!abortController.signal.aborted) {
          const msg =
            err instanceof Error ? err.message : "Failed to load families";
          setFetchError(msg);
          setFamilies([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoadingFamilies(false);
        }
      }
    };

    fetchFamilyData();
    return () => abortController.abort();
  }, []);

  // Determine if a family belongs to the current user (owner, contributor, or browser draft)
  const isUserFamily = (family: Family): boolean => {
    if (!family.isInDatabase) return true; // Browser draft belongs to current browser session
    if (!user) return false;
    if (user.id === family.owner?.id) return true;
    if (family.contributorIds?.includes(user.id)) return true;
    if (family.contributors?.some((c) => c.userId === user.id)) return true;
    return false;
  };

  // Filtered families based on view switch, search query, and the 5 filters
  const filteredFamilies = useMemo(() => {
    return families
      .map((family) => {
        // Step 1: Switch Filter
        if (viewParam === "mine") {
          if (!isUserFamily(family)) return null;
        } else if (viewParam === "verified") {
          // Keep only verified mechanisms
          const verifiedMechanisms = family.mechanisms.filter(
            (m) => getMechanismVerification(m).isVerified,
          );
          if (verifiedMechanisms.length === 0) return null;
          family = { ...family, mechanisms: verifiedMechanisms };
        }

        // Step 2: 5 Filters
        if (speciesParam) {
          const sQuery = speciesParam.toLowerCase();
          const hasSpecies = family.species.some((s) =>
            s.name.toLowerCase().includes(sQuery),
          );
          if (!hasSpecies) return null;
        }

        if (reactionTypeParam) {
          const rQuery = reactionTypeParam.toUpperCase();
          const hasReactionType = family.reactions.some(
            (r) => r.type?.toUpperCase() === rQuery,
          );
          if (!hasReactionType) return null;
        }

        if (ownerParam) {
          const oQuery = ownerParam.toLowerCase();
          const matchesOwner =
            family.owner?.username?.toLowerCase().includes(oQuery) ||
            family.owner?.firstName?.toLowerCase().includes(oQuery) ||
            family.owner?.lastName?.toLowerCase().includes(oQuery);
          if (!matchesOwner) return null;
        }

        if (verifiedByParam) {
          const vQuery = verifiedByParam.toLowerCase();
          const matchesVerifier = family.mechanisms.some((m) => {
            const info = getMechanismVerification(m);
            return info.verifiedBy?.toLowerCase().includes(vQuery);
          });
          if (!matchesVerifier) return null;
        }

        if (verifiedAfterParam) {
          const targetTime = new Date(verifiedAfterParam).getTime();
          if (!isNaN(targetTime)) {
            const hasVerifiedAfter = family.mechanisms.some((m) => {
              const info = getMechanismVerification(m);
              if (!info.isVerified || !info.verifiedDate) return false;
              return new Date(info.verifiedDate).getTime() >= targetTime;
            });
            if (!hasVerifiedAfter) return null;
          }
        }

        // Step 3: Search Box (finds text in family names, owners, descriptions, mechanism names, species, and reactions)
        if (queryParam.trim()) {
          const q = queryParam.trim().toLowerCase();
          const nameMatch = family.name.toLowerCase().includes(q);
          const descMatch = Boolean(
            family.description?.toLowerCase().includes(q),
          );
          const ownerMatch = Boolean(
            family.owner?.username?.toLowerCase().includes(q) ||
              family.owner?.firstName?.toLowerCase().includes(q) ||
              family.owner?.lastName?.toLowerCase().includes(q),
          );
          const mechanismMatch = family.mechanisms.some(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.description?.toLowerCase().includes(q),
          );
          const speciesMatch = family.species.some(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.description?.toLowerCase().includes(q),
          );
          const reactionMatch = family.reactions.some((r) => {
            if (r.name.toLowerCase().includes(q)) return true;
            if (r.description?.toLowerCase().includes(q)) return true;
            if (r.type?.toLowerCase().includes(q)) return true;
            const reactantMatch = r.reactants?.some((reactant) => {
              const s = family.species.find(
                (sp) => sp.id === reactant.speciesId,
              );
              return s?.name?.toLowerCase().includes(q);
            });
            if (reactantMatch) return true;
            const productMatch = r.products?.some((product) => {
              const s = family.species.find(
                (sp) => sp.id === product.speciesId,
              );
              return s?.name?.toLowerCase().includes(q);
            });
            return productMatch;
          });

          if (
            !nameMatch &&
            !descMatch &&
            !ownerMatch &&
            !mechanismMatch &&
            !speciesMatch &&
            !reactionMatch
          ) {
            return null;
          }
        }

        return family;
      })
      .filter((f): f is Family => f !== null);
  }, [
    families,
    viewParam,
    speciesParam,
    reactionTypeParam,
    ownerParam,
    verifiedByParam,
    verifiedAfterParam,
    queryParam,
    user,
  ]);

  // Auto-open matching families when search is entered/updated, but allow user to collapse or expand them
  const autoOpenedForRef = useRef<string>("");

  useEffect(() => {
    const trimmedQuery = queryParam.trim();
    if (trimmedQuery.length > 0) {
      if (
        autoOpenedForRef.current !== queryParam &&
        filteredFamilies.length > 0
      ) {
        autoOpenedForRef.current = queryParam;
        const matchingIds = new Set<string>();
        filteredFamilies.forEach((f) => matchingIds.add(f.id));
        setOpenFamilyIds(matchingIds);
      }
    } else {
      if (autoOpenedForRef.current !== "") {
        autoOpenedForRef.current = "";
        setOpenFamilyIds(new Set());
      }
    }
  }, [queryParam, filteredFamilies]);

  const handleToggleExpand = (familyId: string) => {
    setOpenFamilyIds((prev) => {
      const next = new Set(prev);
      if (next.has(familyId)) {
        next.delete(familyId);
      } else {
        next.add(familyId);
      }
      return next;
    });
  };

  // Open Family in editor
  const handleOpenFamily = (family: Family, mechanism?: Mechanism) => {
    if (family.isInDatabase) {
      addUploadedFamilyIdLocally(family.id);
    }
    localStorage.setItem("selectedEditorFamilyId", family.id);
    if (mechanism) {
      localStorage.setItem("selectedEditorMechanismId", mechanism.id);
    } else {
      localStorage.removeItem("selectedEditorMechanismId");
    }
    const isOwner = Boolean(user && family.owner?.id === user.id);
    const isAdmin = user?.role?.toLowerCase() === "admin";
    const isContributor = Boolean(
      user?.id && family.contributorIds?.includes(user.id),
    );
    const canEdit = !family.isInDatabase || isOwner || isAdmin || isContributor;
    localStorage.setItem(
      "activeEditorFamily",
      JSON.stringify({
        id: family.id,
        name: family.name,
        mode: canEdit ? "editing" : "viewing",
      }),
    );
    navigate("/editor");
  };

  // Clone Family into draft and open in editor
  const handleCloneFamily = async (family: Family, mechanism?: Mechanism) => {
    const cloned = cloneFamily(family);
    if (user) {
      try {
        const uploaded = await uploadFamily(cloned, user);
        addUploadedFamilyIdLocally(uploaded.id);
        localStorage.setItem("selectedEditorFamilyId", uploaded.id);
        if (mechanism) {
          const match = uploaded.mechanisms.find((m) => m.name === mechanism.name);
          if (match) {
            localStorage.setItem("selectedEditorMechanismId", match.id);
          } else {
            localStorage.removeItem("selectedEditorMechanismId");
          }
        } else {
          localStorage.removeItem("selectedEditorMechanismId");
        }
        localStorage.setItem(
          "activeEditorFamily",
          JSON.stringify({
            id: uploaded.id,
            name: uploaded.name,
            mode: "editing",
          }),
        );
        navigate("/editor");
        return;
      } catch (err) {
        console.error("Failed to upload cloned family:", err);
      }
    }
    addFamilyLocally(cloned);
    localStorage.setItem("selectedEditorFamilyId", cloned.id);
    if (mechanism) {
      const match = cloned.mechanisms.find((m) => m.name === mechanism.name);
      if (match) {
        localStorage.setItem("selectedEditorMechanismId", match.id);
      } else {
        localStorage.removeItem("selectedEditorMechanismId");
      }
    } else {
      localStorage.removeItem("selectedEditorMechanismId");
    }
    localStorage.setItem(
      "activeEditorFamily",
      JSON.stringify({
        id: cloned.id,
        name: cloned.name,
        mode: "editing",
      }),
    );
    navigate("/editor");
  };

  // Active filters count and list for chips
  const activeFilters = useMemo(() => {
    const filters: Array<{
      key: string;
      label: string;
      onClear: () => void;
    }> = [];

    if (speciesParam) {
      filters.push({
        key: "species",
        label: `Species: ${speciesParam}`,
        onClear: () => updateUrlParams({ species: null }),
      });
    }
    if (reactionTypeParam) {
      filters.push({
        key: "reactionType",
        label: `Reaction: ${reactionTypeParam}`,
        onClear: () => updateUrlParams({ reactionType: null }),
      });
    }
    if (ownerParam) {
      filters.push({
        key: "owner",
        label: `Owner: ${ownerParam}`,
        onClear: () => updateUrlParams({ owner: null }),
      });
    }
    if (verifiedByParam) {
      filters.push({
        key: "verifiedBy",
        label: `Verified by: ${verifiedByParam}`,
        onClear: () => updateUrlParams({ verifiedBy: null }),
      });
    }
    if (verifiedAfterParam) {
      filters.push({
        key: "verifiedAfter",
        label: `Verified ≥ ${verifiedAfterParam}`,
        onClear: () => updateUrlParams({ verifiedAfter: null }),
      });
    }

    return filters;
  }, [
    speciesParam,
    reactionTypeParam,
    ownerParam,
    verifiedByParam,
    verifiedAfterParam,
  ]);

  const clearAllFilters = () => {
    updateUrlParams({
      species: null,
      reactionType: null,
      owner: null,
      verifiedBy: null,
      verifiedAfter: null,
    });
  };

  return (
    <div className="layout-dashboard">
      <header>
        <Header />
      </header>
      <Paper square component="section" className="content-dashboard">
        {/* Title & Subtitle */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Browse Families &amp; Mechanisms
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Chemical mechanism management
          </Typography>
        </Box>

        {fetchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {fetchError}
          </Alert>
        )}

        {/* Toolbar: Search, 3-way Switch, Filters toggle, Action buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
          }}
        >
          {/* Search Box */}
          <TextField
            size="small"
            placeholder="Search families, mechanisms, species, reactions..."
            value={queryParam}
            onChange={(e) => updateUrlParams({ q: e.target.value })}
            sx={{ flex: 1, minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: queryParam ? (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={() => updateUrlParams({ q: null })}
                    sx={{ minWidth: 0, p: 0.5 }}
                    aria-label="Clear search"
                  >
                    <ClearIcon fontSize="small" />
                  </Button>
                </InputAdornment>
              ) : null,
            }}
          />

          {/* 3-way View Switch: Verified (default once ready), All, Mine */}
          <ToggleButtonGroup
            value={viewParam}
            exclusive
            onChange={(_, nextView) => {
              if (nextView) {
                updateUrlParams({ view: nextView });
              }
            }}
            size="small"
            aria-label="View filter switch"
          >
            <ToggleButton value="verified" aria-label="Verified mechanisms">
              Verified
            </ToggleButton>
            <ToggleButton value="all" aria-label="All families">
              All
            </ToggleButton>
            <ToggleButton value="mine" aria-label="My families and drafts">
              Mine
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Filters Toggle Button */}
          <Badge
            color="primary"
            badgeContent={activeFilters.length}
            invisible={activeFilters.length === 0}
          >
            <Button
              variant={filtersOpen ? "contained" : "outlined"}
              size="small"
              startIcon={<FilterListIcon />}
              onClick={() => setFiltersOpen((prev) => !prev)}
              aria-label="Open filter options"
              aria-expanded={filtersOpen}
            >
              Filters
            </Button>
          </Badge>

          {/* Right of toolbar: New family and Import a file */}
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setFamilyCreationModalOpen(true)}
              aria-label="Create a new family"
            >
              New family
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadFileIcon />}
              onClick={() => setImportModalOpen(true)}
              aria-label="Import a file"
            >
              Import a file
            </Button>
          </Box>
        </Box>

        {/* Collapsible 5-Filter Panel */}
        <Collapse in={filtersOpen} unmountOnExit>
          <Card variant="outlined" sx={{ mb: 2, bgcolor: "background.paper" }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                Filters
              </Typography>
              <Grid container spacing={2}>
                {/* 1. Contains species */}
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Contains species"
                    placeholder="e.g. NO2"
                    value={speciesParam}
                    onChange={(e) =>
                      updateUrlParams({ species: e.target.value })
                    }
                  />
                </Grid>

                {/* 2. Reaction type */}
                <Grid item xs={12} sm={6} md={2.4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="reaction-type-label">
                      Reaction type
                    </InputLabel>
                    <Select
                      labelId="reaction-type-label"
                      label="Reaction type"
                      value={reactionTypeParam}
                      onChange={(e) =>
                        updateUrlParams({ reactionType: e.target.value })
                      }
                    >
                      <MenuItem value="">
                        <em>Any reaction type</em>
                      </MenuItem>
                      {REACTION_TYPE_OPTIONS.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* 3. Owner */}
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Owner"
                    placeholder="e.g. username"
                    value={ownerParam}
                    onChange={(e) => updateUrlParams({ owner: e.target.value })}
                  />
                </Grid>

                {/* 4. Verified by */}
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Verified by"
                    placeholder="e.g. verifier"
                    value={verifiedByParam}
                    onChange={(e) =>
                      updateUrlParams({ verifiedBy: e.target.value })
                    }
                  />
                </Grid>

                {/* 5. Verified on or after */}
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Verified on or after"
                    InputLabelProps={{ shrink: true }}
                    value={verifiedAfterParam}
                    onChange={(e) =>
                      updateUrlParams({ verifiedAfter: e.target.value })
                    }
                    sx={{
                      "& input[type='date']": {
                        colorScheme: (theme) => theme.palette.mode,
                      },
                      "& input[type='date']::-webkit-calendar-picker-indicator":
                        {
                          cursor: "pointer",
                          filter: (theme) =>
                            theme.palette.mode === "dark"
                              ? "invert(1)"
                              : "none",
                        },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Collapse>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Active filters:
            </Typography>
            {activeFilters.map((filter) => (
              <Chip
                key={filter.key}
                size="small"
                label={filter.label}
                onDelete={filter.onClear}
                color="primary"
                variant="outlined"
              />
            ))}
            {activeFilters.length > 1 && (
              <Button size="small" onClick={clearAllFilters} sx={{ ml: 1 }}>
                Clear all
              </Button>
            )}
          </Box>
        )}

        {/* Loading Indicator or Family List */}
        {loadingFamilies ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              gap: 2,
            }}
          >
            <CircularProgress size={32} />
            <Typography color="text.secondary">Loading families...</Typography>
          </Box>
        ) : filteredFamilies.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No families match your criteria.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try clearing filters or adjusting your search term.
            </Typography>
          </Box>
        ) : (
          <FamilyBrowser
            families={filteredFamilies}
            openFamilyIds={openFamilyIds}
            onToggleExpand={handleToggleExpand}
            onOpenFamily={handleOpenFamily}
            onCloneFamily={handleCloneFamily}
            onEditMechanism={(family, mechanism) =>
              handleOpenFamily(family, mechanism)
            }
            onCloneMechanism={(family, mechanism) =>
              handleCloneFamily(family, mechanism)
            }
          />
        )}

        {/* Link to Archived Versions page for all users */}
        <Box sx={{ mt: 4, mb: 2, textAlign: "center" }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/archived-versions")}
            sx={{ cursor: "pointer", fontWeight: "bold" }}
          >
            Show archived versions
          </Link>
        </Box>
      </Paper>

      {/* New Family Modal */}
      <FamilyCreationModal
        open={familyCreationModalOpen}
        onClose={() => setFamilyCreationModalOpen(false)}
        onSubmit={(newFamily) => {
          setFamilyCreationModalOpen(false);
          addFamilyLocally(newFamily);
          localStorage.setItem("selectedEditorFamilyId", newFamily.id);
          localStorage.removeItem("selectedEditorMechanismId");
          localStorage.setItem(
            "activeEditorFamily",
            JSON.stringify({
              id: newFamily.id,
              name: newFamily.name,
              mode: "editing",
            }),
          );
          navigate("/editor");
        }}
      />

      {/* Import File Modal */}
      <ImportFamilyModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSubmit={(importedFamily) => {
          setImportModalOpen(false);
          addFamilyLocally(importedFamily);
          localStorage.setItem("selectedEditorFamilyId", importedFamily.id);
          localStorage.removeItem("selectedEditorMechanismId");
          localStorage.setItem(
            "activeEditorFamily",
            JSON.stringify({
              id: importedFamily.id,
              name: importedFamily.name,
              mode: "editing",
            }),
          );
          navigate("/editor");
        }}
      />

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Dashboard;
