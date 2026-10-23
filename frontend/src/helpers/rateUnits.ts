import { Reactant, ReactionTypeName } from "../types/chemistryModels";
import { AVOGADRO_CONSTANT } from "./constants";

// The display units of rate parameters. The database and the downloaded
// configurations always use SI values, in (m3 mol-1)^(order-1) s-1. The
// molecule unit is (cm3 molecule-1)^(order-1) s-1, as in the JPL kinetics
// evaluations. The app converts only for display and input.

export type RateUnits = "Molecule" | "SI";

export const defaultRateUnits: RateUnits = "Molecule";

// For each reaction type, the parameters that have a concentration unit. The
// value is the order of the parameter minus the order n of the reaction. It
// comes from the role of the parameter in the rate formula
// (rate_constant_functions.hpp in MICM):
//   Troe:                        k = k0[M] / (1 + k0[M]/kinf) F, so k0 has the order n + 1.
//   Ternary chemical activation: k = k0 / (1 + k0[M]/kinf) F, so kinf has the order n - 1.
// JPL gives the same units. For OH + CO, k0 is in cm3 molecule-1 s-1 and kinf
// is in s-1.
export const rateUnitParameters = {
  ARRHENIUS: { A: 0 },
  BRANCHED_NO_RO2: { X: 0 },
  TAYLOR_SERIES: { A: 0 },
  TERNARY_CHEMICAL_ACTIVATION: { k0A: 0, kinfA: -1 },
  TROE: { k0A: 1, kinfA: 0 },
  TUNNELING: { A: 0 },
} satisfies Partial<Record<ReactionTypeName, Record<string, number>>>;

/** The reaction types that have a rate parameter with a concentration unit. */
export type RateUnitReactionType = keyof typeof rateUnitParameters;

export const rateUnitReactionTypes = Object.keys(
  rateUnitParameters,
) as Array<RateUnitReactionType>;

/** The display units of each reaction type. */
export type RateUnitsByType = Record<RateUnitReactionType, RateUnits>;

export const defaultRateUnitsByType: Readonly<RateUnitsByType> = Object.freeze(
  Object.fromEntries(
    rateUnitReactionTypes.map((type) => [type, defaultRateUnits]),
  ) as RateUnitsByType,
);

const isRateUnitReactionType = (
  type: string | undefined,
): type is RateUnitReactionType =>
  type !== undefined &&
  Object.prototype.hasOwnProperty.call(rateUnitParameters, type);

/**
 * Gives the display units of a reaction type. A reaction type without a
 * concentration unit gets the default, but no parameter of it is converted.
 */
export function rateUnitsFor(
  rateUnits: RateUnitsByType,
  type: ReactionTypeName | undefined,
): RateUnits {
  return isRateUnitReactionType(type) ? rateUnits[type] : defaultRateUnits;
}

/**
 * Gives the order n of a reaction: the sum of the reactant coefficients.
 * A third body that the user lists as a reactant counts too, because the
 * solver multiplies the rate by its concentration.
 */
export function reactionOrder(reactants: Array<Reactant>): number {
  return reactants.reduce((sum, reactant) => {
    const coefficient = Number(reactant.coefficient);
    return sum + (Number.isFinite(coefficient) ? coefficient : 1);
  }, 0);
}

/**
 * Gives the order of one parameter of a reaction, or null when the parameter
 * has no concentration unit.
 */
export function parameterOrder(
  type: ReactionTypeName | undefined,
  key: string,
  reactants: Array<Reactant>,
): number | null {
  const parameters: Record<string, number> | undefined = isRateUnitReactionType(
    type,
  )
    ? rateUnitParameters[type]
    : undefined;
  const offset = parameters?.[key];
  return offset === undefined ? null : reactionOrder(reactants) + offset;
}

// The factor from an SI value to a molecule value: 1 m3 mol-1 = 1e6 / N_A cm3 molecule-1.
const moleculeFactor = (order: number) =>
  (1e6 / AVOGADRO_CONSTANT) ** (order - 1);

/** Converts a stored SI value to the display unit. */
export function toDisplayValue(
  valueSI: number,
  units: RateUnits,
  order: number | null,
): number {
  return units === "Molecule" && order !== null
    ? valueSI * moleculeFactor(order)
    : valueSI;
}

/** Converts a value in the display unit to the stored SI value. */
export function fromDisplayValue(
  value: number,
  units: RateUnits,
  order: number | null,
): number {
  return units === "Molecule" && order !== null
    ? value / moleculeFactor(order)
    : value;
}

/**
 * Removes the floating-point noise of a conversion, so that 1e-11 shows as
 * 1e-11 and not 1.0000000000000001e-11. Twelve significant digits keep more
 * precision than any published rate constant.
 */
export function roundDisplayValue(value: number): number {
  return Number(value.toPrecision(12));
}

/**
 * Gives the unit for a known order, in the form that UnitComponent reads:
 * "cm3 molecule-1 s-1" or "m3 mol-1 s-1". An order of 0 or less gives a
 * concentration rate, for example "molecule cm-3 s-1".
 */
export function rateUnitLabel(units: RateUnits, order: number): string {
  const power = order - 1;
  if (power === 0) {
    return "s-1";
  }
  const volume = units === "Molecule" ? "cm" : "m";
  const amount = units === "Molecule" ? "molecule" : "mol";
  if (power < 0) {
    const amountPower = power === -1 ? "" : `${-power}`;
    return `${amount}${amountPower} ${volume}${3 * power} s-1`;
  }
  return `${volume}${3 * power} ${amount}-${power} s-1`;
}

/**
 * Gives the exponent of the volume and amount factor of a parameter before the
 * reactants are known: "n", "n-1", or "n-2". The exponent is n - 1 + offset.
 */
export function genericRateUnitExponent(offset: number): string {
  const constant = offset - 1;
  if (constant === 0) {
    return "n";
  }
  return constant < 0 ? `n${constant}` : `n+${constant}`;
}
