import { useLayoutEffect, useMemo, useState } from "react";
import { Family, Mechanism, Phase, Reaction } from "../types/chemistryModels";
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
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from '@mui/icons-material/Delete';
import { bySpeciesName } from "./SelectSpeciesButton";
import { SpeciesTable } from "./familyEditor/SpeciesTable";
import { ReactionsTable } from "./familyEditor/ReactionsTable";
import { PhaseTable } from "./familyEditor/PhaseTable";
import { MechanismSearchModal } from "./modals/MechanismEditorSearchModal";
import { reactionToString } from "../helpers/stringify";

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
      icon={<DeleteIcon/>}
      label={label}
      onClick={onClick}
    />
  </Tooltip>
);

/**
 * The panel of a tab with a table. It fills the height under the tabs, so the
 * table scrolls inside it and the page does not grow with the rows. The
 * minimum height of 0 lets the panel become smaller than its table.
 */
const tablePanelSx = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
} as const;

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
  const [speciesOpen, setSpeciesOpen] = useState<boolean>(false);
  const [reactionsOpen, setReactionsOpen] = useState<boolean>(false);
  const [phasesOpen, setPhasesOpen] = useState<boolean>(false);

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

  // Sorts text in alphabetical order. Numbers in the text sort by value, so
  // "P2" comes before "P10". This is the same rule as bySpeciesName.
  const byText = (a: string, b: string) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

  // The choices of the add dialogs: the family items that the mechanism does
  // not contain yet. The species are in alphabetical order.
  const availableSpecies = family.species
    .filter((species) => !modifiedMechanism.speciesIds.includes(species.id))
    .sort(bySpeciesName);
  const availableReactions = family.reactions
    .filter((reaction) => !modifiedMechanism.reactionIds.includes(reaction.id))
    .sort((a:Reaction, b:Reaction) =>
      byText(
        reactionToString(a, family.species),
        reactionToString(b, family.species),
      ),
    );
  const availablePhases = family.phases
    .filter((phase) => !modifiedMechanism.phaseIds.includes(phase.id))
    .sort((a:Phase, b:Phase) => 
      byText(a.name, b.name),
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
        minHeight: 0,
        flex: 1,
        display: "flex",
        flexDirection: "column",
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
        <Box sx={tablePanelSx}>
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
              <Button
                aria-label="select-mechanism-species"
                onClick={() => setSpeciesOpen(true)}
                startIcon={<AddIcon />}
                color="primary"
                sx={{ alignSelf: "flex-start" }}
              >
                <Typography variant="caption">Add Species</Typography>
            </Button>
            }
          />
          <MechanismSearchModal
            open={speciesOpen}
            noun="Species"
            items={availableSpecies}
            onClose={() => setSpeciesOpen(false)}
            onSubmit={(ids) => {
              setSpeciesOpen(false);
              changeMechanismProperties({
                speciesIds: [...ids, ...modifiedMechanism.speciesIds],
              });
            }}
          />
        </Box>
      )}
      {selectedTab === TabValue.Reactions && (
        <Box sx={tablePanelSx}>
          <Typography color="textPrimary" variant="h5">
            {mechanism.name || "<No Name>"} Reactions
          </Typography>
          <ReactionsTable
            reactions={mechanismReactions}
            phases={family.phases}
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
              <Button
                aria-label="select-mechanism-reactions"
                onClick={() => setReactionsOpen(true)}
                startIcon={<AddIcon />}
                color="primary"
                sx={{ alignSelf: "flex-start" }}
              >
                <Typography variant="caption">Add Reaction</Typography>
            </Button>
            }
          />
          <MechanismSearchModal
            open={reactionsOpen}
            noun="Reactions"
            items={availableReactions}
            // A reaction usually has no name, so the list shows its equation.
            getLabel={(reaction) => reactionToString(reaction, family.species)}
            minItemWidth="320px"
            onClose={() => setReactionsOpen(false)}
            onSubmit={(ids) => {
              setReactionsOpen(false);
              changeMechanismProperties({
                reactionIds: [...ids, ...modifiedMechanism.reactionIds],
              });
            }}
          />
        </Box>
      )}
      {selectedTab === TabValue.Phases && (
        <Box sx={tablePanelSx}>
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
              <Button
                aria-label="select-mechanism-phases"
                onClick={() => setPhasesOpen(true)}
                startIcon={<AddIcon />}
                color="primary"
                sx={{ alignSelf: "flex-start" }}
              >
                <Typography variant="caption">Add Phase</Typography>
            </Button>
            }
          />
          <MechanismSearchModal
            open={phasesOpen}
            noun="Phases"
            items={availablePhases}
            onClose={() => setPhasesOpen(false)}
            onSubmit={(ids) => {
              setPhasesOpen(false);
              changeMechanismProperties({
                phaseIds: [...ids, ...modifiedMechanism.phaseIds],
              });
            }}
          />
        </Box>
      )}
    </Box>
  );
};
