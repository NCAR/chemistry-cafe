import { Reaction, ReactionTypeName, Species } from "../types/chemistryModels"

export const reactionTypeToString = (reactionType: ReactionTypeName): string => {
    switch (reactionType) {
        case "AQUEOUS_EQUILIBRIUM":
            return "Aqueous Equilibrium";
        case "ARRHENIUS":
            return "Arrhenius";
        case "CONDENSED_PHASE_ARRHENIUS":
            return "Condensed Phase Arrhenius"
        case "CONDENSED_PHASE_PHOTOLYSIS":
            return "Contendes Phase Photolysis";
        case "FIRST_ORDER_LOSS":
            return "First-Order Loss";
        case "EMMISSION":
            return "Emmission";
        case "NONE":
            return "N/A";
        case "TUNNELING":
            return "Tunneling"
        case "TROE":
            return "Troe (Fall-Off)";
        case "PHOTOLYSIS":
            return "Photolysis";
        case "SURFACE":
            return "Surface (Heterogenous)";
        case "WET_DEPOSITION":
            return "Wet Deposition"
        default:
            return reactionType;
    }
}

/**
 * Stringifies a reaction with a given species list.
 * @param reaction 
 * @param speciesList 
 * @returns 
 */
export const reactionToString = (reaction: Reaction | undefined | null, speciesList: Array<Species>): string => {
    if (!reaction) {
        return "<none> -> <none>"
    }

    const reactantStrings = [];
    for (const reactant of reaction.reactants) {
        const species = speciesList.find((e) => e.id == reactant.speciesId);
        if (!species) {
            continue;
        }
        reactantStrings.push(`${reactant.coefficient != 1 ? reactant.coefficient : ""}${species.name}`);
    }

    const productStrings = [];
    for (const product of reaction.products) {
        const species = speciesList.find((e) => e.id == product.speciesId);
        if (!species) {
            continue;
        }
        productStrings.push(`${product.coefficient != 1 ? product.coefficient : ""}${species.name}`);
    }

    return `${reactantStrings.join(" + ") || "<none>"} -> ${productStrings.join(" + ") || "<none>"}`;
}
