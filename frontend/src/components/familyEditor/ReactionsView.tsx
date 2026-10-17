import { ReactNode, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Popover,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FunctionsIcon from "@mui/icons-material/Functions";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import {
  Reaction,
  reactionAttributeOptions,
  ReactionTypeName,
} from "../../types/chemistryModels";
import {
  reactionToString,
  reactionTypeToString,
} from "../../helpers/stringify";
import { useCustomTheme } from "../CustomThemeContext";
import { ReactionEditorModal } from "../modals/ReactionEditorModal";
import { RowActionsButton } from "../RowActionsButton";
import { UUID } from "crypto";
import { generateID } from "../../helpers/localFamilies";
import { ViewProps } from "./ViewProps";
import { DataViewToolbar, useVisibleRows } from "./DataViewToolbar";
import { EquationText } from "../EquationText";
import { ReactionTypeInfo } from "./ReactionTypeInfo";
import { useUserPreferences } from "../UserPreferencesContext";
import {
  fromDisplayValue,
  parameterOrder,
  rateUnitParameters,
  RateUnits,
  RateUnitsByType,
  rateUnitsFor,
  roundDisplayValue,
  toDisplayValue,
} from "../../helpers/rateUnits";
import { GenericRateUnit, UnitText } from "../RateUnitText";

/**
 * Gives a column width that shows the whole name and unit of a parameter
 * header: about 7 px for each character of the longer line, plus space for
 * the padding and the sort and menu icons.
 */
const headerMinWidth = (name: string, unit: string) =>
  Math.max(100, Math.max(name.length, unit.length) * 7 + 64);

// Shows a parameter value with 6 significant digits. The edit field shows the
// full value.
const formatParameter = (value: number | null) =>
  value === null || value === undefined
    ? ""
    : Number(value.toPrecision(6)).toString();

/**
 * Gives one editable column for each parameter of a reaction type. A
 * parameter with a concentration unit shows its value in the display units of
 * the user. The reaction keeps the SI value.
 */
function parameterColumns(
  type: ReactionTypeName,
  rateUnits: RateUnits,
): Array<GridColDef<Reaction>> {
  const offsets: Record<string, number> | undefined = (
    rateUnitParameters as Partial<
      Record<ReactionTypeName, Record<string, number>>
    >
  )[type];

  return Object.entries(reactionAttributeOptions[type]).map(
    ([key, attribute]): GridColDef<Reaction> => {
      const name = attribute.name || key;
      const offset = offsets?.[key];
      // The plain text of the unit, for the column width.
      const unitText =
        offset !== undefined
          ? `(${rateUnits === "Molecule" ? "cm3 molecule-1" : "m3 mol-1"})n-1 s-1`
          : (attribute.units ?? "");
      const unit =
        offset !== undefined ? (
          <GenericRateUnit rateUnits={rateUnits} offset={offset} />
        ) : (
          attribute.units && <UnitText units={attribute.units} />
        );
      // The name is on the first line, and the unit is on a second line in
      // smaller gray text. A narrow column can cut the unit off, so the
      // tooltip shows the full unit.
      const header = (
        <Tooltip
          title={
            unit && (
              <span>
                {name} [{unit}]
              </span>
            )
          }
        >
          <Box
            sx={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}
          >
            <span>{name}</span>
            {unit && (
              <Typography
                variant="caption"
                color="textSecondary"
                lineHeight={1.3}
                noWrap
              >
                {unit}
              </Typography>
            )}
          </Box>
        </Tooltip>
      );

      if (key === "taylorCoefficients") {
        return {
          field: `parameter-${key}`,
          headerName: name,
          renderHeader: () => header,
          minWidth: 160,
          flex: 1,
          valueGetter: (_, row) => {
            const value = row.attributes[key]?.value;
            return Array.isArray(value) ? value.join(", ") : "";
          },
        };
      }

      const shownValue = (row: Reaction): number | null => {
        const value = row.attributes[key]?.value;
        if (typeof value !== "number") {
          return null;
        }
        const order = parameterOrder(type, key, row.reactants);
        return roundDisplayValue(toDisplayValue(value, rateUnits, order));
      };

      return {
        field: `parameter-${key}`,
        headerName: name,
        renderHeader: () => header,
        type: "number",
        editable: true,
        minWidth: headerMinWidth(name, unitText),
        flex: 1,
        valueGetter: (_, row) => shownValue(row),
        valueFormatter: (value: number | null) => formatParameter(value),
        valueSetter: (value: number | null, row) => {
          // An edit that does not change the shown value keeps the exact
          // stored value.
          if (value === shownValue(row)) {
            return row;
          }
          const attributes = { ...row.attributes };
          if (value === null || !Number.isFinite(value)) {
            delete attributes[key];
          } else {
            const order = parameterOrder(type, key, row.reactants);
            attributes[key] = {
              ...attribute,
              ...row.attributes[key],
              value: fromDisplayValue(value, rateUnits, order),
            };
          }
          return { ...row, attributes };
        },
      };
    },
  );
}

/**
 * Gives a short list of the parameters of a reaction, for example
 * "A = 1.2e-11, C = -250". Values with a concentration unit are in the display
 * units of the user.
 */
function parameterSummary(
  reaction: Reaction,
  rateUnits: RateUnitsByType,
): string {
  const units = rateUnitsFor(rateUnits, reaction.type);
  return Object.entries(reactionAttributeOptions[reaction.type] ?? {})
    .flatMap(([key, attribute]) => {
      const value = reaction.attributes[key]?.value;
      const name = attribute.name || key;
      if (Array.isArray(value)) {
        return value.length > 0 ? [`${name} = [${value.join(", ")}]`] : [];
      }
      if (typeof value !== "number") {
        return [];
      }
      const order = parameterOrder(reaction.type, key, reaction.reactants);
      const shown = toDisplayValue(value, units, order);
      return [`${name} = ${Number(shown.toPrecision(4))}`];
    })
    .join(", ");
}

type TypeOption = {
  type: ReactionTypeName | null;
  label: string;
  count: number;
};

/**
 * A toolbar button that shows the rate constant formula, the parameter
 * units, and the docs of the reaction type in a popover.
 */
const RateConstantButton = ({ info }: { info: ReactNode }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  return (
    <>
      <Button
        size="small"
        startIcon={<FunctionsIcon />}
        aria-haspopup="dialog"
        aria-expanded={Boolean(anchorEl)}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        Rate constant
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        {info}
      </Popover>
    </>
  );
};

type TypeFilterProps = {
  options: Array<TypeOption>;
  selectedType: ReactionTypeName | null;
  onSelect: (type: ReactionTypeName | null) => void;
};

/** A combo box that shows only the reactions of one type. */
const TypeFilter = ({ options, selectedType, onSelect }: TypeFilterProps) => (
  <Autocomplete
    size="small"
    sx={{
      width: "16em",
      // The clear button is always visible when a type is selected.
      "& .MuiAutocomplete-clearIndicator": { visibility: "visible" },
    }}
    value={options.find((option) => option.type === selectedType) ?? null}
    clearText="Clear type"
    options={options}
    isOptionEqualToValue={(option, value) => option.type === value.type}
    getOptionLabel={(option) => option.label}
    renderOption={({ key, ...props }, option) => (
      <Box component="li" key={key} {...props}>
        <Box sx={{ flexGrow: 1 }}>{option.label}</Box>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ marginLeft: 3 }}
        >
          {option.count}
        </Typography>
      </Box>
    )}
    renderInput={(params) => (
      <TextField {...params} label="Type" placeholder="All types" />
    )}
    onChange={(_, value) => onSelect(value?.type ?? null)}
  />
);

