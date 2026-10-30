import { useState } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import { UUID } from "crypto";
import { generateID } from "../../helpers/localFamilies";
import { Phase } from "../../types/chemistryModels";
import { PhaseCreationModal } from "../modals/PhaseCreationModal";
import { ConfirmActionModal } from "../modals/ConfirmActionModal";
import { RowActionsButton } from "../RowActionsButton";
import { useCustomTheme } from "../CustomThemeContext";
import { ViewProps } from "./ViewProps";
import { DataViewToolbar, useVisibleRows } from "./DataViewToolbar";

export const PhaseView = ({ family, updateFamily }: ViewProps) => {
  const { theme } = useCustomTheme();
  const apiRef = useGridApiRef();
  const visibleRows = useVisibleRows(apiRef);
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
              reaction.aerosolPhaseSpeciesId,
              reaction.aerosolPhaseWaterId,
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
        reaction.gasPhaseId === phase.id || reaction.aerosolPhaseId === phase.id
          ? {
              ...reaction,
              gasPhaseId:
                reaction.gasPhaseId === phase.id
                  ? undefined
                  : reaction.gasPhaseId,
              aerosolPhaseId:
                reaction.aerosolPhaseId === phase.id
                  ? undefined
                  : reaction.aerosolPhaseId,
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
        reaction.gasPhaseId === id || reaction.aerosolPhaseId === id,
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
          reaction.gasPhaseId === pendingPhaseDelete.id ||
          reaction.aerosolPhaseId === pendingPhaseDelete.id,
      ).length
    : 0;

  const phaseColumns: GridColDef[] = [
    {
      field: "Row Actions",
      type: "actions",
      headerClassName: "roleDataHeader",
      cellClassName: "actions",
      disableColumnMenu: true,
      getActions: ({ id }) => [
        <RowActionsButton
          key={id}
          handleDeleteButtonClick={() => removePhase(id as UUID)}
          handleEditButtonClick={() => {
            setSelectedPhase(family.phases.find((phase) => phase.id === id));
            setPhaseCreationModalOpen(true);
          }}
        />,
      ],
    },
    {
      field: "name",
      headerName: "Name",
      editable: true,
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      editable: true,
      flex: 1,
      renderCell: (params: GridRenderCellParams<Phase>) => (
        <Typography noWrap title={params.value || ""}>
          {params.value || "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "speciesIds",
      headerName: "Species",
      flex: 2,
      sortable: false,
      valueGetter: (_value, row: Phase) =>
        row.speciesIds
          .map(
            (id) =>
              family.species.find((species) => species.id === id)?.name ??
              "<Unknown>",
          )
          .join(", "),
      renderCell: (params: GridRenderCellParams<Phase>) => (
        <Typography noWrap title={String(params.value || "")}>
          {params.value || "<None>"}
        </Typography>
      ),
    },
  ];

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
      <DataGrid
        apiRef={apiRef}
        // The search replaces the filter panel. The free DataGrid allows only
        // one filter condition at a time.
        disableColumnFilter
        getRowId={(row: Phase) => row.id}
        initialState={{
          density: "compact",
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        rows={family.phases}
        columns={phaseColumns}
        processRowUpdate={handlePhaseRowUpdate}
        // A double-click on the species opens the phase editor. The name and
        // the description use the in-cell edit.
        onCellDoubleClick={(params) => {
          if (params.field !== "speciesIds") {
            return;
          }
          setSelectedPhase(
            family.phases.find((phase) => phase.id === params.id),
          );
          setPhaseCreationModalOpen(true);
        }}
        pageSizeOptions={[5, 10, 20, 100]}
        disableVirtualization
        sx={{
          flex: 1,
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
          ".MuiDataGrid-columnHeaderTitle": {
            fontFamily: theme.typography.fontFamily,
          },
          ".MuiDataGrid-overlay": {
            fontFamily: theme.typography.fontFamily,
          },
        }}
        slots={{ toolbar: DataViewToolbar }}
        slotProps={{
          toolbar: {
            addLabel: "Add Phase",
            addTooltip: "Add phase to family",
            addTestId: "add-phase-button",
            onAdd: () => {
              setSelectedPhase(undefined);
              setPhaseCreationModalOpen(true);
            },
            searchPlaceholder: "Search phases",
            visibleCount: visibleRows.length,
            totalCount: family.phases.length,
          },
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
