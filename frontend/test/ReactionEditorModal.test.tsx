import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import { ReactionEditorModal } from "../src/components/modals/ReactionEditorModal";
import { AuthProvider } from "../src/components/AuthContext";
import { UserPreferencesProvider } from "../src/components/UserPreferencesContext";
import { Family, Reaction } from "../src/types/chemistryModels";
import { rateUnitLabel, roundDisplayValue } from "../src/helpers/rateUnits";
import {
  AVOGADRO_CONSTANT,
  BOLTZMANN_CONSTANT,
} from "../src/helpers/constants";

vi.mock("axios");

const family: Family = {
  id: "111-111-111-111-111",
  name: "Test Family",
  description: "",
  owner: null,
  mechanisms: [],
  species: [
    {
      id: "111-111-111-111-001",
      name: "OH",
      description: null,
      familyId: "111-111-111-111-111",
    },
    {
      id: "111-111-111-111-002",
      name: "NO2",
      description: null,
      familyId: "111-111-111-111-111",
    },
  ],
  reactions: [],
  phases: [],
};

const twoReactants = [
  { speciesId: "111-111-111-111-001" as const, coefficient: 1 },
  { speciesId: "111-111-111-111-002" as const, coefficient: 1 },
];

// 1 m3 mol-1 s-1 in cm3 molecule-1 s-1
const secondOrderFactor = 1e6 / AVOGADRO_CONSTANT;

function makeReaction(
  type: Reaction["type"],
  attributes: Reaction["attributes"],
): Reaction {
  return {
    id: "222-222-222-222-222",
    name: "Test Reaction",
    description: null,
    type,
    reactants: twoReactants,
    products: [],
    attributes,
  };
}

// Like ReactionsView, the test mounts the editor without a reaction and then
// selects one.
function renderEditor(
  reaction: Reaction,
  onUpdate = vi.fn(),
  testFamily = family,
  onAddSpeciesToPhase = vi.fn(),
) {
  const editor = (selected?: Reaction) => (
    <AuthProvider>
      <UserPreferencesProvider>
        <ReactionEditorModal
          open
          onClose={() => {}}
          onUpdate={onUpdate}
          onAddSpeciesToPhase={onAddSpeciesToPhase}
          reaction={selected}
          family={testFamily}
        />
      </UserPreferencesProvider>
    </AuthProvider>
  );
  const { rerender } = render(editor());
  rerender(editor(reaction));
  return onUpdate;
}

