import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { SelectReactionButton } from "../src/components/SelectReactionButton";

describe("SelectReactionButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows a button with the text and the add icon, and calls onSelect when it is clicked", () => {
    const onSelect = vi.fn();
    render(
      <SelectReactionButton
        aria-label="Add reaction"
        text="Add Reaction"
        onSelect={onSelect}
      />,
    );

    const button = screen.getByRole("button", { name: "Add Reaction" });
    expect(within(button).getByTestId("AddIcon")).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("shows an icon button with the label when it has no text", () => {
    const onSelect = vi.fn();
    render(<SelectReactionButton aria-label="Add reaction" onSelect={onSelect} />);

    const button = screen.getByRole("button", { name: "Add reaction" });
    expect(within(button).getByTestId("AddIcon")).toBeTruthy();
    expect(button.textContent).toBe("");
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("opens nothing itself, and calls onSelect each time it is clicked", () => {
    const onSelect = vi.fn();
    render(
      <SelectReactionButton
        aria-label="Add reaction"
        text="Add Reaction"
        onSelect={onSelect}
      />,
    );

    const button = screen.getByRole("button", { name: "Add Reaction" });
    fireEvent.click(button);
    fireEvent.click(button);

    // The parent opens the dialog, so the button shows no menu or list.
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
