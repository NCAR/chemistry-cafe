import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  MechanismEditor,
  MechanismEditorProps,
} from "../src/components/MechanismEditor";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";
import { reactionToString } from "../src/helpers/stringify";
import {
  Family,
  Mechanism,
  Phase,
  Reaction,
  Species,
} from "../src/types/chemistryModels";

type Id = `${string}-${string}-${string}-${string}-${string}`;

const FAMILY_ID: Id = "111-111-111-111-111";
const OH_ID: Id = "111-111-111-111-001";
const NO2_ID: Id = "111-111-111-111-002";
const HNO3_ID: Id = "111-111-111-111-003";
const O3_ID: Id = "111-111-111-111-004";
const UNKNOWN_ID: Id = "111-111-111-111-999";
const TROE_ID: Id = "222-222-222-222-001";
const ARRHENIUS_ID: Id = "222-222-222-222-002";
const THIRD_ID: Id = "222-222-222-222-003";
const GAS_ID: Id = "333-333-333-333-001";
const AEROSOL_ID: Id = "333-333-333-333-002";

const makeSpecies = (id: Id, name: string): Species => ({
  id,
  name,
  description: null,
  familyId: FAMILY_ID,
});

const makeReaction = (
  id: Id,
  name: string,
  type: Reaction["type"],
  reactants: Array<Id>,
  attributes: Reaction["attributes"],
): Reaction => ({
  id,
  name,
  description: null,
  type,
  reactants: reactants.map((speciesId) => ({ speciesId, coefficient: 1 })),
  products: [],
  attributes,
});

const makePhase = (id: Id, name: string, speciesIds: Array<Id>): Phase => ({
  id,
  name,
  description: null,
  speciesIds,
  diffusionCoefficients: {},
});

// The mechanism has two of the four species, two of the three reactions, and
// one of the two phases. The two reactions have different types, so the table
// of reactions shows their names.
const mechanism: Mechanism = {
  id: "444-444-444-444-001",
  familyId: FAMILY_ID,
  name: "Test Mechanism",
  description: "A test mechanism",
  speciesIds: [OH_ID, NO2_ID],
  reactionIds: [TROE_ID, ARRHENIUS_ID],
  phaseIds: [GAS_ID],
};

const thirdReaction = makeReaction(
  THIRD_ID,
  "Third reaction",
  "ARRHENIUS",
  [HNO3_ID],
  { A: { value: 1 } },
);

const family: Family = {
  id: FAMILY_ID,
  name: "Test Family",
  description: "",
  owner: null,
  mechanisms: [mechanism],
  species: [
    makeSpecies(OH_ID, "OH"),
    makeSpecies(NO2_ID, "NO2"),
    makeSpecies(HNO3_ID, "HNO3"),
    makeSpecies(O3_ID, "O3"),
  ],
  reactions: [
    makeReaction(TROE_ID, "Troe reaction", "TROE", [OH_ID, NO2_ID], {
      k0A: { value: 1 },
      kinfA: { value: 1 },
    }),
    makeReaction(
      ARRHENIUS_ID,
      "Arrhenius reaction",
      "ARRHENIUS",
      [OH_ID, NO2_ID],
      { A: { value: 1 } },
    ),
    thirdReaction,
  ],
  phases: [
    makePhase(GAS_ID, "Gas", [OH_ID, NO2_ID]),
    makePhase(AEROSOL_ID, "Aerosol", [HNO3_ID]),
  ],
};

const editor = (props: MechanismEditorProps) => (
  <CustomThemeProvider>
    <MechanismEditor {...props} />
  </CustomThemeProvider>
);

function renderEditor(
  shownMechanism: Mechanism = mechanism,
  shownFamily: Family = family,
) {
  const updateMechanism = vi.fn();
  const navigateBack = vi.fn();
  const props: MechanismEditorProps = {
    family: shownFamily,
    mechanism: shownMechanism,
    updateMechanism,
    navigateBack,
  };
  const view = render(editor(props));
  return {
    updateMechanism,
    navigateBack,
    // The parent of the editor gives a new mechanism after a save.
    rerender: (next: Mechanism) =>
      view.rerender(editor({ ...props, mechanism: next })),
  };
}

const openTab = (name: string) =>
  fireEvent.click(screen.getByRole("tab", { name }));

// The Apply Changes button has the same aria-label as the Back button, so
// the tests find it by its text.
const applyButton = () =>
  screen.getByText("Apply Changes").closest("button")!;

// The row of the grid that shows the text.
const findRow = async (text: string) =>
  (await screen.findByText(text)).closest('[role="row"]') as HTMLElement;

