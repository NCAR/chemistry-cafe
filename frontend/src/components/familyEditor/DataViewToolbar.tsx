import { Box } from "@mui/material";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";

export const DataViewToolbar: React.FC<{ customButton?: React.ReactNode }> = ({
  customButton,
}) => {
  return (
    <GridToolbarContainer>
      {customButton && customButton}
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector
        slotProps={{ tooltip: { title: "Change density" } }}
      />

      <Box sx={{ flexGrow: 1 }} />
    </GridToolbarContainer>
  );
};
