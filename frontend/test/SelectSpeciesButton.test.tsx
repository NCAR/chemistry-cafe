import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SelectSpeciesButton } from "../src/components/SelectSpeciesButton";
import { Species } from "../src/types/chemistryModels";

const species: Array<Species> = ["NO2", "C10H22", "ch4", "C2H6"].map(
  (name, index) => ({
    id: `0-0-0-0-${index}`,
    name,
    description: null,
    familyId: "9-9-9-9-9",
  }),
);

describe("SelectSpeciesButton", () => {
  it("lists the species in alphabetical order and finds them by search", () => {
    const onSelect = vi.fn();
    render(
      <SelectSpeciesButton
        aria-label="Add species"
        species={species}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByLabelText("Add species"));

    // Numbers sort by value, and the case of the letters does not matter.
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["C2H6", "C10H22", "ch4", "NO2"]);

    fireEvent.change(screen.getByPlaceholderText("Search species"), {
      target: { value: "no" },
    });
    fireEvent.click(screen.getByRole("option", { name: "NO2" }));
    expect(onSelect).toHaveBeenCalledWith(species[0]);
  });
});
