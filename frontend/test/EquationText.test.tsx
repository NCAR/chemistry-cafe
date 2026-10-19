import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { EquationText } from "../src/components/EquationText";
import { Reaction, Species } from "../src/types/chemistryModels";

const species: Array<Species> = ["NO", "RO2", "NO2", "RO", "RONO2"].map(
  (name, index) => ({
    id: `0-0-0-0-${index}`,
    name,
    description: null,
    familyId: "9-9-9-9-9",
  }),
);
const id = (name: string) => species.find((s) => s.name === name)!.id;

describe("EquationText", () => {
  it("shows the products of each branch with a label", () => {
    const reaction: Reaction = {
      id: "1-1-1-1-1",
      name: "",
      description: null,
      type: "BRANCHED_NO_RO2",
      reactants: [
        { speciesId: id("NO"), coefficient: 1 },
        { speciesId: id("RO2"), coefficient: 1 },
      ],
      products: [
        { speciesId: id("NO2"), coefficient: 1, branch: "alkoxy" },
        { speciesId: id("RONO2"), coefficient: 1, branch: "nitrate" },
        // A product without a branch is in the first branch.
        { speciesId: id("RO"), coefficient: 1 },
      ],
      attributes: {},
    };
    const { container } = render(
      <EquationText reaction={reaction} species={species} />,
    );
    expect(container.textContent).toBe(
      "NO + RO2 → NO2 + RO (alkoxy) | RONO2 (nitrate)",
    );
  });
});
