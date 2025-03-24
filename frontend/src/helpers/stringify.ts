import { ReactionTypeName } from "../types/chemistryModels"

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
