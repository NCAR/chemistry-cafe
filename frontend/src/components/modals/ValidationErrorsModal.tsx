import { Box, Button, Divider, Modal, Typography } from "@mui/material";
import React from "react";
import ErrorIcon from "@mui/icons-material/Error";
import { modalStyle } from "./modalStyle";
import { Family } from "../../types/chemistryModels";
import { IssueItemKind, ValidationIssue } from "../../helpers/validationIssues";
import { EquationText } from "../EquationText";
import {
  EditorSection,
  useFamilyValidation,
} from "../familyEditor/FamilyValidationContext";
import { IssueList } from "../familyEditor/IssueIndicators";

type ValidationErrorsModalProps = {
  open: boolean;
  onClose: () => void;
  message: string;
  family: Family;
  errors: ValidationIssue[];
  onDownloadAnyway?: () => void;
};

const sections: Array<{
  kind: IssueItemKind;
  title: string;
  section: EditorSection;
}> = [
  { kind: "reaction", title: "Reactions", section: "reactions" },
  { kind: "species", title: "Species", section: "species" },
  { kind: "phase", title: "Phases", section: "phases" },
];

/** The name of an item, or the equation of a reaction without a name. */
const ItemName = ({
  kind,
  id,
  family,
}: {
  kind: IssueItemKind;
  id: string;
  family: Family;
}) => {
  if (kind === "species") {
    return <>{family.species.find((s) => s.id === id)?.name ?? "<Unknown>"}</>;
  }
  if (kind === "phase") {
    return <>{family.phases.find((p) => p.id === id)?.name ?? "<Unknown>"}</>;
  }
  const reaction = family.reactions.find((r) => r.id === id);
  if (!reaction) return <>{"<Unknown>"}</>;
  return reaction.name ? (
    <>{reaction.name}</>
  ) : (
    <EquationText reaction={reaction} species={family.species} />
  );
};

/** Groups problems by the ID of their item, in the order of the problems. */
const groupByItem = (issues: ValidationIssue[]) => {
  const groups = new Map<string, ValidationIssue[]>();
  for (const issue of issues) {
    const id = issue.target!.id;
    groups.set(id, [...(groups.get(id) ?? []), issue]);
  }
  return [...groups.entries()];
};

/**
 * Shows the problems from the mechanism validator, grouped by section and by
 * item. In the family editor, a button opens each section, where the table
 * marks the items with problems.
 */
export const ValidationErrorsModal: React.FC<ValidationErrorsModalProps> = ({
  open,
  onClose,
  message,
  family,
  errors,
  onDownloadAnyway,
}) => {
  const { openSection } = useFamilyValidation();
  const other = errors.filter((error) => !error.target);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          ...modalStyle,
          width: "60%",
          maxHeight: "80%",
          overflowY: "auto",
        }}
        data-testid="validation-errors-modal"
      >
        <Typography
          sx={{
            display: "flex",
            columnGap: "0.5em",
            alignItems: "center",
          }}
          color="textPrimary"
          variant="h5"
        >
          <ErrorIcon color="error" />
          There are problems to fix
        </Typography>
        <Typography color="textPrimary" variant="h6">
          {message}
        </Typography>
        {sections.map(({ kind, title, section }) => {
          const groups = groupByItem(
            errors.filter((error) => error.target?.kind === kind),
          );
          if (groups.length === 0) return null;
          return (
            <Box key={kind} data-testid={`validation-section-${section}`}>
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography color="textPrimary" variant="subtitle1">
                  {title}: {groups.length} with problems
                </Typography>
                {openSection && (
                  <Button
                    size="small"
                    onClick={() => {
                      onClose();
                      openSection(section);
                    }}
                  >
                    Show {title.toLowerCase()}
                  </Button>
                )}
              </Box>
              <Box component="ul" sx={{ m: 0 }}>
                {groups.map(([id, issues]) => (
                  <Typography
                    key={id}
                    component="li"
                    color="textSecondary"
                    variant="body1"
                  >
                    <strong>
                      <ItemName kind={kind} id={id} family={family} />
                    </strong>
                    <IssueList issues={issues} />
                  </Typography>
                ))}
              </Box>
            </Box>
          );
        })}
        {other.length > 0 && (
          <Box>
            <Divider sx={{ my: 1 }} />
            <IssueList issues={other} />
          </Box>
        )}
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Button variant="contained" color="primary" onClick={onClose}>
            Close
          </Button>
          {onDownloadAnyway && (
            <Button
              variant="text"
              color="secondary"
              sx={{ textTransform: "none" }}
              onClick={() => {
                onClose();
                onDownloadAnyway();
              }}
            >
              Download current, unverified state
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};
