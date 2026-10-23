import { describe, expect, it } from "vitest";
import { AVOGADRO_CONSTANT } from "../src/helpers/constants";
import {
  fromDisplayValue,
  parameterOrder,
  rateUnitLabel,
  roundDisplayValue,
  toDisplayValue,
} from "../src/helpers/rateUnits";
import { Reactant, ReactionTypeName } from "../src/types/chemistryModels";

// 2 A + B: the order n of the reaction is 3.
const reactants: Array<Reactant> = [
  { speciesId: "1-1-1-1-1", coefficient: 2 },
  { speciesId: "2-2-2-2-2", coefficient: 1 },
];

describe("rate units", () => {
  it.each<[ReactionTypeName | undefined, string, number | null]>([
    ["ARRHENIUS", "A", 3],
    ["TUNNELING", "A", 3],
    ["TAYLOR_SERIES", "A", 3],
    ["BRANCHED_NO_RO2", "X", 3],
    ["TROE", "k0A", 4],
    ["TROE", "kinfA", 3],
    ["TERNARY_CHEMICAL_ACTIVATION", "k0A", 3],
    ["TERNARY_CHEMICAL_ACTIVATION", "kinfA", 2],
    ["ARRHENIUS", "Ea", null],
    ["PHOTOLYSIS", "scalingFactor", null],
    [undefined, "A", null],
  ])("gives %s %s the order %s", (type, key, order) => {
    expect(parameterOrder(type, key, reactants)).toBe(order);
  });

  it("converts to SI and back, and does not change SI or first-order values", () => {
    // OH + NO2 + M -> HNO3: k0 = 1.8e-30 cm6 molecule-2 s-1
    const valueSI = fromDisplayValue(1.8e-30, "Molecule", 3);
    expect(valueSI).toBeCloseTo(1.8e-30 * (AVOGADRO_CONSTANT / 1e6) ** 2, 5);
    expect(roundDisplayValue(toDisplayValue(valueSI, "Molecule", 3))).toBe(
      1.8e-30,
    );

    expect(toDisplayValue(2.1e9, "Molecule", 1)).toBe(2.1e9);
    expect(toDisplayValue(3, "SI", 3)).toBe(3);
    expect(fromDisplayValue(3, "Molecule", null)).toBe(3);
  });

  it("labels the unit of each order", () => {
    expect(rateUnitLabel("Molecule", 1)).toBe("s-1");
    expect(rateUnitLabel("Molecule", 2)).toBe("cm3 molecule-1 s-1");
    expect(rateUnitLabel("Molecule", 3)).toBe("cm6 molecule-2 s-1");
    expect(rateUnitLabel("SI", 2)).toBe("m3 mol-1 s-1");
    expect(rateUnitLabel("Molecule", 0)).toBe("molecule cm-3 s-1");
    expect(rateUnitLabel("Molecule", -1)).toBe("molecule2 cm-6 s-1");
  });
});
