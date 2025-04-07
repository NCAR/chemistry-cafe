import { UUID } from "crypto";
import { APIFamily, APIMechanism, APIReaction, APISpecies } from "../API/API_Interfaces";
import { Family, Mechanism, Reaction, Species } from "../types/chemistryModels";
import { updateFamily } from "../API/API_UpdateMethods";


/**
 * Converts a species as defined by the backend to a species as defined by the frontend.
 * This is intended to be called right after a backend request.
 * 
 * APISpecies -> Species
 * @param apiSpecies 
*/
export function apiToFrontendSpecies(apiSpecies: APISpecies): Species {
    if (!apiSpecies.id) {
        throw new Error("Species id is undefined");
    }

    const formattedSpecies: Species = {
        id: apiSpecies.id,
        name: apiSpecies.name ?? "",
        description: apiSpecies.description,
        attributes: {},
        familyId: apiSpecies.familyId,
    }

    return formattedSpecies;
}

/**
 * Converts a species as defined by the frontend to a species as defined by the backend.
 * This is intended to be called right before a backend request.
 * 
 * Species -> APISpecies
 * @param apiSpecies 
 */
export function frontendToAPISpecies(species: Species): APISpecies {
    const formattedSpecies: APISpecies = {
        name: null,
        description: null,
        familyId: species.familyId as UUID,
    }

    throw new Error("Function not implemented.");
}

/**
 * Converts a reaction as defined by the backend to a reaction as defined by the frontend.
 * This is intended to be called right after a backend request.
 * 
 * APIReaction -> Reaction
 * @param apiReaction 
*/
export function apiToFrontendReaction(apiReaction: APIReaction): Reaction {
    throw new Error("Function not implemented.");
}

/**
 * Converts a reaction as defined by the frontend to a reaction as defined by the backend.
 * This is intended to be called right before a backend request.
 * 
 * Reaction -> APIReaction
 * @param apiReaction 
 */
export function frontendToAPIReaction(reaction: Reaction): APIReaction {
    throw new Error("Function not implemented.");
}

/**
 * Converts a mechanism as defined by the backend to a mechanism as defined by the frontend.
 * This is intended to be called right after a backend request.
 * 
 * APIMechanism -> Mechanism
 * @param apiMechanism 
*/
export function apiToFrontendMechanism(apiMechanism: APIMechanism): Mechanism {
    throw new Error("Function not implemented.");
}

/**
 * Converts a mechanism as defined by the frontend to a mechanism as defined by the backend.
 * This is intended to be called right before a backend request.
 * 
 * Mechanism -> APIMechanism
 * @param apiMechanism 
 */
export function frontendToAPIMechanism(mechanism: Mechanism): APIMechanism {
    throw new Error("Function not implemented.");
}

/**
 * Converts a family as defined by the backend to a family as defined by the frontend.
 * This is intended to be called right after a backend request.
 * 
 * APIFamily -> Family
 * @param apiFamily 
*/
export function apiToFrontendFamily(apiFamily: APIFamily): Family {
    if (!apiFamily.id) {
        throw new Error("family id is undefined");
    }

    const formattedFamily: Family = {
        id: apiFamily.id,
        name: apiFamily.name,
        description: apiFamily.description,
        mechanisms: [],
        species: apiFamily.species?.map(apiToFrontendSpecies) ?? [],
        reactions: [],
        isModified: false,
        isDeleted: false,
        isInDatabase: true,
    }

    return formattedFamily
}

/**
 * Converts a family as defined by the frontend to a family as defined by the backend.
 * This is intended to be called right before a backend request.
 * 
 * Family -> APIFamily
 * @param apiFamily 
 */
export function frontendToAPIFamily(family: Family): APIFamily {
    if (!family.owner) {
        throw new Error("family owner is undefined");
    }

    const formattedFamily: APIFamily = {
        id: family.id as UUID,
        name: "",
        description: "",
        owner: family.owner,
        species: family.species.map(frontendToAPISpecies),
    }

    return formattedFamily;
}

const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/

/**
 * Uploads a *new* family to the backend
 * @param family
 * @returns Family with updated UUIDs of each object
*/
export async function uploadFamily(family: Family): Promise<Family> {
    throw new Error("Function not implemented.");
}

/**
 * Saves any changes made to the family to the backend
 * @param family 
 * @returns Family with updated UUIDs of objects
 */
export async function saveFamilyChanges(family: Family): Promise<Family> {
    // Don't make a network request if the family has been modified
    if (!family.isModified) {
        return family;
    }

    if (!uuidRegex.test(family.id)) {
        throw new Error("Family ID is not a valid UUID");
    }

    if (!family.isInDatabase) {
        throw new Error("Cannot save family not currently in database (did you mean 'uploadFamily()'?)");
    }

    
    // TODO Add update family function
    updateFamily(frontendToAPIFamily(family));
    const updatedFamily: Family = {
        ...family,
        species: [],
        mechanisms: [],
        isInDatabase: true,
        isModified: false,
        isDeleted: false,
    }

    for (const species of family.species) {
        // TODO Create Species database interactions
        if (!species.isInDatabase) {
        }
        else if (species.isModified) {
        }
        updatedFamily.species.push({
            ...species,
            isInDatabase: true,
            isModified: false,
            isDeleted: false,
        });
    }

    return updatedFamily;
}
