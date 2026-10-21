import { useState } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { UUID } from "crypto";
import { generateID } from "../../helpers/localFamilies";
import { Phase } from "../../types/chemistryModels";
import { PhaseCreationModal } from "../modals/PhaseCreationModal";
import { RowActionsButton } from "../RowActionsButton";
import { ViewProps } from "./ViewProps";
import { PhaseTable } from "./PhaseTable";

export const PhaseView = ({ family, updateFamily }: ViewProps) => {
  const [phaseCreationModalOpen, setPhaseCreationModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase>();

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

  const removePhase = (id: UUID) => {
    if (!family.phases.some((phase) => phase.id === id)) {
      return;
    }

    updateFamily({
      ...family,
      phases: family.phases.filter((phase) => phase.id !== id),
      mechanisms: family.mechanisms.map((mechanism) => ({
        ...mechanism,
        phaseIds: mechanism.phaseIds.filter((phaseId) => phaseId !== id),
      })),
      isModified: true,
    });
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
            handleEditButtonClick={() => {
              setSelectedPhase(family.phases.find((phase) => phase.id === id));
              setPhaseCreationModalOpen(true);
            }}
          />,
        ]}
        onAdd={() => {
          setSelectedPhase(undefined);
          setPhaseCreationModalOpen(true);
        }}
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
    </Box>
  );
};
