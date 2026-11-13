import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { UUID } from "crypto";
import { PhaseCreationModal } from "../src/components/modals/PhaseCreationModal";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";
import { Phase, Species } from "../src/types/chemistryModels";

// The names sort in the same order as the ids: SPEC00, SPEC01, ...
const species: Species[] = Array.from({ length: 30 }, (_, i) => ({
  id: `species-${i}` as UUID,
  name: `SPEC${String(i).padStart(2, "0")}`,
  description: "",
  familyId: "family" as UUID,
  attributes: {},
}));

const phase: Phase = {
  id: "phase" as UUID,
  name: "gas",
  description: "Gas phase",
  speciesIds: species.map((s) => s.id),
  diffusionCoefficients: { [species[0].id]: 1e-5 },
  densities: { [species[0].id]: 1800 },
};

function renderModal(
  props: Partial<React.ComponentProps<typeof PhaseCreationModal>> = {},
) {
  const onSubmit = vi.fn();
  render(
    <CustomThemeProvider>
      <PhaseCreationModal
        open
        onClose={vi.fn()}
        onSubmit={onSubmit}
        phase={phase}
        species={species}
        {...props}
      />
    </CustomThemeProvider>,
  );
  return onSubmit;
}

/** The grid row of the species with this name. */
const rowOf = (name: string) => screen.getByText(name).closest('[role="row"]')!;

const cellOf = (name: string, field: string) =>
  rowOf(name).querySelector(`[role="gridcell"][data-field="${field}"]`)!;

/** Edits a value cell in the grid and commits the edit. */
async function editCell(name: string, field: string, value: string) {
  const cell = cellOf(name, field);
  fireEvent.doubleClick(cell);
  const input = within(cell as HTMLElement).getByRole("spinbutton");
  fireEvent.change(input, { target: { value } });
  // A browser sends each key in its own task. Wait one task, so that the
  // grid can check the value before the Enter.
  await new Promise((resolve) => setTimeout(resolve, 0));
  fireEvent.keyDown(input, { key: "Enter" });
}

describe("PhaseCreationModal", () => {
  afterEach(cleanup);

  it("shows the species in pages of 25 rows with page controls", () => {
    renderModal();
    expect(screen.getByText("SPEC24")).toBeTruthy();
    expect(screen.queryByText("SPEC25")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(screen.queryByText("SPEC24")).toBeNull();
    expect(screen.getByText("SPEC25")).toBeTruthy();
  });

  it("sorts the species by name", () => {
    renderModal();
    fireEvent.click(screen.getByRole("columnheader", { name: "Species" }));
    // The grid sorts by name ascending at the start, so a click sorts it
    // descending.
    expect(screen.getByText("SPEC29")).toBeTruthy();
    expect(screen.queryByText("SPEC00")).toBeNull();
  });

  it("saves the values of the species", async () => {
    const onSubmit = renderModal();
    await editCell("SPEC01", "density", "900");
    await waitFor(() =>
      expect(cellOf("SPEC01", "density").textContent).toBe("900"),
    );

    fireEvent.click(screen.getByTestId("save-phase-button"));

    expect(onSubmit).toHaveBeenCalledWith(
      "gas",
      "Gas phase",
      phase.speciesIds,
      { [species[0].id]: 1e-5 },
      { [species[0].id]: 1800, [species[1].id]: 900 },
    );
  });

  it("removes a value when the cell is empty", async () => {
    const onSubmit = renderModal();
    await editCell("SPEC00", "density", "");
    await waitFor(() =>
      expect(cellOf("SPEC00", "density").textContent).toBe("None"),
    );

    fireEvent.click(screen.getByTestId("save-phase-button"));

    expect(onSubmit.mock.calls[0][4]).toEqual({});
  });

  it("does not save a value that is not a positive number", async () => {
    renderModal();
    await editCell("SPEC00", "density", "-1");

    expect(await screen.findByText("Enter a positive number.")).toBeTruthy();
  });

  it("puts a species in the phase with the checkbox in its row", () => {
    const onSubmit = renderModal({
      phase: { ...phase, speciesIds: [species[0].id] },
    });
    // A species that is not in the phase has no values.
    expect(cellOf("SPEC01", "density").textContent).toBe("—");

    fireEvent.click(
      within(rowOf("SPEC01") as HTMLElement).getByRole("checkbox"),
    );
    fireEvent.click(screen.getByTestId("save-phase-button"));

    expect(onSubmit.mock.calls[0][2]).toEqual([species[0].id, species[1].id]);
  });

  it("drops the values of a species that leaves the phase", () => {
    const onSubmit = renderModal();
    fireEvent.click(
      within(rowOf("SPEC00") as HTMLElement).getByRole("checkbox"),
    );
    fireEvent.click(screen.getByTestId("save-phase-button"));

    expect(onSubmit.mock.calls[0][3]).toEqual({});
    expect(onSubmit.mock.calls[0][4]).toEqual({});
  });

  it("shows only the species in the phase with the filter on", () => {
    renderModal({ phase: { ...phase, speciesIds: [species[3].id] } });
    expect(screen.getByText("SPEC00")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Only species in this phase" }),
    );

    expect(screen.queryByText("SPEC00")).toBeNull();
    expect(screen.getByText("SPEC03")).toBeTruthy();
  });
});
