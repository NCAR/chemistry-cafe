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

  it("shows the value in molecule units by default", () => {
    renderEditor(makeReaction("ARRHENIUS", { A: { value: 1 } }));
    const input = screen.getByLabelText(
      `A [${rateUnitLabel("Molecule", 2)}]`,
    ) as HTMLInputElement;
    expect(Number(input.value)).toBe(roundDisplayValue(secondOrderFactor));
    expect(screen.getByText("Stored as 1 m3 mol-1 s-1")).toBeTruthy();
  });

  it("uses the units that the user selects for the reaction type", () => {
    localStorage.setItem(
      "userPreferences",
      JSON.stringify({ rateUnits: { ARRHENIUS: "SI" } }),
    );
    renderEditor(makeReaction("ARRHENIUS", { A: { value: 1 } }));
    const input = screen.getByLabelText(
      `A [${rateUnitLabel("SI", 2)}]`,
    ) as HTMLInputElement;
    expect(input.value).toBe("1");
    expect(screen.queryByText(/Stored as/)).toBeNull();
    cleanup();

    // Other reaction types keep their own units.
    renderEditor(makeReaction("TUNNELING", { A: { value: 1 } }));
    expect(
      screen.getByLabelText(`A [${rateUnitLabel("Molecule", 2)}]`),
    ).toBeTruthy();
  });

  it("saves the SI value of a value typed in molecule units", () => {
    const onUpdate = renderEditor(
      makeReaction("TROE", { k0A: { value: 1 }, kinfA: { value: 1 } }),
    );
    const k0 = screen.getByLabelText(
      `k0 A [${rateUnitLabel("Molecule", 3)}]`,
    ) as HTMLInputElement;
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
});
