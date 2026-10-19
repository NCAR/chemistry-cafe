import { describe, expect, it } from "vitest";
import { formatEquation, parseEquation } from "../src/helpers/equationParser";
import { Species } from "../src/types/chemistryModels";

const names = ["OH", "NO", "NO2", "HNO3", "H+", "OH-", "1-butene"];
const species: Array<Species> = names.map((name, index) => ({
  id: `0-0-0-0-${index}`,
  name,
  description: null,
  familyId: "9-9-9-9-9",
}));
const id = (name: string) => species.find((s) => s.name === name)!.id;

describe("parseEquation", () => {
  it.each<[string, string, Array<string>]>([
    ["OH + 2 NO2 -> HNO3", "OH + 2 NO2 -> HNO3", []],
    ["OH+2NO2=HNO3", "OH + 2 NO2 -> HNO3", []],
    ["NO2 + NO2 → 0.5 HNO3", "2 NO2 -> 0.5 HNO3", []],
    ["H+ + OH- ->", "H+ + OH- ->", []],
    ["1-butene + OH -> NO", "1-butene + OH -> NO", []],
    ["", "", []],
    [
      "no2 -> NO3x",
      "",
      ["Unknown species: no2 (did you mean NO2?)", "Unknown species: NO3x"],
    ],
    ["OH + NO2", "", ['Use "->" between the reactants and the products']],
    ["OH -> NO -> NO2", "", ["Use only one arrow"]],
    ["OH NO2 -> NO", "OH -> NO", ['Expected "+" before "NO2"']],
  ])("reads %j", (equation, written, errors) => {
    const parsed = parseEquation(equation, species);
    expect(parsed.errors).toEqual(errors);
    expect(formatEquation(parsed.reactants, parsed.products, species)).toBe(
      written,
    );
  });

  it("gives the species IDs and coefficients", () => {
    expect(parseEquation("2NO2 -> HNO3", species)).toEqual({
      reactants: [{ speciesId: id("NO2"), coefficient: 2 }],
      products: [{ speciesId: id("HNO3"), coefficient: 1 }],
      errors: [],
    });
  });
});
