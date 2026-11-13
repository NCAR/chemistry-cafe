import { useMemo, useState } from "react";
import { Checkbox, FormControlLabel, Tooltip, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridEditInputCell,
  GridPreProcessEditCellProps,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import { UUID } from "crypto";
import { Species } from "../../types/chemistryModels";
import { useCustomTheme } from "../CustomThemeContext";
import { DataViewToolbar, useVisibleRows } from "./DataViewToolbar";

/** The values that one species has in a phase. */
export type PhaseSpeciesValues = {
  diffusionCoefficients: Record<UUID, number>;
  densities: Record<UUID, number>;
};

type PhaseSpeciesRow = {
  id: UUID;
  name: string;
  /** The species is in the phase. Only a member species has values. */
  member: boolean;
  diffusionCoefficient: number | null;
  density: number | null;
};

const POSITIVE_NUMBER_MESSAGE = "Enter a positive number.";

// An empty cell removes the value. Any other value must be a positive number.
const positiveNumberPreProcess = (params: GridPreProcessEditCellProps) => {
  const value = params.props.value as number | null;
  const valid = value === null || (Number.isFinite(value) && value > 0);
  return {
    ...params.props,
    error: valid ? undefined : POSITIVE_NUMBER_MESSAGE,
  };
};

const parseNumber = (value: unknown) =>
  value === "" || value === null || value === undefined ? null : Number(value);

// Only a member species has values in the phase.
const renderValue = (params: GridRenderCellParams<PhaseSpeciesRow>) =>
  params.row.member ? (
    (params.value ?? (
      <Typography variant="body2" color="text.disabled">
        None
      </Typography>
    ))
  ) : (
    <Typography variant="body2" color="text.disabled">
      —
    </Typography>
  );

// An edit cell that shows its error as a tooltip.
const NumberEditCell = (props: GridRenderEditCellParams) => {
  const { error } = props as unknown as { error?: string };
  return (
    <Tooltip open={Boolean(error)} title={error ?? ""} arrow placement="top">
      {/* Without a delay, the grid gets each value at once. With the default
          delay, an Enter right after a change finds the check still running,
          and the grid then does not end the edit. */}
      <GridEditInputCell {...props} debounceMs={0} />
    </Tooltip>
  );
};

export type PhaseSpeciesTableProps = {
  /** The species of the family. Each species has a row. */
  species: Array<Species>;
  /** The species in the phase. Their checkboxes are checked. */
  memberIds: Array<UUID>;
  /** Saves a change to the species in the phase. */
  onMembersChange: (memberIds: Array<UUID>) => void;
  /** The values of the member species in the phase. */
  values: PhaseSpeciesValues;
  /** Saves the values of one species. A null value removes the value. */
  onValuesChange: (
    speciesId: UUID,
    diffusionCoefficient: number | null,
    density: number | null,
  ) => void;
};

/**
 * The species of a phase. The checkbox of a row puts the species in the
 * phase. The other columns hold the values that a member species has in this
 * phase, and the user edits them in the cell.
 */
export const PhaseSpeciesTable = ({
  species,
  memberIds,
  onMembersChange,
  values,
  onValuesChange,
}: PhaseSpeciesTableProps) => {
  const { theme } = useCustomTheme();
  const apiRef = useGridApiRef();
  const visibleRows = useVisibleRows(apiRef);
  // Shows only the species in the phase.
  const [onlyMembers, setOnlyMembers] = useState(false);
  const members = useMemo(() => new Set(memberIds), [memberIds]);

  // The rows must keep the same objects while nothing changes. New rows on
  // each render make the grid update its state again and again (see
  // useVisibleRows), and the table never stops to render.
  const rows: Array<PhaseSpeciesRow> = useMemo(
    () =>
      species
        .filter((option) => !onlyMembers || members.has(option.id))
        .map((option) => ({
          id: option.id,
          name: option.name,
          member: members.has(option.id),
          diffusionCoefficient: values.diffusionCoefficients[option.id] ?? null,
          density: values.densities[option.id] ?? null,
        })),
    [species, onlyMembers, members, values],
  );

  // The columns must also keep the same objects. The grid starts again with
  // new columns, and an edit in progress then loses its value.
  const columns: Array<GridColDef<PhaseSpeciesRow>> = useMemo(() => {
    const valueColumn = (
      field: "diffusionCoefficient" | "density",
      headerName: string,
    ): GridColDef<PhaseSpeciesRow> => ({
      field,
      headerName,
      type: "number",
      align: "left",
      headerAlign: "left",
      flex: 1,
      editable: true,
      valueParser: parseNumber,
      preProcessEditCellProps: positiveNumberPreProcess,
      renderEditCell: (params) => <NumberEditCell {...params} />,
      renderCell: renderValue,
    });
    return [
      { field: "name", headerName: "Species", flex: 1 },
      valueColumn("diffusionCoefficient", "Diffusion coefficient [m² s⁻¹]"),
      valueColumn("density", "Density [kg m⁻³]"),
    ];
  }, []);

  return (
    <DataGrid
      apiRef={apiRef}
      // The search replaces the filter panel.
      disableColumnFilter
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      editMode="cell"
      isCellEditable={(params) => params.row.member}
      processRowUpdate={(row: PhaseSpeciesRow) => {
        onValuesChange(row.id, row.diffusionCoefficient, row.density);
        return row;
      }}
      checkboxSelection
      disableRowSelectionOnClick
      // The search hides rows, but a hidden member stays in the phase.
      keepNonExistentRowsSelected
      rowSelectionModel={memberIds}
      onRowSelectionModelChange={(model: GridRowSelectionModel) =>
        onMembersChange(model as Array<UUID>)
      }
      initialState={{
        density: "compact",
        pagination: { paginationModel: { pageSize: 25 } },
        sorting: { sortModel: [{ field: "name", sort: "asc" }] },
      }}
      pageSizeOptions={[10, 25, 50, 100]}
      disableVirtualization // Enables DataGrid to be rendered in testing
      sx={{
        flex: 1,
        minWidth: 0,
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
          searchPlaceholder: "Search species",
          filters: (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={onlyMembers}
                  onChange={(event) => setOnlyMembers(event.target.checked)}
                />
              }
              label="Only species in this phase"
            />
          ),
          visibleCount: visibleRows.length,
          totalCount: species.length,
        },
      }}
    />
  );
};
