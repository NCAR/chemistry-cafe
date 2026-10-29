import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { SelectPhaseButton } from "../src/components/SelectPhaseButton";

describe("SelectPhaseButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows a button with the text and the add icon, and calls onSelect when it is clicked", () => {
    const onSelect = vi.fn();
    render(
      <SelectPhaseButton
        aria-label="Add phase"
        text="Add Phase"
        onSelect={onSelect}
      />,
    );

    const button = screen.getByRole("button", { name: "Add Phase" });
    expect(within(button).getByTestId("AddIcon")).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("shows an icon button with the label when it has no text", () => {
    const onSelect = vi.fn();
    render(<SelectPhaseButton aria-label="Add phase" onSelect={onSelect} />);

    const button = screen.getByRole("button", { name: "Add phase" });
    expect(within(button).getByTestId("AddIcon")).toBeTruthy();
    expect(button.textContent).toBe("");
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("opens nothing itself, and calls onSelect each time it is clicked", () => {
    const onSelect = vi.fn();
    render(
      <SelectPhaseButton
        aria-label="Add phase"
        text="Add Phase"
        onSelect={onSelect}
      />,
    );

    const button = screen.getByRole("button", { name: "Add Phase" });
    fireEvent.click(button);
    fireEvent.click(button);

    // The parent opens the dialog, so the button shows no menu or list.
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