describe("MechanismEditor info tab", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the tabs and starts on the info of the mechanism", () => {
    renderEditor();

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Info",
      "Species",
      "Reactions",
      "Phases",
    ]);
    expect(
      screen.getByRole("heading", { name: "Test Mechanism Info" }),
    ).toBeTruthy();
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "Test Mechanism",
    );
    expect(
      (screen.getByLabelText("Description") as HTMLTextAreaElement).value,
    ).toBe("A test mechanism");
  });

  it("shows a placeholder in the headings for a mechanism without a name", () => {
    renderEditor({ ...mechanism, name: "" });

    expect(
      screen.getByRole("heading", { name: "<No Name> Info" }),
    ).toBeTruthy();
  });

  it("goes back to the list", () => {
    const { navigateBack } = renderEditor();

    fireEvent.click(screen.getByText("Back"));

    expect(navigateBack).toHaveBeenCalledTimes(1);
  });

  it("saves the edited name and description only after Apply Changes", () => {
    const { updateMechanism } = renderEditor();
    expect(applyButton().disabled).toBe(true);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Renamed" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "New description" },
    });
    expect(applyButton().disabled).toBe(false);
    expect(updateMechanism).not.toHaveBeenCalled();

    fireEvent.click(applyButton());

    expect(updateMechanism).toHaveBeenCalledTimes(1);
    expect(updateMechanism).toHaveBeenCalledWith({
      ...mechanism,
      name: "Renamed",
      description: "New description",
    });
  });

  it("disables Apply Changes again when the saved mechanism comes back", () => {
    const { updateMechanism, rerender } = renderEditor();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Renamed" },
    });
    fireEvent.click(applyButton());
    expect(applyButton().disabled).toBe(false);

    rerender(updateMechanism.mock.calls[0][0] as Mechanism);

    expect(applyButton().disabled).toBe(true);
    expect(
      screen.getByRole("heading", { name: "Renamed Info" }),
    ).toBeTruthy();
  });
});

describe("MechanismEditor species tab", () => {
  afterEach(() => {
    cleanup();
  });

  it("removes a species from the mechanism", async () => {
    const { updateMechanism } = renderEditor();
    openTab("Species");

    fireEvent.click(
      within(await findRow("OH")).getByLabelText(
        "Remove species from mechanism",
      ),
    );

    await waitFor(() => expect(screen.queryByText("OH")).toBeNull());
    expect(screen.getByText("NO2")).toBeTruthy();
    fireEvent.click(applyButton());
    expect(updateMechanism).toHaveBeenCalledWith({
      ...mechanism,
      speciesIds: [NO2_ID],
    });
  });

  it("adds a species of the family that the mechanism does not have", async () => {
    const { updateMechanism } = renderEditor();
    openTab("Species");

    fireEvent.click(screen.getByRole("button", { name: "Add Species" }));
    // The list leaves out the species of the mechanism.
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "HNO3",
      "O3",
    ]);
    fireEvent.click(screen.getByRole("option", { name: "O3" }));

    // A selection closes the picker. The search field of the table has the
    // same placeholder, so the wait is for the options to go.
    await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0));
    expect(await screen.findByText("O3")).toBeTruthy();
    fireEvent.click(applyButton());
    // The new species is first.
    expect(updateMechanism).toHaveBeenCalledWith({
      ...mechanism,
      speciesIds: [O3_ID, OH_ID, NO2_ID],
    });
  });
});

describe("MechanismEditor reactions tab", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the reactions of the mechanism", async () => {
    renderEditor();
    openTab("Reactions");

    expect(
      screen.getByRole("heading", { name: "Test Mechanism Reactions" }),
    ).toBeTruthy();
    expect(await screen.findByText("Troe reaction")).toBeTruthy();
    expect(screen.getByText("Arrhenius reaction")).toBeTruthy();
    expect(screen.queryByText("Third reaction")).toBeNull();
  });

  it("removes a reaction from the mechanism", async () => {
    const { updateMechanism } = renderEditor();
    openTab("Reactions");

    fireEvent.click(
      within(await findRow("Troe reaction")).getByLabelText(
        "Remove reaction from mechanism",
      ),
    );

    await waitFor(() => expect(screen.queryByText("Troe reaction")).toBeNull());
    // One header row and the Arrhenius reaction.
    expect(within(screen.getByRole("grid")).getAllByRole("row")).toHaveLength(
      2,
    );
    fireEvent.click(applyButton());
    expect(updateMechanism).toHaveBeenCalledWith({
      ...mechanism,
      reactionIds: [ARRHENIUS_ID],
    });
  });

  it("adds a reaction of the family that the mechanism does not have", async () => {
    const { updateMechanism } = renderEditor();
    openTab("Reactions");

    fireEvent.click(screen.getByRole("button", { name: "Add Reaction" }));
    // The menu leaves out the reactions of the mechanism.
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual([reactionToString(thirdReaction, family.species)]);
    fireEvent.click(screen.getAllByRole("menuitem")[0]);

    expect(await screen.findByText("Third reaction")).toBeTruthy();
    fireEvent.click(applyButton());
    // The new reaction is first.
    expect(updateMechanism).toHaveBeenCalledWith({
      ...mechanism,
      reactionIds: [THIRD_ID, TROE_ID, ARRHENIUS_ID],
    });
  });
});