describe("ReactionEditorModal rate parameter units", () => {
  beforeEach(() => {
    // No user is logged in.
    vi.spyOn(axios, "get").mockRejectedValue(new Error("401"));
  });

  afterEach(() => {
    localStorage.clear();
    cleanup();
    vi.restoreAllMocks();
  });

  it("keeps all reactants of a reaction with many reactants", () => {
    const onUpdate = renderEditor(
      makeReaction("ARRHENIUS", { A: { value: 1 } }),
    );
    fireEvent.click(screen.getByTestId("save-reaction-changes"));
    expect(onUpdate.mock.calls[0][0].reactants).toEqual(twoReactants);
  });

  it("shows Ea with C in parentheses, and stores only the edited Ea", () => {
    const onUpdate = renderEditor(
      makeReaction("ARRHENIUS", { A: { value: 1 }, C: { value: -500 } }),
    );
    const ea = screen.getByLabelText("Ea") as HTMLInputElement;
    expect(Number(ea.value)).toBeCloseTo(500 * BOLTZMANN_CONSTANT, 30);
    expect(screen.getByText("(C = -500 K)")).toBeTruthy();

    fireEvent.change(ea, { target: { value: "1e-20" } });
    expect(screen.getByText("(C = -724.297 K)")).toBeTruthy();
    fireEvent.click(screen.getByTestId("save-reaction-changes"));

    const saved: Reaction = onUpdate.mock.calls[0][0];
    expect(saved.attributes.Ea.value).toBe(1e-20);
    expect(saved.attributes.C).toBeUndefined();
    expect(saved.attributes.A.value).toBe(1);
  });

  it("shows molecule units by default and saves the SI value", () => {
    const onUpdate = renderEditor(
      makeReaction("TROE", { k0A: { value: 1 }, kinfA: { value: 1 } }),
    );
    // The unit is at the end of the field, and the SI value is in a tooltip.
    const unitOf = (input: HTMLElement) =>
      input.parentElement!.querySelector(".MuiInputAdornment-root")!
        .textContent;
    const kinf = screen.getByLabelText("kinf A") as HTMLInputElement;
    expect(Number(kinf.value)).toBe(roundDisplayValue(secondOrderFactor));
    expect(unitOf(kinf)).toBe(rateUnitLabel("Molecule", 2));
    expect(screen.getByLabelText("Stored as 1 m3 mol-1 s-1")).toBeTruthy();

    const k0 = screen.getByLabelText("k0 A") as HTMLInputElement;
    expect(unitOf(k0)).toBe(rateUnitLabel("Molecule", 3));
    fireEvent.change(k0, { target: { value: "1.8e-30" } });
    fireEvent.click(screen.getByTestId("save-reaction-changes"));

    const saved: Reaction = onUpdate.mock.calls[0][0];
    expect(saved.attributes.k0A.value as number).toBeCloseTo(
      1.8e-30 / secondOrderFactor ** 2,
      5,
    );
    // An unchanged parameter keeps its exact stored value.
    expect(saved.attributes.kinfA.value).toBe(1);
  });

  it("applies a typed equation and does not save one with unknown species", () => {
    const onUpdate = renderEditor(
      makeReaction("ARRHENIUS", { A: { value: 1 } }),
    );
    const equation = screen.getByLabelText("Equation") as HTMLInputElement;
    expect(equation.value).toBe("OH + NO2 ->");

    // An unknown species shows an error, and the save stops.
    fireEvent.change(equation, { target: { value: "OH + NO3 -> NO2" } });
    fireEvent.keyDown(equation, { key: "Enter" });
    expect(screen.getByText("Unknown species: NO3")).toBeTruthy();
    fireEvent.click(screen.getByTestId("save-reaction-changes"));
    expect(onUpdate).not.toHaveBeenCalled();

    // A valid equation that is not applied yet is part of the save.
    fireEvent.change(equation, { target: { value: "2 NO2 -> OH" } });
    fireEvent.click(screen.getByTestId("save-reaction-changes"));
    const saved: Reaction = onUpdate.mock.calls[0][0];
    expect(saved.reactants).toEqual([
      { speciesId: "111-111-111-111-002", coefficient: 2 },
    ]);
    expect(saved.products).toEqual([
      { speciesId: "111-111-111-111-001", coefficient: 1 },
    ]);
  });

  it("requires a gas phase and rejects species outside that phase", () => {
    const gasPhaseId = "333-333-333-333-001";
    const aerosolPhaseId = "333-333-333-333-002";
    const familyWithPhases: Family = {
      ...family,
      phases: [
        {
          id: gasPhaseId,
          name: "Gas",
          description: null,
          speciesIds: [family.species[0].id],
        },
        {
          id: aerosolPhaseId,
          name: "Aerosol",
          description: null,
          speciesIds: [family.species[1].id],
        },
      ],
    };
    const onUpdate = renderEditor(
      {
        ...makeReaction("ARRHENIUS", { A: { value: 1 } }),
        reactants: [],
        products: [],
      },
      vi.fn(),
      familyWithPhases,
    );

    fireEvent.click(screen.getByTestId("save-reaction-changes"));
    expect(
      screen.getByText("Select a gas phase for this reaction"),
    ).toBeTruthy();
    expect(onUpdate).not.toHaveBeenCalled();

    fireEvent.mouseDown(
      screen.getByRole("combobox", { name: "Gas Phase" }),
    );
    fireEvent.click(screen.getByRole("option", { name: "Gas" }));
    fireEvent.click(screen.getByLabelText("select-reaction-species"));
    expect(screen.getByRole("option", { name: "OH" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "NO2" })).toBeNull();
    fireEvent.click(screen.getByRole("option", { name: "OH" }));

    const equation = screen.getByLabelText("Equation") as HTMLInputElement;
    fireEvent.change(equation, { target: { value: "OH -> NO2" } });
    fireEvent.keyDown(equation, { key: "Enter" });
    expect(
      screen.getByText("Species NO2 is not in the selected gas phase"),
    ).toBeTruthy();
    fireEvent.click(screen.getByTestId("save-reaction-changes"));
    expect(onUpdate).not.toHaveBeenCalled();

    fireEvent.change(equation, { target: { value: "OH ->" } });
    fireEvent.click(screen.getByTestId("save-reaction-changes"));
    expect(onUpdate.mock.calls[0][0].gasPhaseId).toBe(gasPhaseId);
    expect(onUpdate.mock.calls[0][0].reactants).toEqual([
      { speciesId: family.species[0].id, coefficient: 1 },
    ]);
  });

  it("asks before adding missing reaction species to a newly selected phase", () => {
    const gasPhaseId = "333-333-333-333-001";
    const aerosolPhaseId = "333-333-333-333-002";
    const familyWithPhases: Family = {
      ...family,
      phases: [
        {
          id: gasPhaseId,
          name: "Gas",
          description: null,
          speciesIds: family.species.map((species) => species.id),
        },
        {
          id: aerosolPhaseId,
          name: "Aerosol",
          description: null,
          speciesIds: [family.species[1].id],
        },
      ],
    };
    const onAddSpeciesToPhase = vi.fn();
    renderEditor(
      {
        ...makeReaction("ARRHENIUS", { A: { value: 1 } }),
        gasPhaseId,
      },
      vi.fn(),
      familyWithPhases,
      onAddSpeciesToPhase,
    );

    fireEvent.mouseDown(
      screen.getByRole("combobox", { name: "Gas Phase" }),
    );
    fireEvent.click(screen.getByRole("option", { name: "Aerosol" }));

    expect(
      screen.getByText(/selected gas phase does not contain OH/),
    ).toBeTruthy();
    expect(onAddSpeciesToPhase).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("cancel-phase-change"));
    expect(
      screen
        .getByTestId("reaction-gas-phase-select")
        .querySelector(".MuiSelect-select"),
    ).toHaveTextContent("Gas");
    expect(onAddSpeciesToPhase).not.toHaveBeenCalled();
  });

  it("adds missing reactants and products when confirming a phase change", () => {
    const gasPhaseId = "333-333-333-333-001";
    const aerosolPhaseId = "333-333-333-333-002";
    const familyWithPhases: Family = {
      ...family,
      phases: [
        {
          id: gasPhaseId,
          name: "Gas",
          description: null,
          speciesIds: family.species.map((species) => species.id),
        },
        {
          id: aerosolPhaseId,
          name: "Aerosol",
          description: null,
          speciesIds: [],
        },
      ],
    };
    const onAddSpeciesToPhase = vi.fn();
    renderEditor(
      {
        ...makeReaction("ARRHENIUS", { A: { value: 1 } }),
        gasPhaseId,
        products: [
          { speciesId: family.species[0].id, coefficient: 1 },
        ],
      },
      vi.fn(),
      familyWithPhases,
      onAddSpeciesToPhase,
    );

    fireEvent.mouseDown(
      screen.getByRole("combobox", { name: "Gas Phase" }),
    );
    fireEvent.click(screen.getByRole("option", { name: "Aerosol" }));
    fireEvent.click(
      screen.getByTestId("add-reaction-species-to-phase"),
    );

    expect(onAddSpeciesToPhase).toHaveBeenCalledWith(aerosolPhaseId, [
      family.species[0].id,
      family.species[1].id,
    ]);
    expect(
      screen
        .getByTestId("reaction-gas-phase-select")
        .querySelector(".MuiSelect-select"),
    ).toHaveTextContent("Aerosol");
  });

  it("edits the alkoxy and nitrate products of a branched reaction", () => {
    const onUpdate = renderEditor({
      ...makeReaction("BRANCHED_NO_RO2", {}),
      // A product without a branch is in the first branch.
      products: [{ speciesId: "111-111-111-111-001", coefficient: 1 }],
    });
    const equation = screen.getByLabelText(
      "Equation (alkoxy | nitrate)",
    ) as HTMLInputElement;
    expect(equation.value).toBe("OH + NO2 -> OH |");

    // A species can be in only one branch.
    fireEvent.change(equation, { target: { value: "OH + NO2 -> OH | OH" } });
    fireEvent.keyDown(equation, { key: "Enter" });
    expect(
      screen.getByText("OH can be in only one product branch"),
    ).toBeTruthy();

    fireEvent.change(equation, {
      target: { value: "OH + NO2 -> OH | 2 NO2" },
    });
    fireEvent.click(screen.getByTestId("save-reaction-changes"));

    const saved: Reaction = onUpdate.mock.calls[0][0];
    expect(saved.products).toEqual([
      { speciesId: "111-111-111-111-001", coefficient: 1, branch: "alkoxy" },
      { speciesId: "111-111-111-111-002", coefficient: 2, branch: "nitrate" },
    ]);
  });

  it("allows coefficients for emissions and one-reactant types", () => {
    const onUpdate = renderEditor({
      ...makeReaction("EMISSION", {}),
      reactants: [],
    });
    const equation = screen.getByLabelText("Equation") as HTMLInputElement;
    // An emission has only one product, with any coefficient.
    fireEvent.change(equation, { target: { value: "-> 2 NO2 + OH" } });
    fireEvent.keyDown(equation, { key: "Enter" });
    expect(
      screen.getByText("This reaction type has only one product"),
    ).toBeTruthy();
    fireEvent.change(equation, { target: { value: "-> 2 NO2" } });
    fireEvent.click(screen.getByTestId("save-reaction-changes"));
    expect(onUpdate.mock.calls[0][0].products).toEqual([
      { speciesId: "111-111-111-111-002", coefficient: 2 },
    ]);
    cleanup();

    const onLossUpdate = renderEditor(makeReaction("FIRST_ORDER_LOSS", {}));
    const lossEquation = screen.getByLabelText("Equation") as HTMLInputElement;
    // A first-order loss has only one reactant, with any coefficient.
    expect(lossEquation.value).toBe("OH ->");
    fireEvent.change(lossEquation, { target: { value: "OH + NO2 ->" } });
    fireEvent.keyDown(lossEquation, { key: "Enter" });
    expect(
      screen.getByText("This reaction type has only one reactant"),
    ).toBeTruthy();
    fireEvent.change(lossEquation, { target: { value: "0.5 OH ->" } });
    fireEvent.click(screen.getByTestId("save-reaction-changes"));
    expect(onLossUpdate.mock.calls[0][0].reactants).toEqual([
      { speciesId: "111-111-111-111-001", coefficient: 0.5 },
    ]);
  });
});
