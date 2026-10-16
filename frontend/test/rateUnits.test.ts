import { describe, expect, it } from "vitest";
import {
  AVOGADRO_CONSTANT,
  fromDisplayValue,
  defaultRateUnitsByType,
  genericRateUnitExponent,
  parameterOrder,
  rateUnitLabel,
  rateUnitsFor,
  reactionOrder,
  roundDisplayValue,
  toDisplayValue,
} from "../src/helpers/rateUnits";
import { Reactant } from "../src/types/chemistryModels";

const oneReactant: Array<Reactant> = [
  { speciesId: "1-1-1-1-1", coefficient: 1 },
];
const twoReactants: Array<Reactant> = [
  { speciesId: "1-1-1-1-1", coefficient: 1 },
  { speciesId: "2-2-2-2-2", coefficient: 1 },
];

describe("reaction order", () => {
  it("sums the reactant coefficients", () => {
    expect(reactionOrder([])).toBe(0);
    expect(reactionOrder(twoReactants)).toBe(2);
    expect(reactionOrder([{ speciesId: "1-1-1-1-1", coefficient: 2 }])).toBe(2);
  });
});

describe("parameter order", () => {
  it("gives the order of the reaction to A and X", () => {
    expect(parameterOrder("ARRHENIUS", "A", twoReactants)).toBe(2);
    expect(parameterOrder("TUNNELING", "A", twoReactants)).toBe(2);
    expect(parameterOrder("TAYLOR_SERIES", "A", twoReactants)).toBe(2);
    expect(parameterOrder("BRANCHED_NO_RO2", "X", twoReactants)).toBe(2);
  });

  it("gives k0 of Troe one order more and kinf of ternary chemical activation one order less", () => {
    expect(parameterOrder("TROE", "k0A", twoReactants)).toBe(3);
    expect(parameterOrder("TROE", "kinfA", twoReactants)).toBe(2);
    expect(
      parameterOrder("TERNARY_CHEMICAL_ACTIVATION", "k0A", twoReactants),
    ).toBe(2);
    expect(
      parameterOrder("TERNARY_CHEMICAL_ACTIVATION", "kinfA", twoReactants),
    ).toBe(1);
  });

  it("gives no order to a parameter without a concentration unit", () => {
    expect(parameterOrder("ARRHENIUS", "Ea", twoReactants)).toBeNull();
    expect(parameterOrder("TROE", "k0C", twoReactants)).toBeNull();
    expect(
      parameterOrder("PHOTOLYSIS", "scalingFactor", oneReactant),
    ).toBeNull();
    expect(parameterOrder(undefined, "A", twoReactants)).toBeNull();
  });
});

describe("rate parameter conversion", () => {
  it("converts a second-order SI value to cm3 molecule-1 s-1 and back", () => {
    const valueSI = 1;
    const display = toDisplayValue(valueSI, "Molecule", 2);
    expect(display).toBeCloseTo(1e6 / AVOGADRO_CONSTANT, 30);
    expect(fromDisplayValue(display, "Molecule", 2)).toBeCloseTo(valueSI, 12);
  });

  it("converts a JPL value to SI and back without visible noise", () => {
    // OH + NO2 + M -> HNO3: k0 = 1.8e-30 cm6 molecule-2 s-1
    const valueSI = fromDisplayValue(1.8e-30, "Molecule", 3);
    expect(valueSI).toBeCloseTo(1.8e-30 * (AVOGADRO_CONSTANT / 1e6) ** 2, 5);
    expect(roundDisplayValue(toDisplayValue(valueSI, "Molecule", 3))).toBe(
      1.8e-30,
    );
  });

  it("does not change a first-order value, an SI value, or a parameter without an order", () => {
    expect(toDisplayValue(2.1e9, "Molecule", 1)).toBe(2.1e9);
    expect(toDisplayValue(3, "SI", 3)).toBe(3);
    expect(fromDisplayValue(3, "SI", 3)).toBe(3);
    expect(toDisplayValue(3, "Molecule", null)).toBe(3);
    expect(fromDisplayValue(3, "Molecule", null)).toBe(3);
  });

  it("labels the unit of each order", () => {
    expect(rateUnitLabel("Molecule", 1)).toBe("s-1");
    expect(rateUnitLabel("Molecule", 2)).toBe("cm3 molecule-1 s-1");
    expect(rateUnitLabel("Molecule", 3)).toBe("cm6 molecule-2 s-1");
    expect(rateUnitLabel("SI", 2)).toBe("m3 mol-1 s-1");
    expect(rateUnitLabel("Molecule", 0)).toBe("molecule cm-3 s-1");
    expect(rateUnitLabel("SI", 0)).toBe("mol m-3 s-1");
    expect(rateUnitLabel("Molecule", -1)).toBe("molecule2 cm-6 s-1");
  });

  it("gives the JPL units of the OH + CO chemical activation", () => {
    const k0Order = parameterOrder(
      "TERNARY_CHEMICAL_ACTIVATION",
      "k0A",
      twoReactants,
    )!;
    const kinfOrder = parameterOrder(
      "TERNARY_CHEMICAL_ACTIVATION",
      "kinfA",
      twoReactants,
    )!;
    expect(rateUnitLabel("Molecule", k0Order)).toBe("cm3 molecule-1 s-1");
    expect(rateUnitLabel("Molecule", kinfOrder)).toBe("s-1");
  });
});

describe("generic rate unit exponent", () => {
  it("gives the exponent for each offset", () => {
    expect(genericRateUnitExponent(1)).toBe("n");
    expect(genericRateUnitExponent(0)).toBe("n-1");
    expect(genericRateUnitExponent(-1)).toBe("n-2");
    expect(genericRateUnitExponent(2)).toBe("n+1");
  });
});

describe("rate units of a reaction type", () => {
  it("gives the units of the reaction type", () => {
    const units = { ...defaultRateUnitsByType, TROE: "SI" as const };
    expect(rateUnitsFor(units, "TROE")).toBe("SI");
    expect(rateUnitsFor(units, "ARRHENIUS")).toBe("Molecule");
  });

  it("gives the default for a type without a concentration unit", () => {
    expect(rateUnitsFor(defaultRateUnitsByType, "PHOTOLYSIS")).toBe("Molecule");
    expect(rateUnitsFor(defaultRateUnitsByType, undefined)).toBe("Molecule");
  });
});
