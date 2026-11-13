import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JSZip from "jszip";
import { ImportFamilyModal } from "../src/components/modals/ImportFamilyModal";
import { Family } from "../src/types/chemistryModels";

// jsdom does not implement File.text() and File.arrayBuffer(), which the
// import uses to read the files. The buffer of the jsdom FileReader comes from
// another realm, which JSZip does not accept, so the bytes are copied.
const read = (file: Blob, as: "text" | "buffer") =>
  new Promise<any>((resolve) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(
        as === "text"
          ? reader.result
          : Uint8Array.from(new Uint8Array(reader.result as ArrayBuffer))
              .buffer,
      );
    if (as === "text") reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  });
if (!File.prototype.text) {
  File.prototype.text = function (this: File) {
    return read(this, "text");
  };
}
if (!File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = function (this: File) {
    return read(this, "buffer");
  };
}

const json = (name: string, contents: object | Array<object>) =>
  new File([JSON.stringify(contents)], name, { type: "application/json" });

const zip = async (files: Record<string, object>) => {
  const archive = new JSZip();
  for (const [path, contents] of Object.entries(files)) {
    archive.file(path, JSON.stringify(contents));
  }
  archive.file("__MACOSX/._config.json", "not a configuration");
  const blob = await archive.generateAsync({ type: "uint8array" });
  return new File([blob], "mechanism.zip", { type: "application/zip" });
};

const upload = async (...files: Array<File>) => {
  const onSubmit = vi.fn();
  render(<ImportFamilyModal open onClose={vi.fn()} onSubmit={onSubmit} />);
  const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
  await userEvent.upload(input, files);
  return onSubmit;
};

const createButton = () =>
  screen.getByRole("button", { name: "Create imported Family" });

const findInfo = (text: string | RegExp) =>
  screen.findByText(text, {}, { timeout: 5000 });

/** Submits the imported family and gives it. */
const submit = async (onSubmit: ReturnType<typeof vi.fn>): Promise<Family> => {
  await userEvent.click(createButton());
  return onSubmit.mock.calls[0][0];
};

const reaction = {
  type: "ARRHENIUS",
  reactants: [{ name: "A" }],
  products: [{ name: "B" }],
  "gas phase": "gas",
};

describe("ImportFamilyModal", () => {
  it("imports a file with problems and lists the problems", async () => {
    const onSubmit = await upload(
      json("mechanism.json", {
        version: "1.0.0",
        name: "Partial",
        species: [{ name: "A" }],
        phases: [{ name: "gas", species: [{ name: "A" }, { name: "B" }] }],
        reactions: [reaction, { type: "NOT_A_TYPE" }],
      }),
    );

    expect(await findInfo("Name: Partial")).toBeInTheDocument();
    expect(screen.getByText("Reaction Count: 1")).toBeInTheDocument();
    expect(screen.getByTestId("import-problems")).toHaveTextContent(
      /Unknown species name 'B' found in 'gas' phase/,
    );
    expect(screen.getByTestId("import-problems")).toHaveTextContent(
      /NOT_A_TYPE/,
    );
    expect(screen.getByTestId("import-added-species")).toHaveTextContent(
      /: B\./,
    );

    const family = await submit(onSubmit);
    const b = family.species.find((s) => s.name === "B")!;
    expect(family.phases[0].speciesIds).toContain(b.id);
    expect(family.reactions[0].products[0].speciesId).toBe(b.id);
  });

  it("shows no problems for a valid file", async () => {
    await upload(
      json("mechanism.json", {
        version: "1.0.0",
        name: "Valid",
        species: [{ name: "A" }],
        phases: [{ name: "gas", species: [{ name: "A" }] }],
        reactions: [],
      }),
    );

    expect(await findInfo("Name: Valid")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("imports a v0 configuration from a zip file as v1", async () => {
    const onSubmit = await upload(
      await zip({
        "chapman/config.json": {
          "camp-files": ["species.json", "reactions.json"],
        },
        "chapman/species.json": {
          "camp-data": [
            { name: "A", type: "CHEM_SPEC" },
            { name: "B", type: "CHEM_SPEC" },
          ],
        },
        "chapman/reactions.json": {
          "camp-data": [
            {
              name: "Zipped",
              type: "MECHANISM",
              reactions: [
                {
                  type: "ARRHENIUS",
                  reactants: { A: {} },
                  products: { B: {} },
                },
              ],
            },
          ],
        },
      }),
    );

    expect(await findInfo("Name: Zipped")).toBeInTheDocument();
    expect(screen.getByText("Species Count: 2")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    const family = await submit(onSubmit);
    expect(family.phases.map((p) => p.name)).toEqual(["gas"]);
    expect(family.reactions[0].gasPhaseId).toBe(family.phases[0].id);
  });

  it("imports a configuration from many files", async () => {
    await upload(
      json("main.json", {
        version: "1.1.0",
        name: "Many files",
        species: { files: ["species.json"] },
        phases: [{ name: "gas", species: [{ name: "A" }, { name: "B" }] }],
        reactions: [reaction],
      }),
      json("species.json", [{ name: "A" }, { name: "B" }]),
    );

    expect(await findInfo("Name: Many files")).toBeInTheDocument();
    expect(screen.getByText("Species Count: 2")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an error when no file is a configuration", async () => {
    await upload(json("notes.json", { species: [] }));

    expect(await findInfo(/has no entry point/)).toBeInTheDocument();
    expect(createButton()).toBeDisabled();
  });

  it("shows an error when more than one file is a configuration", async () => {
    await upload(
      json("a.json", { version: "1.0.0" }),
      json("b.json", { version: "1.0.0" }),
    );

    expect(await findInfo(/a\.json, b\.json/)).toBeInTheDocument();
    expect(createButton()).toBeDisabled();
  });

  it("shows the error when the parser cannot read the configuration", async () => {
    await upload(json("mechanism.json", { version: "9.0.0" }));

    expect(await findInfo(/Unsupported version number/)).toBeInTheDocument();
    expect(screen.queryByText(/musica_parse_tmp/)).not.toBeInTheDocument();
    expect(createButton()).toBeDisabled();
  });
});
