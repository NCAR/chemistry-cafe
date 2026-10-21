import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { SelectReactionButton } from "../src/components/SelectReactionButton";
import { reactionToString } from "../src/helpers/stringify";
import { Family, Reaction, Species } from "../src/types/chemistryModels";

const species: Array<Species> = ["OH", "NO2", "HNO3"].map((name, index) => ({
  id: `0-0-0-0-${index}`,
  name,
  description: null,
  familyId: "9-9-9-9-9",
}));

const makeReaction = (
  id: `${string}-${string}-${string}-${string}-${string}`,
  reactants: Array<Species>,
): Reaction => ({
  id,
  name: "",
  description: null,
  type: "ARRHENIUS",
  reactants: reactants.map((reactant) => ({
    speciesId: reactant.id,
    coefficient: 1,
  })),
  products: [],
  attributes: {},
});

// The equations differ, so that the order of the list shows.
const reactions: Array<Reaction> = [
  makeReaction("1-1-1-1-1", [species[0], species[1]]),
  makeReaction("1-1-1-1-2", [species[2]]),
  makeReaction("1-1-1-1-3", [species[1]]),
];

const family: Family = {
  id: "9-9-9-9-9",
  name: "Test Family",
  description: "",
  owner: null,
  mechanisms: [],
  species,
  reactions,
  phases: [],
};

describe("SelectReactionButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists the reactions as equations in the given order and selects one", async () => {
    const onSelect = vi.fn();
    render(
      <SelectReactionButton
        aria-label="Add reaction"
        family={family}
        reactions={reactions}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByLabelText("Add reaction"));

    const labels = screen
      .getAllByRole("menuitem")
      .map((item) => item.textContent);
    expect(labels).toEqual(
      reactions.map((reaction) => reactionToString(reaction, species)),
    );
    expect(new Set(labels).size).toBe(reactions.length);

    fireEvent.click(screen.getAllByRole("menuitem")[1]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(reactions[1]);

    // A selection closes the menu.
    await waitFor(() =>
      expect(screen.queryAllByRole("menuitem")).toHaveLength(0),
    );
  });

  it("shows the text on the button when it has one", () => {
    render(
      <SelectReactionButton
        aria-label="Add reaction"
        text="Add Reaction"
        family={family}
        reactions={reactions}
        onSelect={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Reaction" }));

    expect(screen.getAllByRole("menuitem")).toHaveLength(reactions.length);
  });

  it("shows a disabled message when there are no reactions", () => {
    const onSelect = vi.fn();
    render(
      <SelectReactionButton
        aria-label="Add reaction"
        family={family}
        reactions={[]}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByLabelText("Add reaction"));

    const item = screen.getByRole("menuitem", { name: "No Reactions Found" });
    expect(item.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
