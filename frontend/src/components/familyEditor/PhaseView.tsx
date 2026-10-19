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

  const updatePhase = (
    name: string,
    description: string | null,
    speciesIds: UUID[],
  ) => {
    const phase: Phase = {
      id: selectedPhase?.id ?? generateID(),
      name,
      description,
      speciesIds,
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
    </Box>
  );
};
