import { Reaction, Species } from "../types/chemistryModels";

/**
 * Converts a reaction type key to a human-readable string
 * @param reactionType Reaction type key
 * @returns String value. Defaults to the given string by default
 */
export const reactionTypeToString = (reactionType: string): string => {
  switch (reactionType) {
    case "ARRHENIUS":
      return "Arrhenius";
    case "BRANCHED_NO_RO2":
      return "Branched NO RO2";
    case "EMISSION":
      return "Emission";
    case "FIRST_ORDER_LOSS":
      return "First-Order Loss";
    case "PHOTOLYSIS":
      return "Photolysis";
    case "SURFACE":
      return "Surface Reaction (Heterogenous)";
    case "TAYLOR_SERIES":
      return "Taylor Series";
    case "TERNARY_CHEMICAL_ACTIVATION":
      return "Ternary Chemical Activation";
    case "TROE":
      return "Troe (Fall-Off)";
    case "TUNNELING":
      return "Tunneling";
    case "USER_DEFINED":
      return "User-Defined";
    default:
      return reactionType;
  }
};

/**
 * Stringifies a reaction with a given species list.
 * @param reaction
 * @param speciesList
 * @returns
 */
export const reactionToString = (
  reaction: Reaction | undefined | null,
  speciesList: Array<Species>,
): string => {
  if (!reaction) {
    return "<none> -> <none>";
  }

  const reactantStrings = [];
  for (const reactant of reaction.reactants) {
    const species = speciesList.find((e) => e.id == reactant.speciesId);
    if (!species) {
      continue;
    }
    reactantStrings.push(
      `${reactant.coefficient != 1 ? reactant.coefficient : ""}${species.name}`,
    );
  }

  const productStrings = [];
  for (const product of reaction.products) {
    const species = speciesList.find((e) => e.id == product.speciesId);
    if (!species) {
      continue;
    }
    productStrings.push(
      `${product.coefficient != 1 ? product.coefficient : ""}${species.name}`,
    );
  }

  return `${reactantStrings.join(" + ") || "<none>"} -> ${productStrings.join(" + ") || "<none>"}`;
};
