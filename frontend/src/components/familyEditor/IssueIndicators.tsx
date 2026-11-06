import { ReactNode } from "react";
import { Box, Chip, Tooltip, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
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

/**
 * Gives the messages of the problems that no other cell of a row marks, for
 * example a problem about the whole item. The main cell of the row shows them.
 * @param isMarked Tells if another cell marks the problem.
 */
export const unmarkedProblems = (
  issues: ValidationIssue[] | undefined,
  isMarked: (issue: ValidationIssue) => boolean,
): string[] =>
  (issues ?? [])
    .filter((issue) => !isMarked(issue))
    .map((issue) => issue.message);
