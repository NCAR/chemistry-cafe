import { Reaction, ReactionTypeName, Species } from "../types/chemistryModels";

/**
 * Converts a reaction type key to a human-readable string
 * @param reactionType Reaction type key
 * @returns String value. Defaults to the given string by default
 */
export const reactionTypeToString = (
  reactionType: ReactionTypeName,
): string => {
  switch (reactionType) {
    case "AQUEOUS_EQUILIBRIUM":
      return "Aqueous Equilibrium";
    case "ARRHENIUS":
      return "Arrhenius";
    case "CONDENSED_PHASE_ARRHENIUS":
      return "Condensed Phase Arrhenius";
    case "CONDENSED_PHASE_PHOTOLYSIS":
      return "Contendes Phase Photolysis";
    case "FIRST_ORDER_LOSS":
      return "First-Order Loss";
    case "EMMISSION":
      return "Emmission";
    case "TUNNELING":
      return "Tunneling";
    case "TROE":
      return "Troe (Fall-Off)";
    case "PHOTOLYSIS":
      return "Photolysis";
    case "SURFACE":
      return "Surface (Heterogenous)";
    case "WET_DEPOSITION":
      return "Wet Deposition";
    case "BRANCHED_NO_RO2":
      return "Branched NO RO2";
    case "HL_PHASE_TRANSFER":
      return "HL Phase Transfer";
    case "SIMPOL_PHASE_TRANSFER":
      return "Simpol Phase Transfer";
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
