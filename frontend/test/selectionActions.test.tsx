import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { Family } from "../src/types/chemistryModels";
import { SpeciesView } from "../src/components/familyEditor/SpeciesView";
import { PhaseView } from "../src/components/familyEditor/PhaseView";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";

/** Three species, two phases, and one reaction in the phase "gas". */
const family = {
  id: "111-111-111-111-000",
  name: "Family",
  description: "",
  owner: null,
  species: [
    { id: "111-111-111-111-001", name: "A", description: null, attributes: {} },
    { id: "111-111-111-111-002", name: "B", description: null, attributes: {} },
    { id: "111-111-111-111-003", name: "C", description: null, attributes: {} },
  ],
  phases: [
    {
      id: "222-222-222-222-001",
      name: "gas",
      description: null,
      speciesIds: ["111-111-111-111-001", "111-111-111-111-002"],
    },
    {
      id: "222-222-222-222-002",
      name: "aqueous",
      description: null,
      speciesIds: ["111-111-111-111-003"],
    },
  ],
  reactions: [
    {
      id: "333-333-333-333-001",
      name: "",
      description: null,
      type: "ARRHENIUS",
      gasPhaseId: "222-222-222-222-001",
      attributes: {},
      reactants: [{ speciesId: "111-111-111-111-001", coefficient: 1 }],
      products: [{ speciesId: "111-111-111-111-002", coefficient: 1 }],
    },
  ],
  mechanisms: [
    {
      id: "444-444-444-444-001",
      name: "Mechanism",
      description: null,
      familyId: "111-111-111-111-000",
      speciesIds: ["111-111-111-111-001", "111-111-111-111-002"],
      reactionIds: ["333-333-333-333-001"],
      phaseIds: ["222-222-222-222-001", "222-222-222-222-002"],
    },
  ],
} as unknown as Family;

/** Selects the row with this name. */
const selectRow = (name: string) => {
  const row = screen
    .getAllByRole("row")
    .find((element) =>
      within(element).queryByRole("gridcell", { name: new RegExp(`^${name}`) }),
    );
  if (!row) throw new Error(`No row ${name}`);
  fireEvent.click(within(row).getByRole("checkbox", { name: "Select row" }));
};

describe("Selection actions of the species and the phases", () => {
  afterEach(cleanup);

  it("deletes many species, and edits only one", () => {
    const updateFamily = vi.fn();
    render(
      <CustomThemeProvider>
        <SpeciesView family={family} updateFamily={updateFamily} />
      </CustomThemeProvider>,
    );
    expect(screen.queryByTestId("row-actions-button")).toBeNull();

    selectRow("A");
    expect(screen.getByTestId("edit-species-button")).toBeTruthy();
    selectRow("B");
    expect(screen.queryByTestId("edit-species-button")).toBeNull();

    fireEvent.click(screen.getByTestId("delete-species-button"));
    expect(screen.getByText(/This deletes 2 species/)).toBeTruthy();
    fireEvent.click(screen.getByTestId("confirm-action"));

    const updated: Family = updateFamily.mock.calls[0][0];
    expect(updated.species.map((s) => s.name)).toEqual(["C"]);
    expect(updated.phases[0].speciesIds).toEqual([]);
    expect(updated.mechanisms[0].speciesIds).toEqual([]);
    expect(updated.reactions[0].reactants).toEqual([]);
    expect(updated.reactions[0].products).toEqual([]);
  });

  it("deletes many phases, and tells which reactions lose their phase", () => {
    const updateFamily = vi.fn();
    render(
      <CustomThemeProvider>
        <PhaseView family={family} updateFamily={updateFamily} />
      </CustomThemeProvider>,
    );
    expect(screen.queryByTestId("row-actions-button")).toBeNull();

    selectRow("gas");
    selectRow("aqueous");
    expect(screen.queryByTestId("edit-phase-button")).toBeNull();
    fireEvent.click(screen.getByTestId("delete-phases-button"));
    expect(
      screen.getByText(/This deletes 2 phases. 1 reaction uses them./),
    ).toBeTruthy();
    fireEvent.click(screen.getByTestId("confirm-action"));

    const updated: Family = updateFamily.mock.calls[0][0];
    expect(updated.phases).toEqual([]);
    expect(updated.mechanisms[0].phaseIds).toEqual([]);
    expect(updated.reactions[0].gasPhaseId).toBeUndefined();
  });
});
