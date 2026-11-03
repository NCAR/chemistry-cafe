import { ReactNode } from "react";
import { alpha, Box, Chip, Theme, Tooltip, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { ValidationIssue } from "../../helpers/validationIssues";

/** The problems of the items of a table, by the ID of the item. */
export type ItemIssues = Map<string, ValidationIssue[]>;

/** Lists the problems of an item, with the mechanism of each one. */
export const IssueList = ({ issues }: { issues: ValidationIssue[] }) => (
  <Box component="ul" sx={{ m: 0, pl: 2 }}>
    {issues.map((issue, index) => (
      <li key={index}>
        {issue.message}
        {issue.mechanismName && ` (${issue.mechanismName})`}
      </li>
    ))}
  </Box>
);

/** An error icon. Its tooltip lists the problems of the item. */
export const IssueIcon = ({ issues }: { issues?: ValidationIssue[] }) =>
  issues && issues.length > 0 ? (
    <Tooltip title={<IssueList issues={issues} />} arrow>
      <ErrorIcon
        color="error"
        fontSize="small"
        aria-label={`${issues.length} problems`}
        data-testid="issue-icon"
      />
    </Tooltip>
  ) : null;

/**
 * Gives the column that marks the rows with problems. Without problems to
 * show, for example outside the family editor, the table has no column.
 */
export function issueColumns<Row extends GridValidRowModel & { id: string }>(
  issues?: ItemIssues,
): Array<GridColDef<Row>> {
  if (!issues) return [];
  return [
    {
      field: "issues",
      headerName: "Problems",
      width: 48,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <ErrorIcon fontSize="small" color="disabled" />,
      valueGetter: (_value, row) => issues.get(row.id)?.length ?? 0,
      // The search does not use this column.
      getApplyQuickFilterFn: () => null,
      renderCell: (params) => <IssueIcon issues={issues.get(params.row.id)} />,
    },
  ];
}

/** The class name of a row with problems. See issueRowSx. */
export const issueRowClassName = (
  issues: ItemIssues | undefined,
  id: string,
) => (issues?.has(id) ? "has-issue" : "");

/** Tints the rows with problems. */
export const issueRowSx = (theme: Theme) => ({
  "& .has-issue": { backgroundColor: alpha(theme.palette.error.main, 0.08) },
  "& .has-issue:hover": {
    backgroundColor: alpha(theme.palette.error.main, 0.14),
  },
});

/** Shows a part of an item that has a problem, for example a species. */
export const ProblemText = ({
  children,
  title,
}: {
  children: ReactNode;
  title?: ReactNode;
}) => (
  <Tooltip title={title ?? ""} arrow disableInteractive>
    <Box
      component="span"
      data-testid="problem-text"
      sx={{
        color: "error.main",
        fontWeight: 600,
        textDecoration: "underline wavy",
        textUnderlineOffset: "3px",
      }}
    >
      {children}
    </Box>
  </Tooltip>
);

/**
 * A toolbar filter that shows only the rows with problems. It shows only when
 * the table has rows with problems.
 */
export const ProblemsFilter = ({
  count,
  selected,
  onChange,
}: {
  count: number;
  selected: boolean;
  onChange: (selected: boolean) => void;
}) =>
  count > 0 ? (
    <Chip
      icon={<ErrorIcon />}
      color="error"
      variant={selected ? "filled" : "outlined"}
      label={`${count} with problems`}
      onClick={() => onChange(!selected)}
      aria-pressed={selected}
      data-testid="problems-filter"
    />
  ) : null;

/**
 * Gives the rows that a table shows: all rows, or the rows with problems when
 * the problems filter is on.
 */
export function rowsToShow<Row extends { id: string }>(
  rows: Array<Row>,
  issues: ItemIssues | undefined,
  onlyProblems: boolean,
): Array<Row> {
  return onlyProblems && issues
    ? rows.filter((row) => issues.has(row.id))
    : rows;
}

/** Counts the rows that have problems. */
export const countRowsWithIssues = (
  rows: Array<{ id: string }>,
  issues: ItemIssues | undefined,
) => (issues ? rows.filter((row) => issues.has(row.id)).length : 0);

/** A short red count of problems, for example in the tree of the editor. */
export const ProblemCount = ({ count }: { count: number }) =>
  count > 0 ? (
    <Typography
      component="span"
      variant="caption"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        columnGap: 0.25,
        ml: 1,
        px: 0.75,
        borderRadius: 1,
        color: "error.contrastText",
        backgroundColor: "error.main",
        fontWeight: 600,
      }}
      aria-label={`${count} with problems`}
      data-testid="problem-count"
    >
      <ErrorIcon sx={{ fontSize: "0.9rem" }} />
      {count}
    </Typography>
  ) : null;

/**
 * Gives the messages of the problems that name a species, by the ID of the
 * species, for example the products that are not in the gas phase.
 * @param fields Only the problems in these keys of the item. All keys if undefined.
 */
export const problemsBySpecies = (
  issues: ValidationIssue[] | undefined,
  fields?: string[],
): Map<string, string[]> => {
  const bySpecies = new Map<string, string[]>();
  for (const issue of issues ?? []) {
    const target = issue.target;
    if (!target?.speciesId) continue;
    if (fields && !fields.includes(target.field ?? "")) continue;
    bySpecies.set(target.speciesId, [
      ...(bySpecies.get(target.speciesId) ?? []),
      issue.message,
    ]);
  }
  return bySpecies;
};

/** Gives the messages of the problems in one key of an item. */
export const problemsInField = (
  issues: ValidationIssue[] | undefined,
  field: string,
): string[] =>
  (issues ?? [])
    .filter((issue) => issue.target?.field === field)
    .map((issue) => issue.message);
