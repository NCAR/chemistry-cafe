import { useState } from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { UUID } from "crypto";
import { generateID } from "../../helpers/localFamilies";
import { Phase } from "../../types/chemistryModels";
import { PhaseCreationModal } from "../modals/PhaseCreationModal";
import { RowActionsButton } from "../RowActionsButton";
import { useCustomTheme } from "../CustomThemeContext";
import { ViewProps } from "./ViewProps";
import { DataViewToolbar } from "./DataViewToolbar";

export const PhaseView = ({ family, updateFamily }: ViewProps) => {
  const { theme } = useCustomTheme();
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
            setSelectedPhase(
              family.phases.find((phase) => phase.id === id),
            );
            setPhaseCreationModalOpen(true);
          }}
        />,
      ],
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
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
        getRowId={(row: Phase) => row.id}
        initialState={{
          density: "compact",
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        rows={family.phases}
        columns={phaseColumns}
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
        slots={{
          toolbar: () => (
            <DataViewToolbar
              customButton={
                <Tooltip title="Add phase to family">
                  <Button
                    aria-label="Add Phase"
                    data-testid="add-phase-button"
                    onClick={() => {
                      setSelectedPhase(undefined);
                      setPhaseCreationModalOpen(true);
                    }}
                    color="primary"
                  >
                    <AddIcon />
                    <Typography variant="caption">Add Phase</Typography>
                  </Button>
                </Tooltip>
              }
            />
          ),
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