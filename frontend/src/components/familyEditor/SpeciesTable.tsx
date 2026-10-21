import { ReactNode, ReactElement } from "react";
import { Tooltip, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridEditBooleanCell,
  GridEditInputCell,
  GridPreProcessEditCellProps,
  GridRenderCellParams,
  GridRenderEditCellParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import { UUID } from "crypto";
import { Family, Species } from "../../types/chemistryModels";
import { speciesExclusiveConflict } from "../../helpers/editorHelpers";
import { useCustomTheme } from "../CustomThemeContext";
import { DataViewToolbar, useVisibleRows } from "./DataViewToolbar";

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

export type SpeciesTableProps = {
  /** The species that the table shows. */
  species: Array<Species>;
  /** Gives the buttons of the Row Actions column for the row with this ID. */
  getRowActions: (id: UUID) => Array<ReactElement>;
  /** Saves a cell edit. Without it, the cells are read-only. */
  onRowUpdate?: (species: Species) => void;
  /** Shows the add button of the toolbar, and calls this when it is clicked. */
  onAdd?: () => void;
  /** Custom components to render in the toolbar before the Columns button */
  customToolbarActions?: ReactNode;
};

/**
 * The table of species. The species editor and the mechanism editor share it,
 * and they differ in the row actions, the add button, and the editing.
 */
export const SpeciesTable = ({
  species,
  getRowActions,
  onRowUpdate,
  onAdd,
  customToolbarActions,
}: SpeciesTableProps) => {
  const { theme } = useCustomTheme();
  const apiRef = useGridApiRef();
  const visibleRows = useVisibleRows(apiRef);
  // Without a way to save an edit, the cells are read-only.
  const editable = onRowUpdate !== undefined;

  const speciesColumns: GridColDef[] = [
    {
      field: "Row Actions",
      type: "actions",
      headerClassName: "roleDataHeader",
      cellClassName: "actions",
      disableColumnMenu: true,
      getActions: ({ id }) => getRowActions(id as UUID),
    },
    {
      field: "name",
      headerName: "Name",
      editable,
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
      editable,
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
      editable,
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
      editable,
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
      editable,
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
      editable,
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
      editable,
      type: "boolean",
      flex: 1,
      preProcessEditCellProps: exclusiveOptionPreProcess("isThirdBody"),
      renderEditCell: (params) => <ExclusiveBooleanEditCell {...params} />,
    },
  ];

  return (
    <DataGrid
      apiRef={apiRef}
      // The search replaces the filter panel. The free DataGrid allows only
      // one filter condition at a time.
      disableColumnFilter
      getRowId={(row) => row.id}
      editMode="cell"
      processRowUpdate={(updatedRow: Species) => {
        onRowUpdate?.(updatedRow);
        return updatedRow;
      }}
      initialState={{
        density: "compact",
        pagination: { paginationModel: { pageSize: 20 } },
        sorting: { sortModel: [{ field: "name", sort: "asc" }] },
      }}
      rows={species}
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
      slots={{ toolbar: DataViewToolbar }}
      slotProps={{
        toolbar: {
          addLabel: "Add Species",
          addTooltip: "Add species to family",
          addTestId: "add-species-button",
          onAdd,
          searchPlaceholder: "Search species",
          visibleCount: visibleRows.length,
          totalCount: species.length,
          customToolbarActions: customToolbarActions,
        },
      }}
    />
  );
};
