import { Box, Tooltip, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCustomTheme } from "../CustomThemeContext";
import { ViewProps } from "./ViewProps";
import { DataViewToolbar } from "./DataViewToolbar";

export const PhaseView = ({ family }: ViewProps) => {
  const { theme } = useCustomTheme();

  const phaseColumns: GridColDef[] = [
    {
      field: "name",
      flex: 1,
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
        <Tooltip title="Species can be in multiple different phases in a model.">
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <Typography>
        Phases are currently a work in progress. Everything is assumed to be in
        a gas phase.
      </Typography>
      <DataGrid
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
          toolbar: () => <DataViewToolbar />,
        }}
      />
    </Box>
  );
};