export const ReactionsView = ({ family, updateFamily }: ViewProps) => {
  const { theme } = useCustomTheme();
  const [reactionsEditorOpen, setReactionsEditorOpen] =
    useState<boolean>(false);
  const [selectedReaction, setSelectedReaction] = useState<Reaction>();
  // The reaction type that the Type menu selects, or null for all types.
  const [typeFilter, setTypeFilter] = useState<ReactionTypeName | null>(null);
  const { preferences } = useUserPreferences();
  const apiRef = useGridApiRef();
  // The reaction that the user clicked in the table.
  const [selectedRowId, setSelectedRowId] = useState<UUID | null>(null);
  const visibleRows = useVisibleRows<Reaction>(apiRef);
  // The reaction type of all rows that the search leaves, or null if the rows
  // have more than one type.
  const visibleTypes = new Set(visibleRows.map((reaction) => reaction.type));
  const visibleType: ReactionTypeName | null =
    visibleTypes.size === 1 ? [...visibleTypes][0] : null;

  const createReaction = () => {
    const frontendId: UUID = generateID();
    const reaction: Reaction = {
      id: frontendId,
      name: "",
      description: "",
      type: "ARRHENIUS",
      reactants: [],
      products: [],
      attributes: {},
    };
    setSelectedReaction(reaction);
    setReactionsEditorOpen(true);
  };

  const removeReaction = (id: UUID) => {
    const originalReaction: Reaction | undefined = family.reactions.find(
      (value) => value.id === id,
    );
    if (!originalReaction) {
      return;
    }

    updateFamily({
      ...family,
      reactions: family.reactions.filter((element) => element.id !== id),
      // Strip the removed reaction from any mechanism that referenced it.
      mechanisms: family.mechanisms.map((mechanism) => ({
        ...mechanism,
        reactionIds: mechanism.reactionIds.filter((rid) => rid !== id),
      })),
      isModified: true,
    });
  };

  const updateReaction = (reaction: Reaction) => {
    const reactionList = [...family.reactions];
    const existingIndex = reactionList.findIndex(
      (element) => element.id === reaction.id,
    );

    if (existingIndex >= 0) {
      reactionList[existingIndex] = { ...reaction };
    } else {
      reactionList.unshift({ ...reaction });
    }

    updateFamily({
      ...family,
      reactions: reactionList,
    });
  };

  const reactionsColumns: GridColDef[] = [
    {
      field: "Row Actions",
      type: "actions",
      headerClassName: "roleDataHeader",
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <RowActionsButton
            handleDeleteButtonClick={() => {
              removeReaction(id as UUID);
            }}
            handleEditButtonClick={() => {
              setSelectedReaction(
                family.reactions.find((element) => element.id === id),
              );
              setReactionsEditorOpen(true);
            }}
          />,
        ];
      },
    },
    {
      field: "id",
      headerName: "Equation",
      flex: 1,
      valueGetter: (id: string) =>
        reactionToString(
          family.reactions.find((e) => e.id == id),
          family.species,
        ),
      renderCell: (params: GridRenderCellParams<Reaction>) => (
        <Typography variant="body1" noWrap>
          <EquationText reaction={params.row} species={family.species} />
        </Typography>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      type: "string",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Reaction>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
          noWrap
        >
          {params.value || "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      type: "string",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Reaction>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
          noWrap
        >
          {params.value || "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "type",
      headerName: "Reaction Type",
      flex: 1,
      // The search uses the readable name, for example "Troe (Fall-Off)".
      getApplyQuickFilterFn: (search: string) => (value: ReactionTypeName) =>
        reactionTypeToString(value)
          .toLowerCase()
          .includes(search.toLowerCase()),
      renderCell: (params: GridRenderCellParams<Reaction>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
          noWrap
        >
          {reactionTypeToString(params.value as ReactionTypeName)}
        </Typography>
      ),
    },
  ];

  const typeCounts = new Map<ReactionTypeName, number>();
  for (const reaction of family.reactions) {
    typeCounts.set(reaction.type, (typeCounts.get(reaction.type) ?? 0) + 1);
  }
  // A type with no reactions left goes away from the menu, so its filter does
  // too.
  const activeType =
    typeFilter && typeCounts.has(typeFilter) ? typeFilter : null;
  const typeOptions: Array<TypeOption> = [
    { type: null, label: "All", count: family.reactions.length },
    ...[...typeCounts.entries()]
      .map(([type, count]) => ({
        type,
        label: reactionTypeToString(type),
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];
  const rows = activeType
    ? family.reactions.filter((reaction) => reaction.type === activeType)
    : family.reactions;

  // When all visible rows have one type, the table shows the parameters of
  // that type in their own columns. Otherwise, it shows a short summary.
  const columns: Array<GridColDef> = visibleType
    ? [
        ...reactionsColumns.filter((column) => column.field !== "type"),
        ...(parameterColumns(
          visibleType,
          rateUnitsFor(preferences.rateUnits, visibleType),
        ) as Array<GridColDef>),
      ]
    : [
        ...reactionsColumns,
        {
          field: "parameters",
          headerName: "Parameters",
          flex: 1.5,
          sortable: false,
          valueGetter: (_, row: Reaction) =>
            parameterSummary(row, preferences.rateUnits),
          renderCell: (params: GridRenderCellParams<Reaction>) => (
            <Typography variant="body2" color="textSecondary" noWrap>
              {params.value}
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
          Chemical Reactions
        </Typography>
        <Tooltip title="Chemical reactions consist of reactants which create products during a certain phase. They can also be tuned with specific parameters given by the reaction type.">
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <DataGrid
        apiRef={apiRef}
        onRowSelectionModelChange={(model) =>
          setSelectedRowId((model[0] as UUID | undefined) ?? null)
        }
        // The search and the Type menu replace the filter panel. The free
        // DataGrid allows only one filter condition at a time.
        disableColumnFilter
        // A parameter column has a second line for its unit.
        columnHeaderHeight={visibleType ? 72 : 56}
        initialState={{
          density: "compact",
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        rows={rows}
        columns={columns}
        processRowUpdate={(updatedRow: Reaction) => {
          updateReaction(updatedRow);
          return updatedRow;
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
            addLabel: "Add Reaction",
            addTooltip: "Add reaction to family",
            addTestId: "add-reaction-button",
            onAdd: createReaction,
            searchPlaceholder: "Search reactions",
            filters: (
              <TypeFilter
                options={typeOptions}
                selectedType={activeType}
                onSelect={setTypeFilter}
              />
            ),
            actions: visibleType && (
              <RateConstantButton
                info={
                  <ReactionTypeInfo
                    type={visibleType}
                    rateUnits={rateUnitsFor(preferences.rateUnits, visibleType)}
                    reaction={family.reactions.find(
                      (reaction) =>
                        reaction.id === selectedRowId &&
                        reaction.type === visibleType,
                    )}
                    species={family.species}
                  />
                }
              />
            ),
            visibleCount: visibleRows.length,
            totalCount: family.reactions.length,
          },
        }}
      />
      <ReactionEditorModal
        open={reactionsEditorOpen}
        onClose={() => {
          setReactionsEditorOpen(false);
          setSelectedReaction(undefined);
        }}
        onUpdate={updateReaction}
        reaction={selectedReaction}
        family={family}
      />
    </Box>
  );
};
