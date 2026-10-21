import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportFamilyModal } from "../src/components/modals/ImportFamilyModal";

// jsdom does not implement File.text(), which FileUpload uses to read the file
if (!File.prototype.text) {
  File.prototype.text = function (this: File) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(this);
    });
  };
}

const upload = async (contents: string) => {
  render(<ImportFamilyModal open onClose={vi.fn()} onSubmit={vi.fn()} />);
  const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
  await userEvent.upload(
    input,
    new File([contents], "mechanism.json", { type: "application/json" }),
  );
};

describe("ImportFamilyModal", () => {
  it("shows the parser error for an invalid file", async () => {
    await upload(
      JSON.stringify({
        version: "1.0.0",
        species: [{ name: "A" }],
        phases: [{ name: "gas", species: [{ name: "B" }] }],
        reactions: [],
      }),
    );

    expect(
      await screen.findByText(
        /Unknown species name 'B' found in 'gas' phase/,
        {},
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create imported Family" }),
    ).toBeDisabled();
  });

  it("shows no error for a valid file", async () => {
    await upload(
      JSON.stringify({
        version: "1.0.0",
        name: "Valid",
        species: [{ name: "A" }],
        phases: [{ name: "gas", species: [{ name: "A" }] }],
        reactions: [],
      }),
    );

    expect(
      await screen.findByText("Name: Valid", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
