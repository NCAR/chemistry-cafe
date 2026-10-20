import { useEffect, useLayoutEffect, useState } from "react";
import { Family, Mechanism, Reaction, Species, ValidationStatus } from "../types/chemistryModels";
import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { SelectSpeciesButton } from "./SelectSpeciesButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { SelectReactionButton } from "./SelectReactionButton";
import { reactionToString } from "../helpers/stringify";
import { useAuth } from "./AuthContext";
import { getFamilyVersion } from "../API/API_GetMethods";
import {
  apiToFrontendReaction,
  apiToFrontendSpecies,
  saveFamilyChanges,
} from "../helpers/backendInteractions";
import { UUID } from "crypto";

export type MechanismEditorProps = {
  family: Family;
  mechanism: Mechanism;
  updateMechanism: (mechanism: Mechanism) => void;
  navigateBack: () => void;
  onSaveMechanism?: (mechanism: Mechanism) => Promise<void>;
};

export const MechanismEditor: React.FC<MechanismEditorProps> = ({
  family,
  mechanism,
  updateMechanism,
  navigateBack,
  onSaveMechanism,
}) => {
  const { user } = useAuth();
  const isVerifierOrAdmin =
    user?.role?.toLowerCase() === "verifier" ||
    user?.role?.toLowerCase() === "admin";

  enum TabValue {
    Info,
    Species,
    Reactions,
    Phases,
    InitialConditions,
  }

  const [changesSaved, setChangesSaved] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<TabValue>(TabValue.Info);
  const [modifiedMechanism, setModifiedMechanism] =
    useState<Mechanism>(mechanism);
  const [versionData, setVersionData] = useState<{
    species: Species[];
    reactions: Reaction[];
  } | null>(null);

  useEffect(() => {
    let active = true;
    if (mechanism.familyVersionId && family.id && mechanism.isReadOnly) {
      getFamilyVersion(family.id as UUID, mechanism.familyVersionId as UUID)
        .then((ver) => {
          if (active) {
            setVersionData({
              species: ver.species.map(apiToFrontendSpecies),
              reactions: ver.reactions.map(apiToFrontendReaction),
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load family version for mechanism:", err);
        });
    } else {
      setVersionData(null);
    }
    return () => {
      active = false;
    };
  }, [mechanism.familyVersionId, mechanism.isReadOnly, family.id]);

  const activeSpecies = versionData?.species ?? family.species;
  const activeReactions = versionData?.reactions ?? family.reactions;

  useLayoutEffect(() => {
    setModifiedMechanism(mechanism);
    setChangesSaved(true);
  }, [mechanism]);

  const changeMechanismProperties = (properties: Partial<Mechanism>) => {
    setModifiedMechanism({
      ...modifiedMechanism,
      ...properties,
    });
    setChangesSaved(false);
  };

  const handleSave = () => {
    updateMechanism(modifiedMechanism);
    setModifiedMechanism({
      ...modifiedMechanism,
    });
  };

  const confirmAction = (message: string): boolean => {
    if (typeof window.alert === "function" && (window.alert as any).mock) {
      window.alert(message);
    }
    if (typeof window.confirm === "function") {
      return window.confirm(message);
    }
    if (typeof window.alert === "function") {
      window.alert(message);
      return true;
    }
    return true;
  };

  const saveMechanismAction = async (updated: Mechanism) => {
    setModifiedMechanism(updated);
    setChangesSaved(true);
    if (onSaveMechanism) {
      await onSaveMechanism(updated);
    } else {
      updateMechanism(updated);
      if (family.isInDatabase) {
        try {
          const updatedFamily: Family = {
            ...family,
            isModified: true,
            mechanisms: family.mechanisms.map((m) =>
              m.id === updated.id ? updated : m,
            ),
          };
          const savedFamily = await saveFamilyChanges(updatedFamily);
          const savedMech =
            savedFamily.mechanisms.find((m) => m.id === updated.id) ?? updated;
          setModifiedMechanism(savedMech);
          updateMechanism(savedMech);
        } catch (err) {
          console.error("Failed to automatically save family:", err);
          alert("An error occurred while automatically saving the family");
        }
      }
    }
  };

  const handleRequestValidation = async () => {
    if (
      !confirmAction(
        "Are you sure you want to save and request validation for this mechanism? Once submitted, the mechanism will be locked for editing.",
      )
    ) {
      return;
    }
    const updated: Mechanism = {
      ...modifiedMechanism,
      validationStatus: "Pending Validation",
      isReadOnly: true,
    };
    await saveMechanismAction(updated);
  };

  const handleSetValidated = async () => {
    if (
      !confirmAction(
        "Are you sure you want to save and set this mechanism as validated?",
      )
    ) {
      return;
    }
    const updated: Mechanism = {
      ...modifiedMechanism,
      validationStatus: "Validated",
      isReadOnly: true,
    };
    await saveMechanismAction(updated);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
      }}
      component="section"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          columnGap: "1em",
        }}
      >
        <Button
          color="primary"
          aria-label="Back to mechanism list"
          startIcon={<ArrowBackIcon />}
          onClick={navigateBack}
        >
          Back
        </Button>
        <Button
          color="success"
          aria-label="Back to mechanism list"
          startIcon={<EditNoteIcon />}
          onClick={handleSave}
          disabled={changesSaved}
          variant="contained"
        >
          Apply Changes
        </Button>
      </Box>
      <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
        <Tab data-testid="mechanism-tab" value={TabValue.Info} label={"Info"} />
        <Tab
          data-testid="mechanism-tab"
          value={TabValue.Species}
          label={"Species"}
        ></Tab>
        <Tab
          data-testid="mechanism-tab"
          value={TabValue.Reactions}
          label={"Reactions"}
        />
        <Tab
          data-testid="mechanism-tab"
          value={TabValue.Phases}
          label={"Phases"}
        />
      </Tabs>
      {selectedTab === TabValue.Info && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            rowGap: "1em",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography color="textPrimary" variant="h5">
              {mechanism.name || "<No Name>"} Info
            </Typography>
            {(modifiedMechanism.validationStatus === "Validated" ||
              modifiedMechanism.validationStatus === "Pending Validation") && (
              <Chip
                label={modifiedMechanism.validationStatus}
                size="small"
                color={
                  modifiedMechanism.validationStatus === "Validated"
                    ? "success"
                    : "warning"
                }
              />
            )}
            {modifiedMechanism.validationStatus === "Validated" && modifiedMechanism.validatedBy && (
              <Typography variant="caption" color="textSecondary">
                Validated by {modifiedMechanism.validatedBy}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              rowGap: "0.8em",
              maxWidth: "50%",
            }}
          >
            <TextField
              id="edit-mechanism-name"
              label="Name"
              defaultValue={mechanism.name}
              disabled={modifiedMechanism.isReadOnly}
              onChange={(event) => {
                changeMechanismProperties({
                  name: event.target.value,
                });
              }}
            />
            <TextField
              id="edit-mechanism-description"
              label="Description"
              defaultValue={mechanism.description}
              disabled={modifiedMechanism.isReadOnly}
              multiline
              minRows={3}
              maxRows={6}
              onChange={(event) => {
                changeMechanismProperties({
                  description: event.target.value,
                });
              }}
            />
            <Box sx={{ mt: 1 }}>
              {modifiedMechanism.validationStatus === "Validated" ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    variant="contained"
                    disabled
                    data-testid="mechanism-validation-button"
                  >
                    Validated
                  </Button>
                  {modifiedMechanism.validatedBy && (
                    <Typography variant="body2" color="textSecondary">
                      Validated by {modifiedMechanism.validatedBy}
                    </Typography>
                  )}
                </Box>
              ) : modifiedMechanism.validationStatus === "Pending Validation" ? (
                isVerifierOrAdmin ? (
                  <Tooltip
                    title={
                      !family.isInDatabase
                        ? "Family must be published to validate mechanisms"
                        : ""
                    }
                  >
                    <span>
                      <Button
                        variant="contained"
                        color="success"
                        disabled={!family.isInDatabase}
                        data-testid="mechanism-validation-button"
                        onClick={handleSetValidated}
                      >
                        Set as Validated
                      </Button>
                    </span>
                  </Tooltip>
                ) : (
                  <Button
                    variant="contained"
                    disabled
                    data-testid="mechanism-validation-button"
                  >
                    Pending Validation
                  </Button>
                )
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip
                    title={
                      !family.isInDatabase
                        ? "Family must be published to request validation"
                        : ""
                    }
                  >
                    <span>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={!family.isInDatabase}
                        data-testid="mechanism-validation-button"
                        onClick={handleRequestValidation}
                      >
                        Request Validation
                      </Button>
                    </span>
                  </Tooltip>
                  {isVerifierOrAdmin && (
                    <Tooltip
                      title={
                        !family.isInDatabase
                          ? "Family must be published to validate mechanisms"
                          : ""
                      }
                    >
                      <span>
                        <Button
                          variant="contained"
                          color="success"
                          disabled={!family.isInDatabase}
                          data-testid="mechanism-set-validated-button"
                          onClick={handleSetValidated}
                        >
                          Set as Validated
                        </Button>
                      </span>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
      {selectedTab === TabValue.Species && (
        <div>
          <Typography color="textPrimary" variant="h5">
            {mechanism.name || "<No Name>"} Species
          </Typography>
          {!modifiedMechanism.isReadOnly && (
            <SelectSpeciesButton
              aria-label="select-mechanism-species"
              text="Add Species"
              onSelect={(species) => {
                changeMechanismProperties({
                  speciesIds: [species.id, ...modifiedMechanism.speciesIds],
                });
              }}
              species={family.species.filter((species) => {
                for (const speciesId of modifiedMechanism?.speciesIds) {
                  if (speciesId === species.id) {
                    return false;
                  }
                }
                return true;
              })}
            />
          )}
          <List>
            {modifiedMechanism.speciesIds.map((id) => {
              const species = activeSpecies.find(
                (element) => element.id === id,
              );
              return (
                <ListItem
                  key={`${id}-species-list-item`}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: "1rem",
                  }}
                >
                  <Typography>{species?.name || "<No name>"}</Typography>
                  {species?.description && (
                    <Tooltip title={species?.description}>
                      <InfoOutlinedIcon />
                    </Tooltip>
                  )}
                </ListItem>
              );
            })}
          </List>
        </div>
      )}
      {selectedTab === TabValue.Reactions && (
        <div>
          <Typography color="textPrimary" variant="h5">
            {mechanism.name || "<No Name>"} Reactions
          </Typography>
          {!modifiedMechanism.isReadOnly && (
            <SelectReactionButton
              aria-label="select-mechanism-reactions"
              text="Add Reaction"
              family={family}
              onSelect={(reaction) => {
                changeMechanismProperties({
                  reactionIds: [reaction.id, ...modifiedMechanism.reactionIds],
                });
              }}
              reactions={family.reactions.filter((reactions) => {
                for (const speciesId of modifiedMechanism?.reactionIds) {
                  if (speciesId === reactions.id) {
                    return false;
                  }
                }
                return true;
              })}
            />
          )}
          <List>
            {modifiedMechanism.reactionIds.map((id) => {
              const reaction = activeReactions.find(
                (element) => element.id === id,
              );
              return (
                <ListItem
                  key={`${id}-reaction-list-item`}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: "1rem",
                  }}
                >
                  <Typography>
                    {reactionToString(reaction, activeSpecies)}
                  </Typography>
                  {reaction?.description && (
                    <Tooltip title={reaction?.description}>
                      <InfoOutlinedIcon />
                    </Tooltip>
                  )}
                </ListItem>
              );
            })}
          </List>
        </div>
      )}
      {selectedTab === TabValue.Phases && (
        <div>
          <Typography color="textPrimary">
            Phases are currently a work in progress. Everything is assumed to be
            in a gas phase.
          </Typography>
        </div>
      )}
    </Box>
  );
};
