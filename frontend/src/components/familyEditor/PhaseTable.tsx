import { ReactNode, ReactElement } from "react";
import { Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import { UUID } from "crypto";
import { Phase, Species } from "../../types/chemistryModels";
import { useCustomTheme } from "../CustomThemeContext";
import { DataViewToolbar, useVisibleRows } from "./DataViewToolbar";

export type PhaseTableProps = {
  /** The phases that the table shows. */
  phases: Array<Phase>;
  /** The species of the family. The Species column shows their names. */
  species: Array<Species>;
  /** Gives the buttons of the Row Actions column for the row with this ID. */
  getRowActions: (id: UUID) => Array<ReactElement>;
  /**
   * Saves a cell edit of the name or the description, and gives the row that
   * the table then shows. Without it, the cells are read-only.
   */
  onRowUpdate?: (updated: Phase, original: Phase) => Phase;
  /** Shows the add button of the toolbar, and calls this when it is clicked. */
  onAdd?: () => void;
  /**
   * Opens the editor of the phase with this ID when its Species cell is
   * double-clicked. Without it, a double-click on the cell does nothing.
   */
  onEdit?: (id: UUID) => void;
  /** Custom components to render in the toolbar before the Columns button */
  customToolbarActions?: ReactNode;
};

/**
 * The table of phases. The phase editor and the mechanism editor share it, and
 * they differ in the row actions, the add button, and the editing.
 */
export const PhaseTable = ({
  phases,
  species,
  getRowActions,
  onRowUpdate,
  onAdd,
  onEdit,
  customToolbarActions,
}: PhaseTableProps) => {
  const { theme } = useCustomTheme();
  const apiRef = useGridApiRef();
  const visibleRows = useVisibleRows(apiRef);
  // Without a way to save an edit, the cells are read-only.
  const editable = onRowUpdate !== undefined;

  const phaseColumns: GridColDef[] = [
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
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      editable,
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
              species.find((element) => element.id === id)?.name ??
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
      rows={phases}
      columns={phaseColumns}
      processRowUpdate={onRowUpdate}
      // A double-click on the species opens the phase editor. The name and
      // the description use the in-cell edit.
      onCellDoubleClick={(params) => {
        if (params.field !== "speciesIds") {
          return;
        }
        onEdit?.(params.id as UUID);
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
          onAdd,
          searchPlaceholder: "Search phases",
          visibleCount: visibleRows.length,
          totalCount: phases.length,
          customToolbarActions: customToolbarActions,
        },
      }}
    />
  );
};