describe("MechanismEditor phases tab", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the phases of the mechanism with the names of their species", async () => {
    renderEditor();
    openTab("Phases");

    expect(
      screen.getByRole("heading", { name: "Test Mechanism Phases" }),
    ).toBeTruthy();
    expect(await screen.findByText("Gas")).toBeTruthy();
    expect(screen.getByText("OH, NO2")).toBeTruthy();
    expect(screen.queryByText("Aerosol")).toBeNull();
  });

  it("removes a phase from the mechanism", async () => {
    const { updateMechanism } = renderEditor();
    openTab("Phases");

    fireEvent.click(
      within(await findRow("Gas")).getByLabelText(
        "Remove phase from mechanism",
      ),
    );

    await waitFor(() => expect(screen.queryByText("Gas")).toBeNull());
    fireEvent.click(applyButton());
    expect(updateMechanism).toHaveBeenCalledWith({
      ...mechanism,
      phaseIds: [],
    });
  });

  it("adds a phase of the family that the mechanism does not have", async () => {
    const { updateMechanism } = renderEditor();
    openTab("Phases");

    fireEvent.click(screen.getByRole("button", { name: "Add Phase" }));
    // The menu leaves out the phases of the mechanism.
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Aerosol"]);
    fireEvent.click(screen.getAllByRole("menuitem")[0]);

    // The species of the new phase show in the table.
    expect(await screen.findByText("HNO3")).toBeTruthy();
    fireEvent.click(applyButton());
    // The new phase is first.
    expect(updateMechanism).toHaveBeenCalledWith({
      ...mechanism,
      phaseIds: [AEROSOL_ID, GAS_ID],
    });
  });
});

