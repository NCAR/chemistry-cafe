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
import { AVOGADRO_CONSTANT } from "../src/helpers/constants";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";
import { cFromEa, eaFromC } from "../src/helpers/activationEnergy";
import { AuthProvider } from "../src/components/AuthContext";
import { UserPreferencesProvider } from "../src/components/UserPreferencesContext";
import axios from "axios";

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

function renderView(
  updateFamily: (family: Family) => void,
  viewFamily: Family = family,
) {
  render(
    <CustomThemeProvider>
      <ReactionsView family={viewFamily} updateFamily={updateFamily} />
    </CustomThemeProvider>,
  );
}

// The cell of a parameter in the first data row
const parameterCell = (key: string) =>
  within(screen.getAllByRole("row")[1])
    .getAllByRole("gridcell")
    .find((cell) => cell.getAttribute("data-field") === `parameter-${key}`)!;

async function selectType(name: string) {
  fireEvent.mouseDown(screen.getByLabelText("Type"));
  fireEvent.click(screen.getByRole("option", { name: new RegExp(`^${name}`) }));
  // The grid filters the rows, and then the table adds the parameter columns.
  await screen.findByRole("columnheader", { name: /^k0 A/ });
}

describe("ReactionsView reaction type filter", () => {
  afterEach(() => {
    localStorage.clear();
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows only the selected type and its parameters", async () => {
    renderView(vi.fn());
    expect(screen.getByText("Arrhenius reaction")).toBeTruthy();

    await selectType("Troe");

    expect(screen.queryByText("Arrhenius reaction")).toBeNull();
    const grid = screen.getByRole("grid");
    // One header row and the Troe reaction. A Troe reaction hides the name.
    expect(within(grid).getAllByRole("row")).toHaveLength(2);
    expect(
      within(grid).queryByRole("columnheader", { name: "Name" }),
    ).toBeNull();
    expect(
      within(grid).queryByRole("columnheader", { name: /Reaction Type/ }),
    ).toBeNull();
    expect(
      within(grid).getByRole("columnheader", { name: /k0 A/ }).textContent,
    ).toContain("(cm3 molecule-1)n s-1");
    expect(screen.getByText("Showing 1 of 2")).toBeTruthy();

    // A second type shows its reactions too, with the parameter summary.
    fireEvent.click(screen.getByRole("option", { name: /^Arrhenius/ }));
    expect(await screen.findByText("Arrhenius reaction")).toBeTruthy();
    expect(
      await screen.findByRole("columnheader", { name: "Parameters" }),
    ).toBeTruthy();
    // One header row and the two reactions.
    expect(within(screen.getByRole("grid")).getAllByRole("row")).toHaveLength(
      3,
    );

    // The clear button removes all types.
    fireEvent.click(screen.getByLabelText("Clear type"));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Troe/ })).toBeNull(),
    );
    expect(screen.getByText("Arrhenius reaction")).toBeTruthy();
    expect(screen.queryByText(/^Showing/)).toBeNull();
  });

  it("shows the formula, units, and docs of the type in a popover", async () => {
    renderView(vi.fn());
    expect(screen.queryByRole("button", { name: /Rate constant/ })).toBeNull();

    await selectType("Troe");
    // A selected reaction shows the units for its own order.
    const row = screen.getAllByRole("row")[1];
    fireEvent.click(within(row).getAllByRole("gridcell")[1]);
    fireEvent.click(screen.getByRole("button", { name: /Rate constant/ }));

    const info = screen.getByRole("region", {
      name: "Troe (Fall-Off) rate constant",
    });
    expect(
      within(info).getByRole("link", { name: /Documentation/ }),
    ).toHaveProperty(
      "href",
      "https://mechanismconfiguration.readthedocs.io/en/latest/v1/reactions/troe.html",
    );
    expect(info.textContent).toContain("k0 Acm6 molecule-2 s-1");
    expect(info.textContent).toContain("(n = 2)");
  });

  it("shows a summary for mixed types and columns when a search leaves one type", async () => {
    renderView(vi.fn());
    expect(
      screen.getByRole("columnheader", { name: "Parameters" }),
    ).toBeTruthy();

    // An equation without spaces and in another species order finds both
    // reactions.
    fireEvent.change(screen.getByPlaceholderText("Search reactions"), {
      target: { value: "NO2+OH" },
    });
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(screen.getByText("Troe reaction")).toBeTruthy();
    expect(screen.getByText("Arrhenius reaction")).toBeTruthy();

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
    // The only data row is the Troe reaction.
    const kinfCell = parameterCell("kinfA");
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

  it("shows Ea with C in parentheses, and stores only the edited Ea", async () => {
    const updateFamily = vi.fn();
    const reaction = makeReaction(
      "222-222-222-222-003",
      "Arrhenius reaction",
      "ARRHENIUS",
      { A: { value: 1 }, C: { value: -500 } },
    );
    renderView(updateFamily, { ...family, reactions: [reaction] });
    await screen.findByRole("columnheader", { name: /^Ea/ });
    const ea = Number(eaFromC(-500).toPrecision(6));
    expect(parameterCell("Ea").textContent).toBe(`${ea}(C = -500 K)`);

    fireEvent.doubleClick(parameterCell("Ea"));
    const input = within(parameterCell("Ea")).getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "1e-20" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(updateFamily).toHaveBeenCalled());
    const attributes = updateFamily.mock.calls[0][0].reactions[0].attributes;
    expect(attributes.Ea.value).toBe(1e-20);
    expect(attributes.C).toBeUndefined();
  });

  it("shows and edits C when the user enters C", async () => {
    // No user is logged in, so the preference comes from local storage.
    vi.spyOn(axios, "get").mockRejectedValue(new Error("401"));
    localStorage.setItem(
      "userPreferences",
      JSON.stringify({ activationParameter: "C" }),
    );
    const updateFamily = vi.fn();
    const reaction = makeReaction(
      "222-222-222-222-003",
      "Arrhenius reaction",
      "ARRHENIUS",
      { A: { value: 1 }, Ea: { value: 1e-20 } },
    );
    render(
      <CustomThemeProvider>
        <AuthProvider>
          <UserPreferencesProvider>
            <ReactionsView
              family={{ ...family, reactions: [reaction] }}
              updateFamily={updateFamily}
            />
          </UserPreferencesProvider>
        </AuthProvider>
      </CustomThemeProvider>,
    );
    await screen.findByRole("columnheader", { name: /^C/ });
    const c = Number(cFromEa(1e-20).toPrecision(6));
    expect(parameterCell("C").textContent).toBe(`${c}(Ea = 1e-20 J)`);

    fireEvent.doubleClick(parameterCell("C"));
    const input = within(parameterCell("C")).getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "-250" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(updateFamily).toHaveBeenCalled());
    const attributes = updateFamily.mock.calls[0][0].reactions[0].attributes;
    expect(attributes.C.value).toBe(-250);
    expect(attributes.Ea).toBeUndefined();
  });
});
