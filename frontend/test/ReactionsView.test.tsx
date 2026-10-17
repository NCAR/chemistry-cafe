import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { ReactionsView } from "../src/components/familyEditor/ReactionsView";
import { Family, Reaction } from "../src/types/chemistryModels";
import { AVOGADRO_CONSTANT } from "../src/helpers/rateUnits";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";

const species = (
  id: `${string}-${string}-${string}-${string}-${string}`,
  name: string,
) => ({
  id,
  name,
  description: null,
  familyId: "111-111-111-111-111" as const,
});

function makeReaction(
  id: `${string}-${string}-${string}-${string}-${string}`,
  name: string,
  type: Reaction["type"],
  attributes: Reaction["attributes"],
): Reaction {
  return {
    id,
    name,
    description: null,
    type,
    reactants: [
      { speciesId: "111-111-111-111-001", coefficient: 1 },
      { speciesId: "111-111-111-111-002", coefficient: 1 },
    ],
    products: [],
    attributes,
  };
}

const family: Family = {
  id: "111-111-111-111-111",
  name: "Test Family",
  description: "",
  owner: null,
  mechanisms: [],
  species: [
    species("111-111-111-111-001", "OH"),
    species("111-111-111-111-002", "NO2"),
  ],
  reactions: [
    makeReaction("222-222-222-222-001", "Troe reaction", "TROE", {
      k0A: { value: 1 },
      kinfA: { value: 1 },
    }),
    makeReaction("222-222-222-222-002", "Arrhenius reaction", "ARRHENIUS", {
      A: { value: 1 },
    }),
  ],
  phases: [],
};

function renderView(updateFamily: (family: Family) => void) {
  render(
    <CustomThemeProvider>
      <ReactionsView family={family} updateFamily={updateFamily} />
    </CustomThemeProvider>,
  );
}

async function selectType(name: string) {
  fireEvent.mouseDown(screen.getByLabelText("Type"));
  fireEvent.click(screen.getByRole("option", { name: new RegExp(`^${name}`) }));
  // The grid filters the rows, and then the table adds the parameter columns.
  await screen.findByRole("columnheader", { name: /^k0 A/ });
}

describe("ReactionsView reaction type filter", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows only the selected type and its parameters", async () => {
    renderView(vi.fn());
    expect(screen.getByText("Arrhenius reaction")).toBeTruthy();

    await selectType("Troe");

    expect(screen.queryByText("Arrhenius reaction")).toBeNull();
    const grid = screen.getByRole("grid");
    expect(within(grid).getByText("Troe reaction")).toBeTruthy();
    expect(
      within(grid).queryByRole("columnheader", { name: /Reaction Type/ }),
    ).toBeNull();
    expect(
      within(grid).getByRole("columnheader", { name: /k0 A/ }).textContent,
    ).toContain("(cm3 molecule-1)n s-1");
    expect(screen.getByText("Showing 1 of 2")).toBeTruthy();

    // The clear button shows all types again.
    fireEvent.click(screen.getByLabelText("Clear type"));
    expect(await screen.findByText("Arrhenius reaction")).toBeTruthy();
    await waitFor(() => expect(screen.queryByText(/^Showing/)).toBeNull());
    expect(
      screen.getByRole("columnheader", { name: "Parameters" }),
    ).toBeTruthy();
  });

  it("shows a summary for mixed types and columns when a search leaves one type", async () => {
    renderView(vi.fn());
    expect(
      screen.getByRole("columnheader", { name: "Parameters" }),
    ).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText("Search reactions"), {
      target: { value: "Troe" },
    });

    expect(
      await screen.findByRole("columnheader", { name: /^k0 A/ }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("columnheader", { name: "Parameters" }),
    ).toBeNull();
  });

  it("saves the SI value of a parameter edited in the table", async () => {
    const updateFamily = vi.fn();
    renderView(updateFamily);
    await selectType("Troe");

    // kinf A has the order 2: 1 m3 mol-1 s-1 is 1e6 / N_A cm3 molecule-1 s-1.
    const row = screen.getByRole("row", { name: /Troe reaction/ });
    const cells = within(row).getAllByRole("gridcell");
    const kinfCell = cells.find(
      (cell) => cell.getAttribute("data-field") === "parameter-kinfA",
    )!;
    // The cell shows 6 significant digits.
    expect(
      Number(kinfCell.textContent) / (1e6 / AVOGADRO_CONSTANT),
    ).toBeCloseTo(1, 5);

    fireEvent.doubleClick(kinfCell);
    const input = within(kinfCell).getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "2e-11" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(updateFamily).toHaveBeenCalled());
    const saved: Family = updateFamily.mock.calls[0][0];
    const troe = saved.reactions.find((r) => r.name === "Troe reaction")!;
    expect(troe.attributes.kinfA.value as number).toBeCloseTo(
      2e-11 / (1e6 / AVOGADRO_CONSTANT),
      5,
    );
    // The other parameter keeps its exact stored value.
    expect(troe.attributes.k0A.value).toBe(1);
  });
});
