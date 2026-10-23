import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { SelectPhaseButton } from "../src/components/SelectPhaseButton";
import { Phase } from "../src/types/chemistryModels";

const phases: Array<Phase> = ["Gas", "Aerosol", ""].map((name, index) => ({
  id: `0-0-0-0-${index}`,
  name,
  description: null,
  speciesIds: [],
  diffusionCoefficients: {},
}));

describe("SelectPhaseButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists the phases in the given order and selects one", async () => {
    const onSelect = vi.fn();
    render(
      <SelectPhaseButton
        aria-label="Add phase"
        phases={phases}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByLabelText("Add phase"));

    // A phase without a name shows a placeholder.
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Gas", "Aerosol", "<No Name>"]);

    fireEvent.click(screen.getByRole("menuitem", { name: "Aerosol" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(phases[1]);

    // A selection closes the menu.
    await waitFor(() =>
      expect(screen.queryAllByRole("menuitem")).toHaveLength(0),
    );
  });

  it("shows the text on the button when it has one", () => {
    render(
      <SelectPhaseButton
        aria-label="Add phase"
        text="Add Phase"
        phases={phases}
        onSelect={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Phase" }));

    expect(screen.getAllByRole("menuitem")).toHaveLength(phases.length);
  });

  it("shows a disabled message when there are no phases", () => {
    const onSelect = vi.fn();
    render(
      <SelectPhaseButton
        aria-label="Add phase"
        phases={[]}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByLabelText("Add phase"));

    const item = screen.getByRole("menuitem", { name: "No Phases Found" });
    expect(item.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