describe("MechanismEditor tables", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps the cells read-only", async () => {
    renderEditor();

    // The family editor edits these cells with a double-click.
    const cases: Array<[string, string]> = [
      ["Species", "OH"],
      ["Reactions", "Troe reaction"],
      ["Phases", "Gas"],
    ];
    for (const [tab, text] of cases) {
      openTab(tab);
      const cell = (await screen.findByText(text)).closest(
        '[role="gridcell"]',
      ) as HTMLElement;

      fireEvent.doubleClick(cell);

      expect(within(cell).queryByRole("textbox")).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// Edge cases that repeat on the three tabs
// ---------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, "0");

// Closes the list of an add button without a choice, and waits until the list
// is gone.
const clickAway = async () => {
  fireEvent.click(document.querySelector(".MuiBackdrop-root") as HTMLElement);
  await waitFor(() =>
    expect(document.querySelector(".MuiBackdrop-root")).toBeNull(),
  );
};

type TabCase = {
  tab: "Species" | "Reactions" | "Phases";
  /** The property of the mechanism with the IDs of the tab. */
  key: "speciesIds" | "reactionIds" | "phaseIds";
  addButton: string;
  removeLabel: string;
  /** The role of the items in the list of the add button. */
  itemRole: "option" | "menuitem";
  /** What the list shows when no item is left. */
  noItemsText: string;
  /** The IDs of all items of the family. */
  allIds: Array<Id>;
  /** The first two items of the mechanism, with their texts in the table. */
  first: { id: Id; text: string };
  second: { id: Id; text: string };
  /** The item that the list shows first when the mechanism has no items. */
  firstListed: Id;
  /** After the removal of the first item: the IDs that stay... */
  afterRemove: Array<Id>;
  /** ...the number of items that the list then shows... */
  listedAfterRemove: number;
  /** ...and the item of the list that the test picks. */
  pickIndex: number;
  picked: Id;
};

const tabCases: Array<TabCase> = [
  {
    tab: "Species",
    key: "speciesIds",
    addButton: "Add Species",
    removeLabel: "Remove species from mechanism",
    itemRole: "option",
    noItemsText: "No species found",
    allIds: [OH_ID, NO2_ID, HNO3_ID, O3_ID],
    first: { id: OH_ID, text: "OH" },
    second: { id: NO2_ID, text: "NO2" },
    // The list of species is in alphabetical order: HNO3, NO2, O3, OH.
    firstListed: HNO3_ID,
    afterRemove: [NO2_ID],
    listedAfterRemove: 3,
    pickIndex: 0,
    picked: HNO3_ID,
  },
  {
    tab: "Reactions",
    key: "reactionIds",
    addButton: "Add Reaction",
    removeLabel: "Remove reaction from mechanism",
    itemRole: "menuitem",
    noItemsText: "No Reactions Found",
    allIds: [TROE_ID, ARRHENIUS_ID, THIRD_ID],
    first: { id: TROE_ID, text: "Troe reaction" },
    second: { id: ARRHENIUS_ID, text: "Arrhenius reaction" },
    // The list of reactions is in the order of the family.
    firstListed: TROE_ID,
    afterRemove: [ARRHENIUS_ID],
    listedAfterRemove: 2,
    pickIndex: 1,
    picked: THIRD_ID,
  },
  {
    tab: "Phases",
    key: "phaseIds",
    addButton: "Add Phase",
    removeLabel: "Remove phase from mechanism",
    itemRole: "menuitem",
    noItemsText: "No Phases Found",
    allIds: [GAS_ID, AEROSOL_ID],
    first: { id: GAS_ID, text: "Gas" },
    second: { id: AEROSOL_ID, text: "Aerosol" },
    firstListed: GAS_ID,
    afterRemove: [],
    listedAfterRemove: 2,
    pickIndex: 1,
    picked: AEROSOL_ID,
  },
];

describe.each(tabCases)("MechanismEditor $tab tab edge cases", (c) => {
  afterEach(() => {
    cleanup();
  });

  const withIds = (ids: Array<Id>) =>
    ({ ...mechanism, [c.key]: ids }) as Mechanism;
  const addButton = () => screen.getByRole("button", { name: c.addButton });
  const gridRows = () => within(screen.getByRole("grid")).getAllByRole("row");

  it("shows each item once and no unknown items", async () => {
    renderEditor(withIds([c.first.id, c.first.id, UNKNOWN_ID, c.second.id]));
    openTab(c.tab);

    expect(
      screen.getByRole("heading", { name: `Test Mechanism ${c.tab}` }),
    ).toBeTruthy();
    // A second row for the repeated ID would make this query find two.
    await screen.findByText(c.first.text);
    expect(screen.getByText(c.second.text)).toBeTruthy();
    // One header row and the two items.
    expect(gridRows()).toHaveLength(3);
  });

  it("shows an empty table and offers every item when the mechanism has none", async () => {
    const { updateMechanism } = renderEditor(withIds([]));
    openTab(c.tab);

    // Only the header row.
    await waitFor(() => expect(gridRows()).toHaveLength(1));
    expect(applyButton().disabled).toBe(true);

    fireEvent.click(addButton());
    expect(screen.getAllByRole(c.itemRole)).toHaveLength(c.allIds.length);
    fireEvent.click(screen.getAllByRole(c.itemRole)[0]);
    fireEvent.click(applyButton());

    expect(updateMechanism).toHaveBeenCalledWith(withIds([c.firstListed]));
  });

  it("tells that no item is left when the mechanism has all of them", () => {
    renderEditor(withIds(c.allIds));
    openTab(c.tab);

    fireEvent.click(addButton());

    expect(screen.getByText(c.noItemsText)).toBeTruthy();
  });

  it("changes nothing when the add list closes without a choice", async () => {
    renderEditor();
    openTab(c.tab);
    await screen.findByText(c.first.text);

    fireEvent.click(addButton());
    await clickAway();

    expect(applyButton().disabled).toBe(true);
    expect(gridRows()).toHaveLength(mechanism[c.key].length + 1);
  });

  it("keeps a removal and an addition together in one save", async () => {
    const { updateMechanism } = renderEditor();
    openTab(c.tab);

    fireEvent.click(
      within(await findRow(c.first.text)).getByLabelText(c.removeLabel),
    );
    fireEvent.click(addButton());
    // The removed item is in the list again.
    expect(screen.getAllByRole(c.itemRole)).toHaveLength(c.listedAfterRemove);
    fireEvent.click(screen.getAllByRole(c.itemRole)[c.pickIndex]);
    fireEvent.click(applyButton());

    expect(updateMechanism).toHaveBeenCalledTimes(1);
    expect(updateMechanism).toHaveBeenCalledWith(
      withIds([c.picked, ...c.afterRemove]),
    );
  });
});

// A table shows 20 rows for each page. The names sort in the order of the
// IDs, and the reactions alternate between two types so that their names show.
const manyIds: Array<Id> = Array.from(
  { length: 25 },
  (_, index) => `555-555-555-555-${pad(index + 1)}` as Id,
);

const longCases: Array<{
  tab: TabCase["tab"];
  prefix: string;
  build: () => { family: Family; mechanism: Mechanism };
}> = [
  {
    tab: "Species",
    prefix: "S",
    build: () => ({
      family: {
        ...family,
        species: manyIds.map((id, index) =>
          makeSpecies(id, `S${pad(index + 1)}`),
        ),
      },
      mechanism: { ...mechanism, speciesIds: manyIds },
    }),
  },
  {
    tab: "Reactions",
    prefix: "R",
    build: () => ({
      family: {
        ...family,
        reactions: manyIds.map((id, index) =>
          makeReaction(
            id,
            `R${pad(index + 1)}`,
            index % 2 === 0 ? "ARRHENIUS" : "TROE",
            [OH_ID],
            {},
          ),
        ),
      },
      mechanism: { ...mechanism, reactionIds: manyIds },
    }),
  },
  {
    tab: "Phases",
    prefix: "P",
    build: () => ({
      family: {
        ...family,
        phases: manyIds.map((id, index) =>
          makePhase(id, `P${pad(index + 1)}`, []),
        ),
      },
      mechanism: { ...mechanism, phaseIds: manyIds },
    }),
  },
];

describe.each(longCases)(
  "MechanismEditor $tab tab with a long list",
  ({ tab, prefix, build }) => {
    afterEach(() => {
      cleanup();
    });

    it("shows the rows page by page", async () => {
      const long = build();
      renderEditor(long.mechanism, long.family);
      openTab(tab);
      const rows = () =>
        within(screen.getByRole("grid")).getAllByRole("row");

      // One header row and the 20 rows of the first page.
      await screen.findByText(`${prefix}01`);
      expect(screen.getByText(`${prefix}20`)).toBeTruthy();
      expect(screen.queryByText(`${prefix}21`)).toBeNull();
      expect(rows()).toHaveLength(21);

      fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));

      // One header row and the last 5 rows.
      expect(await screen.findByText(`${prefix}21`)).toBeTruthy();
      expect(screen.getByText(`${prefix}25`)).toBeTruthy();
      expect(screen.queryByText(`${prefix}01`)).toBeNull();
      expect(rows()).toHaveLength(6);
    });
  },
);

