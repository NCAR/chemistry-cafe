import { APIFamily, APIMechanism, APIReaction, APISpecies } from "../API/API_Interfaces";
import { Family, Mechanism, Reaction, Species } from "../types/chemistryModels";


/**
 * Converts a species as defined by the backend to a species as defined by the frontend.
 * 
 * APISpecies -> Species
 * @param apiSpecies 
*/
export function apiToFrontendSpecies(apiSpecies: APISpecies): Species {
    throw new Error("Function not implemented.");
}

/**
 * Converts a species as defined by the frontend to a species as defined by the backend.
 * 
 * Species -> APISpecies
 * @param apiSpecies 
 */
export function frontendToAPISpecies(species: Species): APISpecies {
    throw new Error("Function not implemented.");
}

/**
 * Converts a reaction as defined by the backend to a reaction as defined by the frontend.
 * 
 * APIReaction -> Reaction
 * @param apiReaction 
*/
export function apiToFrontendReaction(apiReaction: APIReaction): Reaction {
    throw new Error("Function not implemented.");
}

/**
 * Converts a reaction as defined by the frontend to a reaction as defined by the backend.
 * 
 * Reaction -> APIReaction
 * @param apiReaction 
 */
export function frontendToAPIReaction(reaction: Reaction): APIReaction {
    throw new Error("Function not implemented.");
}

/**
 * Converts a mechanism as defined by the backend to a mechanism as defined by the frontend.
 * 
 * APIMechanism -> Mechanism
 * @param apiMechanism 
*/
export function apiToFrontendMechanism(apiMechanism: APIMechanism): Mechanism {
    throw new Error("Function not implemented.");
}

/**
 * Converts a mechanism as defined by the frontend to a mechanism as defined by the backend.
 * 
 * Mechanism -> APIMechanism
 * @param apiMechanism 
 */
export function frontendToAPIMechanism(mechanism: Mechanism): APIMechanism {
    throw new Error("Function not implemented.");
}

/**
 * Converts a family as defined by the backend to a family as defined by the frontend.
 * 
 * APIFamily -> Family
 * @param apiFamily 
*/
export function apiToFrontendFamily(apiFamily: APIFamily): Family {
    throw new Error("Function not implemented.");
}

/**
 * Converts a family as defined by the frontend to a family as defined by the backend.
 * 
 * Family -> APIFamily
 * @param apiFamily 
 */
export function frontendToAPIFamily(family: Family): APIFamily {
    throw new Error("Function not implemented.");
}

export async function publishFamily(family: Family): Promise<APIFamily> {
    throw new Error("Function not implemented.");
}

export async function saveFamilyChanges(family: Family): Promise<void> {
    throw new Error("Function not implemented.");
}
