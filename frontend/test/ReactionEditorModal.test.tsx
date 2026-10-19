import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import { ReactionEditorModal } from "../src/components/modals/ReactionEditorModal";
import { AuthProvider } from "../src/components/AuthContext";
import { UserPreferencesProvider } from "../src/components/UserPreferencesContext";
import { Family, Reaction } from "../src/types/chemistryModels";
import {
  AVOGADRO_CONSTANT,
  rateUnitLabel,
  roundDisplayValue,
} from "../src/helpers/rateUnits";

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
function renderEditor(reaction: Reaction, onUpdate = vi.fn()) {
  const editor = (selected?: Reaction) => (
    <AuthProvider>
      <UserPreferencesProvider>
        <ReactionEditorModal
          open
          onClose={() => {}}
          onUpdate={onUpdate}
          reaction={selected}
          family={family}
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

  it("edits the alkoxy and nitrate products of a branched reaction", () => {
    const onUpdate = renderEditor({
      ...makeReaction("BRANCHED_NO_RO2", {}),
      // A product without a branch shows in the first branch.
      products: [{ speciesId: "111-111-111-111-001", coefficient: 1 }],
    });
    expect(screen.queryByLabelText("Equation")).toBeNull();
    const alkoxy = screen.getByLabelText("Alkoxy products") as HTMLInputElement;
    const nitrate = screen.getByLabelText(
      "Nitrate products",
    ) as HTMLInputElement;
    expect(alkoxy.value).toBe("OH");
    expect(nitrate.value).toBe("");

    // A species can be in only one branch.
    fireEvent.change(nitrate, { target: { value: "OH" } });
    fireEvent.keyDown(nitrate, { key: "Enter" });
    expect(
      screen.getByText("OH is already in the alkoxy products"),
    ).toBeTruthy();

    fireEvent.change(nitrate, { target: { value: "2 NO2" } });
    fireEvent.keyDown(nitrate, { key: "Enter" });
    fireEvent.click(screen.getByTestId("save-reaction-changes"));

    const saved: Reaction = onUpdate.mock.calls[0][0];
    expect(saved.products).toEqual([
      { speciesId: "111-111-111-111-001", coefficient: 1, branch: "alkoxy" },
      { speciesId: "111-111-111-111-002", coefficient: 2, branch: "nitrate" },
    ]);
  });
});
