import { useState } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Reaction } from "../../types/chemistryModels";
import {
  ReactionEditorModal,
  type PhaseSpeciesAddition,
} from "../modals/ReactionEditorModal";
import { UUID } from "crypto";
import { generateID } from "../../helpers/localFamilies";
import { ViewProps } from "./ViewProps";
import { useFamilyValidation } from "./FamilyValidationContext";
import { ReactionsTable } from "./ReactionsTable";
import { setGasPhase, SetGasPhaseButton } from "./SetGasPhaseButton";
import {
  countOf,
  DeleteSelectedButton,
  EditSelectedButton,
} from "./SelectionButtons";
import { removeReactions } from "../../helpers/editorHelpers";

export const ReactionsView = ({ family, updateFamily }: ViewProps) => {
  const { byItem } = useFamilyValidation();
  const [reactionsEditorOpen, setReactionsEditorOpen] =
    useState<boolean>(false);
  const [selectedReaction, setSelectedReaction] = useState<Reaction>();

  const createReaction = () => {
    const frontendId: UUID = generateID();
    const reaction: Reaction = {
      id: frontendId,
      name: "",
      description: "",
      type: "ARRHENIUS",
      reactants: [],
      products: [],
      attributes: {},
    };
    setSelectedReaction(reaction);
    setReactionsEditorOpen(true);
  };

  const updateReaction = (
    reaction: Reaction,
    phaseSpeciesAdditions: Array<PhaseSpeciesAddition> = [],
  ) => {
    const reactionList = [...family.reactions];
    const existingIndex = reactionList.findIndex(
      (element) => element.id === reaction.id,
    );

    if (existingIndex >= 0) {
      reactionList[existingIndex] = { ...reaction };
    } else {
      reactionList.unshift({ ...reaction });
    }

    updateFamily({
      ...family,
      reactions: reactionList,
      phases: family.phases.map((phase) =>
        phaseSpeciesAdditions.some((addition) => addition.phaseId === phase.id)
          ? {
              ...phase,
              speciesIds: [
                ...new Set([
                  ...phase.speciesIds,
                  ...phaseSpeciesAdditions
                    .filter((addition) => addition.phaseId === phase.id)
                    .flatMap((addition) => addition.speciesIds),
                ]),
              ],
            }
          : phase,
      ),
    });
  };

  const editReaction = (id: UUID) => {
    setSelectedReaction(family.reactions.find((element) => element.id === id));
    setReactionsEditorOpen(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          columnGap: "0.5rem",
        }}
      >
        <Typography color="textPrimary" variant="h6">
          Chemical Reactions
        </Typography>
        <Tooltip
          title="Chemical reactions consist of reactants which create products 
            during a certain phase. They can also be tuned with specific parameters given by the 
            reaction type."
        >
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <ReactionsTable
        issues={byItem}
        // The checkboxes select the reactions for these actions. A
        // double-click on a row also opens its editor.
        selectionActions={(ids, clearSelection) => (
          <>
            {ids.length === 1 && (
              <EditSelectedButton
                testId="edit-reaction-button"
                onClick={() => editReaction(ids[0])}
              />
            )}
            <SetGasPhaseButton
              family={family}
              reactionIds={ids}
              onSet={(phaseId, addMissingSpecies) => {
                updateFamily(
                  setGasPhase(family, ids, phaseId, addMissingSpecies),
                );
                clearSelection();
              }}
            />
            <DeleteSelectedButton
              testId="delete-reactions-button"
              message={`This deletes ${countOf(ids.length, "reaction", "reactions")} from the family and from all its mechanisms.`}
              onDelete={() => {
                updateFamily(removeReactions(family, ids));
                clearSelection();
              }}
            />
          </>
        )}
        reactions={family.reactions}
        phases={family.phases}
        species={family.species}
        onRowUpdate={updateReaction}
        onAdd={createReaction}
        onEdit={editReaction}
      />
      <ReactionEditorModal
        open={reactionsEditorOpen}
        onClose={() => {
          setReactionsEditorOpen(false);
          setSelectedReaction(undefined);
        }}
        onUpdate={updateReaction}
        reaction={selectedReaction}
        family={family}
      />
    </Box>
  );
};
