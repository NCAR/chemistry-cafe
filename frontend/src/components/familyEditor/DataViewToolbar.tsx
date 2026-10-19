import { ReactNode, useEffect, useState } from "react";
import { Box, Button, Divider, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  gridFilteredSortedRowEntriesSelector,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarProps,
  GridToolbarQuickFilter,
  GridValidRowModel,
  ToolbarPropsOverrides,
  useGridApiRef,
} from "@mui/x-data-grid";

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    /** Text of the add button, for example "Add Species" */
    addLabel?: string;
    /** Tooltip of the add button */
    addTooltip?: string;
    /** Test ID of the add button */
    addTestId?: string;
    onAdd?: () => void;
    /** Placeholder of the search field */
    searchPlaceholder?: string;
    /** More filters after the search field */
    filters?: ReactNode;
    /** More buttons before the Columns button */
    actions?: ReactNode;
    /** The number of rows that the search and the filters leave */
    visibleCount?: number;
    /** The number of rows before the search and the filters */
    totalCount?: number;
  }
}

/**
 * The controls of a family editor table: the search and the filters at the
 * left, then the view controls and the add button at the right. Use it as
 * the toolbar slot of a DataGrid and give it its props with
 * slotProps.toolbar, so that the grid does not mount it again on each render.
 */
export const DataViewToolbar = ({
  addLabel,
  addTooltip,
  addTestId,
  onAdd,
  searchPlaceholder,
  filters,
  actions,
  visibleCount,
  totalCount,
  quickFilterProps,
}: GridToolbarProps & ToolbarPropsOverrides) => (
  <GridToolbarContainer
    sx={{ flexWrap: "wrap", alignItems: "center", gap: 1.5, padding: 1 }}
  >
    <GridToolbarQuickFilter
      variant="outlined"
      size="small"
      placeholder={searchPlaceholder ?? "Search"}
      debounceMs={300}
      sx={{ width: "16em", paddingBottom: 0 }}
      {...quickFilterProps}
    />
    {filters}
    {visibleCount !== undefined &&
      totalCount !== undefined &&
      visibleCount < totalCount && (
        <Typography variant="body2" color="textSecondary">
          Showing {visibleCount} of {totalCount}
        </Typography>
      )}
    <Box sx={{ flexGrow: 1 }} />
    {actions}
    <GridToolbarColumnsButton />
    <GridToolbarDensitySelector
      slotProps={{ tooltip: { title: "Change density" } }}
    />
    {onAdd && (
      <>
        <Divider orientation="vertical" flexItem />
        <Tooltip title={addTooltip ?? ""}>
          <Button
            aria-label={addLabel}
            data-testid={addTestId}
            onClick={onAdd}
            color="primary"
          >
            <AddIcon />
            <Typography variant="caption">{addLabel}</Typography>
          </Button>
        </Tooltip>
      </>
    )}
  </GridToolbarContainer>
);

/**
 * Gives the rows that the search of a grid leaves, in the order of the grid.
 */
export function useVisibleRows<Row extends GridValidRowModel>(
  apiRef: ReturnType<typeof useGridApiRef>,
): Array<Row> {
  const [visibleRows, setVisibleRows] = useState<Array<Row>>([]);

  useEffect(() => {
    const update = () => {
      const rows = gridFilteredSortedRowEntriesSelector(apiRef).map(
        (entry) => entry.model as Row,
      );
      // Keep the same array when the rows did not change. A new array
      // renders the table again, and the grid then sorts again, so a new
      // array on each event never stops.
      setVisibleRows((previous) =>
        previous.length === rows.length &&
        previous.every((row, index) => row === rows[index])
          ? previous
          : rows,
      );
    };
    update();
    // The grid filters the rows and then sorts them. A change of the rows
    // gives a new sorted list only after the sort, so both events update.
    const unsubscribers = [
      apiRef.current.subscribeEvent("filteredRowsSet", update),
      apiRef.current.subscribeEvent("sortedRowsSet", update),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [apiRef]);

  return visibleRows;
}
