import { useState } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FunctionsIcon from "@mui/icons-material/Functions";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridRenderCellParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import {
  Reaction,
  reactionAttributeOptions,
  ReactionTypeName,
} from "../../types/chemistryModels";
import {
  reactionToString,
  reactionTypeToString,
} from "../../helpers/stringify";
import { useCustomTheme } from "../CustomThemeContext";
import {
  ReactionEditorModal,
  type PhaseSpeciesAddition,
} from "../modals/ReactionEditorModal";
import { RowActionsButton } from "../RowActionsButton";
import { UUID } from "crypto";
import { generateID } from "../../helpers/localFamilies";
import { ViewProps } from "./ViewProps";
import { ReactionsTable } from "./ReactionsTable";

export const ReactionsView = ({ family, updateFamily }: ViewProps) => {
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

  const removeReaction = (id: UUID) => {
    const originalReaction: Reaction | undefined = family.reactions.find(
      (value) => value.id === id,
    );
    if (!originalReaction) {
      return;
    }

    updateFamily({
      ...family,
      reactions: family.reactions.filter((element) => element.id !== id),
      // Strip the removed reaction from any mechanism that referenced it.
      mechanisms: family.mechanisms.map((mechanism) => ({
        ...mechanism,
        reactionIds: mechanism.reactionIds.filter((rid) => rid !== id),
      })),
      isModified: true,
    });
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
    setSelectedReaction(
      family.reactions.find((element) => element.id === id)
    );
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
        <Tooltip title="Chemical reactions consist of reactants which create products 
            during a certain phase. They can also be tuned with specific parameters given by the 
            reaction type."
        >
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <ReactionsTable
        reactions={family.reactions}
        phases={family.phases}
        species={family.species}
        getRowActions={(id) => [
          <RowActionsButton
            handleDeleteButtonClick={() => {
              removeReaction(id);
            }}
            handleEditButtonClick={() => editReaction(id)}
          />,
        ]}
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