describe("MechanismEditor reactions tab with one type", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the parameters of a single type, and a summary when the types differ", async () => {
    renderEditor({ ...mechanism, reactionIds: [TROE_ID] });
    openTab("Reactions");

    // One type: its parameters have their own columns, and the name hides.
    expect(
      await screen.findByRole("columnheader", { name: /^k0 A/ }),
    ).toBeTruthy();
    expect(screen.queryByRole("columnheader", { name: /^Name/ })).toBeNull();
    expect(
      screen.queryByRole("columnheader", { name: /^Parameters/ }),
    ).toBeNull();

    // A reaction of another type brings the summary and the name back.
    fireEvent.click(screen.getByRole("button", { name: "Add Reaction" }));
    fireEvent.click(screen.getAllByRole("menuitem")[0]);

    expect(
      await screen.findByRole("columnheader", { name: /^Parameters/ }),
    ).toBeTruthy();
    expect(await screen.findByRole("columnheader", { name: /^Name/ })).toBeTruthy();
    expect(screen.queryByRole("columnheader", { name: /^k0 A/ })).toBeNull();
  });
});

describe("MechanismEditor info tab with empty values", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["Name", "name"],
    ["Description", "description"],
  ])("saves an empty %s", (label, key) => {
    const { updateMechanism } = renderEditor();

    fireEvent.change(screen.getByLabelText(label), { target: { value: "" } });
    expect(applyButton().disabled).toBe(false);
    fireEvent.click(applyButton());

    expect(updateMechanism).toHaveBeenCalledWith({ ...mechanism, [key]: "" });
  });

  it("shows the placeholder in the heading after an empty name is saved", () => {
    const { updateMechanism, rerender } = renderEditor();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "" } });
    fireEvent.click(applyButton());

    rerender(updateMechanism.mock.calls[0][0] as Mechanism);

    expect(
      screen.getByRole("heading", { name: "<No Name> Info" }),
    ).toBeTruthy();
  });
});
