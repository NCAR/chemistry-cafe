import { useState } from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  DataGrid,
  GridColDef,
  GridEditBooleanCell,
  GridEditInputCell,
  GridPreProcessEditCellProps,
  GridRenderCellParams,
  GridRenderEditCellParams,
} from "@mui/x-data-grid";
import { Family, Species } from "../../types/chemistryModels";
import {
  speciesExclusiveConflict,
  applySpeciesRowUpdate,
} from "../../helpers/editorHelpers";
import { useCustomTheme } from "../CustomThemeContext";
import { SpeciesEditorModal } from "../modals/SpeciesEditorModal";
import { RowActionsButton } from "../RowActionsButton";
import { UUID } from "crypto";
import { generateFrontendID } from "../../helpers/localFamilies";
import { ViewProps } from "./ViewProps";
import { DataViewToolbar } from "./DataViewToolbar";

const EXCLUSIVE_OPTION_MESSAGE =
  "Only one of constant concentration, constant mixing ratio, or third body may be set.";

const exclusiveOptionPreProcess =
  (field: keyof Species) => (params: GridPreProcessEditCellProps) => {
    const candidate = { ...params.row, [field]: params.props.value };
    return {
      ...params.props,
      error: speciesExclusiveConflict(candidate)
        ? EXCLUSIVE_OPTION_MESSAGE
        : undefined,
    };
  };

// Edit cells that surface the mutual-exclusion error as a tooltip.
const ExclusiveNumberEditCell = (props: GridRenderEditCellParams) => {
  const { error } = props as unknown as { error?: string };
  return (
    <Tooltip open={Boolean(error)} title={error ?? ""} arrow placement="top">
      <GridEditInputCell {...props} />
    </Tooltip>
  );
};

const ExclusiveBooleanEditCell = (props: GridRenderEditCellParams) => {
  const { error } = props as unknown as { error?: string };
  return (
    <Tooltip open={Boolean(error)} title={error ?? ""} arrow placement="top">
      <GridEditBooleanCell {...props} />
    </Tooltip>
  );
};

export const SpeciesView = ({ family, updateFamily }: ViewProps) => {
  const { theme } = useCustomTheme();
  const [speciesEditorOpen, setSpeciesEditorOpen] = useState<boolean>(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();

  const handleSpeciesRowUpdate = (updatedSpecies: Species) => {
    updateFamily(applySpeciesRowUpdate(family, updatedSpecies));
    return updatedSpecies;
  };

  const createSpecies = () => {
    const frontendId: string = generateFrontendID();
    const species: Species = {
      description: "",
      familyId: family.id,
      id: frontendId,
      isDeleted: false,
      isInDatabase: false,
      isModified: false,
      name: "",
    };
    setSelectedSpecies(species);
    setSpeciesEditorOpen(true);
  };

  const removeSpecies = (id: UUID | string) => {
    const originalSpecies: Species | undefined = family.species.find(
      (value) => value.id === id,
    );
    if (!originalSpecies) {
      return;
    }

    updateFamily({
      ...family,
      species: family.species.map((element) => {
        if (element.id !== id) {
          return element;
        }
        return {
          ...element,
          isDeleted: true,
          isModified: true,
        };
      }),
    });
  };

  /**
   * Updates a given species or inserts it if it doesn't already exist in the list
   * @param species
   */
  const updateSpecies = (species: Species) => {
    const speciesList = [...family.species];
    const existingIndex = speciesList.findIndex(
      (element) => element.id == species.id,
    );

    if (existingIndex >= 0) {
      speciesList[existingIndex] = { ...species, isModified: true };
    } else {
      speciesList.unshift({ ...species, isModified: true });
    }

    updateFamily({
      ...family,
      species: speciesList,
    });
  };

  const speciesColumns: GridColDef[] = [
    {
      field: "Row Actions",
      type: "actions",
      headerClassName: "roleDataHeader",
      cellClassName: "actions",
      disableColumnMenu: true,
      getActions: ({ id }) => {
        return [
          <RowActionsButton
            handleDeleteButtonClick={() => {
              if (typeof id === "string") {
                removeSpecies(id as string);
              }
            }}
            handleEditButtonClick={() => {
              setSelectedSpecies(
                family.species.find((element) => element.id === id),
              );
              setSpeciesEditorOpen(true);
            }}
          />,
        ];
      },
    },
    {
      field: "name",
      headerName: "Name",
      editable: true,
      type: "string",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
        >
          {params.value || "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      editable: true,
      type: "string",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
        >
          {params.value || "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "absoluteTolerance",
      headerName: "Absolute Tolerance [mol m-3]",
      editable: true,
      type: "number",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
        >
          {params.value ?? "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "constantConcentration",
      headerName: "Constant Concentration [mol m-3]",
      editable: true,
      type: "number",
      flex: 1,
      preProcessEditCellProps: exclusiveOptionPreProcess(
        "constantConcentration",
      ),
      renderEditCell: (params) => <ExclusiveNumberEditCell {...params} />,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
        >
          {params.value ?? "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "constantMixingRatio",
      headerName: "Constant Mixing Ratio [mol mol-1]",
      editable: true,
      type: "number",
      flex: 1,
      preProcessEditCellProps: exclusiveOptionPreProcess("constantMixingRatio"),
      renderEditCell: (params) => <ExclusiveNumberEditCell {...params} />,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
        >
          {params.value ?? "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "molecularWeight",
      headerName: "Molecular Weight [kg mol-1]",
      editable: true,
      type: "number",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
        >
          {params.value ?? "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "isThirdBody",
      headerName: "Third Body (M)",
      editable: true,
      type: "boolean",
      flex: 1,
      preProcessEditCellProps: exclusiveOptionPreProcess("isThirdBody"),
      renderEditCell: (params) => <ExclusiveBooleanEditCell {...params} />,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
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
          Chemical Species
        </Typography>
        <Tooltip title="Chemical species are forms of a specific chemical entity. They can be named anything as long as it is clear what it represents. For example, a chemical species may be represented as either 'O3' or 'Ozone'.">
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <DataGrid
        getRowId={(row) => row.id}
        editMode="cell"
        processRowUpdate={handleSpeciesRowUpdate}
        initialState={{
          density: "compact",
          pagination: { paginationModel: { pageSize: 20 } },
          sorting: { sortModel: [{ field: "name", sort: "asc" }] },
        }}
        rows={family.species.filter((element) => !element.isDeleted)}
        columns={speciesColumns}
        pageSizeOptions={[5, 10, 20, 100]}
        disableRowSelectionOnClick
        disableVirtualization // Enables DataGrid to be rendered in testing
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
                <Tooltip title="Add species to family">
                  <Button
                    aria-label="Add species to family"
                    data-testid="add-species-button"
                    onClick={createSpecies}
                    color="primary"
                  >
                    <AddIcon />
                    <Typography variant="caption">Add Species</Typography>
                  </Button>
                </Tooltip>
              }
            />
          ),
        }}
      />
      <SpeciesEditorModal
        open={speciesEditorOpen}
        onClose={() => {
          setSpeciesEditorOpen(false);
          setSelectedSpecies(undefined);
        }}
        onUpdate={updateSpecies}
        species={selectedSpecies}
      />
    </Box>
  );
};
