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
  /** Shows the add button of the toolbar, and calls this when it is clicked. */
  onAdd?: () => void;
  /** Custom components to render in the toolbar before the Columns button */
  customToolbarActions?: ReactNode;
};

/**
 * The table of phases. The phase editor and the mechanism editor share it, and
 * they differ in the row actions and the add button.
 */
export const PhaseTable = ({
  phases,
  species,
  getRowActions,
  onAdd,
  customToolbarActions,
}: PhaseTableProps) => {
  const { theme } = useCustomTheme();
  const apiRef = useGridApiRef();
  const visibleRows = useVisibleRows(apiRef);

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
