import { useState } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { UUID } from "crypto";
import { generateID } from "../../helpers/localFamilies";
import { Phase } from "../../types/chemistryModels";
import { PhaseCreationModal } from "../modals/PhaseCreationModal";
import { ConfirmActionModal } from "../modals/ConfirmActionModal";
import { RowActionsButton } from "../RowActionsButton";
import { ViewProps } from "./ViewProps";
import { PhaseTable } from "./PhaseTable";

export const PhaseView = ({ family, updateFamily }: ViewProps) => {
  const [phaseCreationModalOpen, setPhaseCreationModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase>();
  const [pendingPhaseUpdate, setPendingPhaseUpdate] = useState<{
    phase: Phase;
    reactionIds: UUID[];
  } | null>(null);
  const [pendingPhaseDelete, setPendingPhaseDelete] = useState<Phase | null>(
    null,
  );

  const updatePhase = (
    name: string,
    description: string | null,
    speciesIds: UUID[],
    diffusionCoefficients: Record<UUID, number>,
  ) => {
    const phase: Phase = {
      id: selectedPhase?.id ?? generateID(),
      name,
      description,
      speciesIds,
      diffusionCoefficients,
    };

    const removedSpeciesIds = new Set(
      (selectedPhase?.speciesIds ?? []).filter(
        (speciesId) => !speciesIds.includes(speciesId),
      ),
    );
    const affectedReactions = selectedPhase
      ? family.reactions.filter(
          (reaction) =>
            reaction.gasPhaseId === selectedPhase.id &&
            [
              ...reaction.reactants.map((entry) => entry.speciesId),
              ...reaction.products.map((entry) => entry.speciesId),
              reaction.gasPhaseSpeciesId,
            ].some(
              (speciesId) =>
                speciesId !== undefined && removedSpeciesIds.has(speciesId),
            ),
        )
      : [];

    if (affectedReactions.length > 0) {
      setPendingPhaseUpdate({
        phase,
        reactionIds: affectedReactions.map((reaction) => reaction.id),
      });
      setPhaseCreationModalOpen(false);
      setSelectedPhase(undefined);
      return;
    }

    updateFamily({
      ...family,
      phases: selectedPhase
        ? family.phases.map((existing) =>
            existing.id === phase.id ? phase : existing,
          )
        : [phase, ...family.phases],
    });
    setPhaseCreationModalOpen(false);
    setSelectedPhase(undefined);
  };

  const confirmPhaseUpdate = () => {
    if (!pendingPhaseUpdate) {
      return;
    }

    const reactionIds = new Set(pendingPhaseUpdate.reactionIds);
    updateFamily({
      ...family,
      phases: family.phases.map((phase) =>
        phase.id === pendingPhaseUpdate.phase.id
          ? pendingPhaseUpdate.phase
          : phase,
      ),
      reactions: family.reactions.filter(
        (reaction) => !reactionIds.has(reaction.id),
      ),
      mechanisms: family.mechanisms.map((mechanism) => ({
        ...mechanism,
        reactionIds: mechanism.reactionIds.filter(
          (reactionId) => !reactionIds.has(reactionId),
        ),
      })),
      isModified: true,
    });
    setPendingPhaseUpdate(null);
  };

  // An in-cell edit of the name or the description. An empty name keeps the
  // old name, because a phase must have a name.
  const handlePhaseRowUpdate = (updatedPhase: Phase, originalPhase: Phase) => {
    const name = updatedPhase.name.trim();
    if (!name) {
      return originalPhase;
    }
    const phase: Phase = {
      ...updatedPhase,
      name,
      description: updatedPhase.description?.trim() || null,
    };

    updateFamily({
      ...family,
      phases: family.phases.map((existing) =>
        existing.id === phase.id ? phase : existing,
      ),
    });
    return phase;
  };

  const deletePhase = (phase: Phase) => {
    updateFamily({
      ...family,
      phases: family.phases.filter((existing) => existing.id !== phase.id),
      reactions: family.reactions.map((reaction) =>
        reaction.gasPhaseId === phase.id
          ? {
              ...reaction,
              gasPhaseId:
                reaction.gasPhaseId === phase.id
                  ? undefined
                  : reaction.gasPhaseId,
            }
          : reaction,
      ),
      mechanisms: family.mechanisms.map((mechanism) => ({
        ...mechanism,
        phaseIds: mechanism.phaseIds.filter((phaseId) => phaseId !== phase.id),
      })),
      isModified: true,
    });
  };

  const removePhase = (id: UUID) => {
    const phase = family.phases.find((existing) => existing.id === id);
    if (!phase) {
      return;
    }

    const phaseIsUsedByReaction = family.reactions.some(
      (reaction) =>
        reaction.gasPhaseId === id,
    );
    if (phaseIsUsedByReaction) {
      setPendingPhaseDelete(phase);
      return;
    }

    deletePhase(phase);
  };

  const pendingPhaseReactionCount = pendingPhaseDelete
    ? family.reactions.filter(
        (reaction) =>
          reaction.gasPhaseId === pendingPhaseDelete.id,
      ).length
    : 0;

  const editPhase = (id: UUID) => {
    setSelectedPhase(family.phases.find((phase) => phase.id === id));
    setPhaseCreationModalOpen(true);
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
          Phases
        </Typography>
        <Tooltip title="Species can be assigned to one or more phases in a model.">
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <PhaseTable
        phases={family.phases}
        species={family.species}
        getRowActions={(id) => [
          <RowActionsButton
            key={id}
            handleDeleteButtonClick={() => removePhase(id)}
            handleEditButtonClick={() => editPhase(id)}
          />,
        ]}
        onRowUpdate={handlePhaseRowUpdate}
        onAdd={() => {
          setSelectedPhase(undefined);
          setPhaseCreationModalOpen(true);
        }}
        onEdit={editPhase}
      />
      <PhaseCreationModal
        open={phaseCreationModalOpen}
        onClose={() => {
          setPhaseCreationModalOpen(false);
          setSelectedPhase(undefined);
        }}
        onSubmit={updatePhase}
        phase={selectedPhase}
        species={family.species}
      />
      <ConfirmActionModal
        open={pendingPhaseUpdate !== null}
        onClose={() => setPendingPhaseUpdate(null)}
        onAction={confirmPhaseUpdate}
        message="Removed species are used in reactions in this phase."
        subtitle={`Saving this phase change will remove ${pendingPhaseUpdate?.reactionIds.length ?? 0} affected reaction${pendingPhaseUpdate?.reactionIds.length === 1 ? "" : "s"} from the family and any mechanisms that reference them.`}
        confirmColor="error"
        confirmLabel="Remove reactions and save phase"
      />
      <ConfirmActionModal
        open={pendingPhaseDelete !== null}
        onClose={() => setPendingPhaseDelete(null)}
        onAction={() => {
          if (pendingPhaseDelete) {
            deletePhase(pendingPhaseDelete);
            setPendingPhaseDelete(null);
          }
        }}
        message={`This phase is used by ${pendingPhaseReactionCount} reaction${
          pendingPhaseReactionCount === 1 ? "" : "s"
        }.`}
        subtitle="Deleting it will clear the phase assignment from those reactions. Their reactants and products will be kept."
        confirmColor="error"
        confirmLabel="Delete phase"
      />
    </Box>
  );
};
