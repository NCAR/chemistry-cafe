import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import {
  bySpeciesName,
  SelectSpeciesButton,
} from "../src/components/SelectSpeciesButton";
import { Species } from "../src/types/chemistryModels";

const named = (name: string): Species => ({
  id: "0-0-0-0-0",
  name,
  description: null,
  familyId: "9-9-9-9-9",
});

describe("SelectSpeciesButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows a button with the text and the add icon, and calls onSelect when it is clicked", () => {
    const onSelect = vi.fn();
    render(
      <SelectSpeciesButton
        aria-label="Add species"
        text="Add Species"
        onSelect={onSelect}
      />,
    );

    const button = screen.getByRole("button", { name: "Add Species" });
    expect(within(button).getByTestId("AddIcon")).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("shows an icon button with the label when it has no text", () => {
    const onSelect = vi.fn();
    render(<SelectSpeciesButton aria-label="Add species" onSelect={onSelect} />);

    const button = screen.getByRole("button", { name: "Add species" });
    expect(within(button).getByTestId("AddIcon")).toBeTruthy();
    expect(button.textContent).toBe("");
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("opens nothing itself, and calls onSelect each time it is clicked", () => {
    const onSelect = vi.fn();
    render(
      <SelectSpeciesButton
        aria-label="Add species"
        text="Add Species"
        onSelect={onSelect}
      />,
    );

    const button = screen.getByRole("button", { name: "Add Species" });
    fireEvent.click(button);
    fireEvent.click(button);

    // The parent opens the dialog, so the button shows no menu or list.
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("bySpeciesName", () => {
  afterEach(() => {
    cleanup();
  });

  it("sorts numbers in names by value and ignores the case of letters", () => {
    const sorted = ["NO2", "C10H22", "ch4", "C2H6"]
      .map(named)
      .sort(bySpeciesName)
      .map((species) => species.name);

    expect(sorted).toEqual(["C2H6", "C10H22", "ch4", "NO2"]);
  });

  it("treats names that differ only in case as equal", () => {
    expect(bySpeciesName(named("ch4"), named("CH4"))).toBe(0);
  });

  it("puts a species without a name first", () => {
    const sorted = ["NO2", ""]
      .map(named)
      .sort(bySpeciesName)
      .map((species) => species.name);

    expect(sorted).toEqual(["", "NO2"]);
  });
});
