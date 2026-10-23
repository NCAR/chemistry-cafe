import { ReactionAttribute } from "../types/chemistryModels";
import { BOLTZMANN_CONSTANT } from "./constants";

// Arrhenius and Taylor Series reactions take the temperature dependence as
// either the activation energy Ea [J] or C [K], with C = -Ea / k_B. MICM uses C.
// A reaction keeps the one that the user entered, and the app shows the other
// one as a computed value.

export type ActivationParameter = "Ea" | "C";

/** The unit of each parameter */
export const activationUnits: Record<ActivationParameter, string> = {
  Ea: "J",
  C: "K",
};

export const isActivationParameter = (
  key: string,
): key is ActivationParameter => key === "Ea" || key === "C";

/** Whether the UI shows an attribute. Of Ea and C, it shows the entered one. */
export const showsAttribute = (key: string, entered: ActivationParameter) =>
  !isActivationParameter(key) || key === entered;

// A zero stays a positive zero, so that the app never shows "-0".
const negate = (value: number) => (value === 0 ? 0 : -value);

export const cFromEa = (ea: number) => negate(ea / BOLTZMANN_CONSTANT);

export const eaFromC = (c: number) => negate(c * BOLTZMANN_CONSTANT);

/**
 * Gives Ea and C of a reaction: the stored one and the one computed from it.
 * Both are undefined when the reaction stores neither. When a reaction stores
 * both (data from before the app kept them exclusive), Ea wins, as in the
 * export.
 */
export function activationValues(
  attributes: Record<string, ReactionAttribute>,
): Record<ActivationParameter, number | undefined> {
  const ea = attributes["Ea"]?.value;
  if (typeof ea === "number") {
    return { Ea: ea, C: cFromEa(ea) };
  }
  const c = attributes["C"]?.value;
  if (typeof c === "number") {
    return { Ea: eaFromC(c), C: c };
  }
  return { Ea: undefined, C: undefined };
}

/**
 * Gives the text of the computed parameter, for example "C = -500 K". The
 * value has 6 significant digits. Gives undefined when the reaction stores
 * neither parameter.
 */
export function otherActivationText(
  attributes: Record<string, ReactionAttribute>,
  entered: ActivationParameter,
): string | undefined {
  const other: ActivationParameter = entered === "Ea" ? "C" : "Ea";
  const value = activationValues(attributes)[other];
  return value === undefined
    ? undefined
    : `${other} = ${Number(value.toPrecision(6))} ${activationUnits[other]}`;
}

/**
 * Gives the attributes with a new value of the parameter that the user
 * enters. The other parameter is removed, because a reaction stores only one.
 * A null value removes both.
 */
export function withActivationValue(
  attributes: Record<string, ReactionAttribute>,
  parameter: ActivationParameter,
  value: number | null,
): Record<string, ReactionAttribute> {
  const rest = { ...attributes };
  delete rest["Ea"];
  delete rest["C"];
  return value === null
    ? rest
    : { ...rest, [parameter]: { units: activationUnits[parameter], value } };
}
