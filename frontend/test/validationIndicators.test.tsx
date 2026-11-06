import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { Family, Mechanism } from "../src/types/chemistryModels";
import {
  issuesByItem,
  validateMechanism,
} from "../src/helpers/validationIssues";
import { ReactionsTable } from "../src/components/familyEditor/ReactionsTable";
import { ValidationErrorsModal } from "../src/components/modals/ValidationErrorsModal";
import { FamilyValidationProvider } from "../src/components/familyEditor/FamilyValidationContext";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";

const mechanism: Mechanism = {
  id: "mechanism-id",
  name: "Test Mechanism",
  description: null,
  familyId: "family-id",
  speciesIds: ["species-a", "species-b"],
  reactionIds: ["reaction-ok", "reaction-bad"],
  phaseIds: ["phase-gas"],
};

/** Two reactions. The second one makes B, which is not in the gas phase. */
const family: Family = {
  id: "family-id",
  name: "Test Family",
  description: "",
  owner: null,
  mechanisms: [mechanism],
  species: [
    { id: "species-a", name: "A", description: null, attributes: {} },
    { id: "species-b", name: "B", description: null, attributes: {} },
  ],
  phases: [
    {
      id: "phase-gas",
      name: "gas",
      description: null,
      speciesIds: ["species-a"],
    },
  ],
  reactions: [
    {
      id: "reaction-ok",
      name: "",
      description: null,
      type: "ARRHENIUS",
      gasPhaseId: "phase-gas",
      attributes: {},
      reactants: [{ speciesId: "species-a", coefficient: 1 }],
      products: [],
    },
    {
      id: "reaction-bad",
      name: "",
      description: null,
      type: "ARRHENIUS",
      gasPhaseId: "phase-gas",
      attributes: {},
      reactants: [{ speciesId: "species-a", coefficient: 1 }],
      products: [{ speciesId: "species-b", coefficient: 1 }],
    },
  ],
} as unknown as Family;

describe("Validation indicators", () => {
  afterEach(cleanup);

  it("finds the reaction and the product that cause a problem", async () => {
    const issues = await validateMechanism(mechanism, family);

    expect(issues).toHaveLength(1);
    expect(issues[0].target).toEqual({
      kind: "reaction",
      id: "reaction-bad",
      field: "products",
      speciesId: "species-b",
    });
  });

  it("marks the product of the reaction in the table", async () => {
    const issues = await validateMechanism(mechanism, family);
    render(
      <CustomThemeProvider>
        <ReactionsTable
          reactions={family.reactions}
          species={family.species}
          phases={family.phases}
          getRowActions={() => []}
          issues={issuesByItem(issues)}
        />
      </CustomThemeProvider>,
    );

    // Only the product has a mark. The equation itself has none.
    expect(screen.getAllByTestId("problem-text")).toHaveLength(1);
    expect(screen.getByTestId("problem-text")).toHaveTextContent("B");

    // The filter leaves only the reaction with the problem.
    expect(document.querySelectorAll(".MuiDataGrid-row")).toHaveLength(2);
    fireEvent.click(screen.getByTestId("problems-filter"));
    const rows = document.querySelectorAll(".MuiDataGrid-row");
    expect(rows).toHaveLength(1);
    expect(within(rows[0] as HTMLElement).getByText("B")).toBeTruthy();
  });

  it("marks the equation for a problem about the whole reaction", () => {
    const issues = issuesByItem([
      {
        message: "Unknown reaction type",
        mechanismId: mechanism.id,
        mechanismName: mechanism.name,
        target: { kind: "reaction", id: "reaction-bad" },
      },
    ]);
    render(
      <CustomThemeProvider>
        <ReactionsTable
          reactions={family.reactions}
          species={family.species}
          phases={family.phases}
          getRowActions={() => []}
          issues={issues}
        />
      </CustomThemeProvider>,
    );

    // The reaction has a gas phase, so the equation shows the problem.
    const marks = screen.getAllByTestId("problem-text");
    expect(marks).toHaveLength(1);
    expect(marks[0]).toHaveTextContent("A → B");
  });

  it("opens the section of the problems from the messages", async () => {
    const issues = await validateMechanism(mechanism, family);
    const openSection = vi.fn();
    const onClose = vi.fn();
    render(
      <FamilyValidationProvider
        value={{ issues, byItem: issuesByItem(issues), openSection }}
      >
        <ValidationErrorsModal
          open
          onClose={onClose}
          message="Fix these problems."
          family={family}
          errors={issues}
        />
      </FamilyValidationProvider>,
    );

    const section = screen.getByTestId("validation-section-reactions");
    expect(section).toHaveTextContent("A → B");
    fireEvent.click(within(section).getByText("Show reactions"));
    expect(onClose).toHaveBeenCalled();
    expect(openSection).toHaveBeenCalledWith("reactions");
  });
});
