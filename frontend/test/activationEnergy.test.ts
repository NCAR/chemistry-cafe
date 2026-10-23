import { describe, expect, it } from "vitest";
import { BOLTZMANN_CONSTANT } from "../src/helpers/constants";
import {
  activationValues,
  cFromEa,
  eaFromC,
} from "../src/helpers/activationEnergy";

describe("activation energy", () => {
  it("converts between Ea and C", () => {
    expect(cFromEa(500 * BOLTZMANN_CONSTANT)).toBeCloseTo(-500, 10);
    expect(eaFromC(-500)).toBeCloseTo(500 * BOLTZMANN_CONSTANT, 30);
    expect(Object.is(cFromEa(0), 0)).toBe(true);
    expect(Object.is(eaFromC(0), 0)).toBe(true);
  });

  it("gives the stored value and the value computed from it", () => {
    expect(activationValues({ C: { value: -500 } })).toEqual({
      Ea: eaFromC(-500),
      C: -500,
    });
    expect(activationValues({ Ea: { value: 1e-20 } })).toEqual({
      Ea: 1e-20,
      C: cFromEa(1e-20),
    });
    expect(activationValues({ A: { value: 1 } })).toEqual({
      Ea: undefined,
      C: undefined,
    });
    // Ea wins when both are stored, as in the export.
    expect(activationValues({ Ea: { value: 1e-20 }, C: { value: 3 } }).C).toBe(
      cFromEa(1e-20),
    );
  });
});
