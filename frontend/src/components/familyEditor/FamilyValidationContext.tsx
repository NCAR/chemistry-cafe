import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Family } from "../../types/chemistryModels";
import {
  issuesByItem,
  validateFamily,
  ValidationIssue,
} from "../../helpers/validationIssues";

/** The sections of the family editor that show items. */
export type EditorSection = "species" | "reactions" | "phases" | "mechanisms";

export type FamilyValidation = {
  /** The problems of all mechanisms of the selected family. */
  issues: ValidationIssue[];
  /** The problems, grouped by the ID of the item that causes them. */
  byItem: Map<string, ValidationIssue[]>;
  /** Opens a section of the family editor. Undefined outside the editor. */
  openSection?: (section: EditorSection) => void;
};

const FamilyValidationContext = createContext<FamilyValidation>({
  issues: [],
  byItem: new Map(),
});

export const FamilyValidationProvider = FamilyValidationContext.Provider;

/** Gives the problems of the family that the editor shows. */
export const useFamilyValidation = () => useContext(FamilyValidationContext);

// The time after the last change before the check starts, so that a check
// does not run for each key that the user types.
const VALIDATION_DELAY_MS = 300;

/**
 * Checks the mechanisms of a family after each change, and gives the problems.
 * A change during a check replaces the result of that check.
 */
export function useFamilyIssues(family?: Family): FamilyValidation {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);

  useEffect(() => {
    if (!family) {
      setIssues([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      validateFamily(family).then((result) => {
        if (!cancelled) setIssues(result);
      });
    }, VALIDATION_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [family]);

  const byItem = useMemo(() => issuesByItem(issues), [issues]);
  return { issues, byItem };
}
