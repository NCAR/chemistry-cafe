import { ReactNode, useEffect, useState } from "react";
import { Box, Button, Divider, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  gridFilteredSortedRowEntriesSelector,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarProps,
  GridRowSelectionModel,
  GridToolbarQuickFilter,
  GridValidRowModel,
  ToolbarPropsOverrides,
  useGridApiRef,
} from "@mui/x-data-grid";
import { UUID } from "crypto";

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
    /** The actions on the selected rows. They show after the filters. */
    selectionActions?: ReactNode;
    /** The number of rows that the search and the filters leave */
    visibleCount?: number;
    /** The number of rows before the search and the filters */
    totalCount?: number;
  }
}

/**
 * Splits a search into words, and each word must match a column. A search
 * with "+" or an arrow is an equation, for example "NO2 + OH -> HNO3". It
 * stays one piece, so that the equation column can compare both sides.
 */
const parseSearch = (search: string) =>
  /[+→]|->|=/.test(search)
    ? [search.trim()]
    : search.split(" ").filter((word) => word !== "");

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
  selectionActions,
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
      quickFilterParser={parseSearch}
      sx={{ width: "16em", paddingBottom: 0 }}
      {...quickFilterProps}
    />
    {filters}
    {selectionActions}
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

/**
 * Gives the actions on the selected rows of a table. Call `clearSelection`
 * after an action that changes the rows.
 */
export type SelectionActions = (
  ids: Array<UUID>,
  clearSelection: () => void,
) => ReactNode;

/**
 * Keeps the rows that the checkboxes of a table select. Give `checkboxSelection`
 * and the selection to the grid, and `toolbarActions` to the toolbar. The
 * toolbar then shows the count and the actions when rows are selected.
 * @param actions The actions on the selected rows. Without them, the table
 *   has no checkboxes.
 */
export function useRowSelection(actions?: SelectionActions) {
  const [selection, setSelection] = useState<GridRowSelectionModel>([]);
  const toolbarActions = actions && selection.length > 0 && (
    <>
      <Typography variant="body2" data-testid="selection-count">
        {selection.length} selected
      </Typography>
      {actions(selection as Array<UUID>, () => setSelection([]))}
    </>
  );
  return {
    checkboxSelection: actions !== undefined,
    selection,
    setSelection,
    toolbarActions,
  };
}
