import { describe, expect, it } from "vitest";
import { equationMatchesSearch } from "../src/helpers/equationSearch";
import { Reaction, Species } from "../src/types/chemistryModels";

const species: Array<Species> = [
  { id: "1-1-1-1-1", name: "OH", description: null, familyId: "9-9-9-9-9" },
  { id: "2-2-2-2-2", name: "NO2", description: null, familyId: "9-9-9-9-9" },
  { id: "3-3-3-3-3", name: "HNO3", description: null, familyId: "9-9-9-9-9" },
];

// OH + 2 NO2 -> HNO3
const reaction: Reaction = {
  id: "4-4-4-4-4",
  name: "",
  description: null,
  type: "ARRHENIUS",
  reactants: [
    { speciesId: "1-1-1-1-1", coefficient: 1 },
    { speciesId: "2-2-2-2-2", coefficient: 2 },
  ],
  products: [{ speciesId: "3-3-3-3-3", coefficient: 1 }],
  attributes: {},
};

describe("equationMatchesSearch", () => {
  it.each([
    ["NO2+OH", true],
    ["OH + NO2", true],
    ["2NO2", true],
    ["NO", true],
    ["OH+NO2->HNO3", true],
    ["OH + NO2 → HNO3", true],
    ["OH=HNO3", true],
    ["HNO3 -> OH", false],
    ["NO2+O", true],
    ["NO2+O3", false],
    ["NO+OH", false],
  ])("matches %s: %s", (search, expected) => {
    expect(equationMatchesSearch(search, reaction, species)).toBe(expected);
  });
});
