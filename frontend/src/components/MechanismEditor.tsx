import { useLayoutEffect, useMemo, useState } from "react";
import { Family, Mechanism } from "../types/chemistryModels";
import {
  Box,
  Button,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditNoteIcon from "@mui/icons-material/EditNote";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { SelectSpeciesButton } from "./SelectSpeciesButton";
import { SelectReactionButton } from "./SelectReactionButton";
import { SelectPhaseButton } from "./SelectPhaseButton";
import { SpeciesTable } from "./familyEditor/SpeciesTable";
import { ReactionsTable } from "./familyEditor/ReactionsTable";
import { PhaseTable } from "./familyEditor/PhaseTable";

export type MechanismEditorProps = {
  family: Family;
  mechanism: Mechanism;
  updateMechanism: (mechanism: Mechanism) => void;
  navigateBack: () => void;
};

/**
 * Gives the items with the given IDs, in the order of the IDs. An ID without
 * an item gives no row, and an ID that repeats gives one row, because a table
 * needs one row for each ID.
 */
const itemsWithIds = <T extends { id: string }>(
  items: Array<T>,
  ids: Array<T["id"]>,
): Array<T> => {
  const byId = new Map<T["id"], T>(items.map((item) => [item.id, item]));
  return [...new Set(ids)].flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
};

/**
 * The row action of the tables in this editor. It takes the item out of the
 * mechanism, and the family keeps the item.
 */
const RemoveFromMechanismButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <Tooltip title={label} disableInteractive>
    <GridActionsCellItem
      aria-label={label}
      data-testid="remove-from-mechanism-button"
      icon={<RemoveCircleOutlineIcon />}
      label={label}
      onClick={onClick}
    />
  </Tooltip>
);

export const MechanismEditor: React.FC<MechanismEditorProps> = ({
  family,
  mechanism,
  updateMechanism,
  navigateBack,
}) => {
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

  useLayoutEffect(() => {
    setModifiedMechanism(mechanism);
    setChangesSaved(true);
  }, [mechanism]);

  // The rows of the tables: the family items that the mechanism contains.
  const mechanismSpecies = useMemo(
    () => itemsWithIds(family.species, modifiedMechanism.speciesIds),
    [family.species, modifiedMechanism.speciesIds],
  );
  const mechanismReactions = useMemo(
    () => itemsWithIds(family.reactions, modifiedMechanism.reactionIds),
    [family.reactions, modifiedMechanism.reactionIds],
  );
  const mechanismPhases = useMemo(
    () => itemsWithIds(family.phases, modifiedMechanism.phaseIds),
    [family.phases, modifiedMechanism.phaseIds],
  );

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
          <Typography color="textPrimary" variant="h5">
            {mechanism.name || "<No Name>"} Info
          </Typography>
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
              multiline
              minRows={3}
              maxRows={6}
              onChange={(event) => {
                changeMechanismProperties({
                  description: event.target.value,
                });
              }}
            />
          </Box>
        </Box>
      )}
      {selectedTab === TabValue.Species && (
        <div>
          <Typography color="textPrimary" variant="h5">
            {mechanism.name || "<No Name>"} Species
          </Typography>
          <SpeciesTable
            species={mechanismSpecies}
            getRowActions={(id) => [
              <RemoveFromMechanismButton
                label="Remove species from mechanism"
                onClick={() =>
                  changeMechanismProperties({
                    speciesIds: modifiedMechanism.speciesIds.filter(
                      (speciesId) => speciesId !== id,
                    ),
                  })
                }
              />,
            ]}
            customToolbarActions={
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
            }
          />
        </div>
      )}
      {selectedTab === TabValue.Reactions && (
        <div>
          <Typography color="textPrimary" variant="h5">
            {mechanism.name || "<No Name>"} Reactions
          </Typography>
          <ReactionsTable
            reactions={mechanismReactions}
            species={family.species}
            getRowActions={(id) => [
              <RemoveFromMechanismButton
                label="Remove reaction from mechanism"
                onClick={() =>
                  changeMechanismProperties({
                    reactionIds: modifiedMechanism.reactionIds.filter(
                      (reactionId) => reactionId !== id,
                    ),
                  })
                }
              />,
            ]}
            customToolbarActions={
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
            }
          />
        </div>
      )}
      {selectedTab === TabValue.Phases && (
        <div>
          <Typography color="textPrimary" variant="h5">
            {mechanism.name || "<No Name>"} Phases
          </Typography>
            <PhaseTable
              phases={mechanismPhases}
              species={family.species}
              getRowActions={(id) => [
                <RemoveFromMechanismButton
                  label="Remove phase from mechanism"
                  onClick={() =>
                    changeMechanismProperties({
                      phaseIds: modifiedMechanism.phaseIds.filter(
                        (phaseId) => phaseId !== id,
                      ),
                    })
                  }
                />,
              ]}
              customToolbarActions={
                  <SelectPhaseButton
                    aria-label="select-mechanism-phases"
                    text="Add Phase"
                    onSelect={(phase) => {
                      changeMechanismProperties({
                        phaseIds: [phase.id, ...modifiedMechanism.phaseIds],
                      });
                    }}
                    phases={family.phases.filter(
                      (phase) => !modifiedMechanism.phaseIds.includes(phase.id),
                    )}
                  />
                }
            />
        </div>
      )}
    </Box>
  );
};
