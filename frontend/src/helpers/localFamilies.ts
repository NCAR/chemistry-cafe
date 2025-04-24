import { UUID } from "crypto";
import { Family, Product, Reactant } from "../types/chemistryModels";

/**
 * Creates a temporary frontend id for a given object.
 * This is used for relating things together that aren't in the database yet.
 */
export const generateFrontendID = (): string => {
    return `${Date.now()}-${Math.floor(Math.random() * 10000000000)}`;
}

/**
 * Clones and creates a deep copy of a family and its relations.
 * Creates new temporary frontend ids for said family
 * @param family Family to clone
 */
export const cloneFamily = (family: Family): Family => {
    const clonedFamily: Family = {
        ...family,
        species: [],
        phases: [],
        reactions: [],
        mechanisms: [],
        isInDatabase: false,
    };
    const idMappings: Map<any, string> = new Map();

    clonedFamily.id = generateFrontendID();
    idMappings.set(family.id, clonedFamily.id)

    for (const species of family.species) {
        const frontendId = generateFrontendID();
        idMappings.set(species.id, frontendId);
        clonedFamily.species.push({
            ...species,
            id: frontendId,
            isInDatabase: false,
        });
    }

    for (const phase of family.phases) {
        const frontendId = generateFrontendID();
        idMappings.set(phase.id, frontendId);
        clonedFamily.phases.push({
            ...phase,
            id: frontendId,
            speciesIds: phase.speciesIds
                .reduce((accumulator: string[], id) => {
                    const mappedId = idMappings.get(id);
                    if (mappedId) {
                        accumulator.push(mappedId);
                    }
                    return accumulator;
                }, []),
            isInDatabase: false,
        });
    }

    for (const reaction of family.reactions) {
        const frontendId = generateFrontendID();
        idMappings.set(reaction.id, frontendId);
        clonedFamily.reactions.push({
            ...reaction,
            id: frontendId,
            reactants: reaction.reactants
                .reduce((accumulator: Reactant[], reactant) => {
                    const mappedId = idMappings.get(reactant.speciesId);
                    if (mappedId) {
                        accumulator.push({
                            ...reactant,
                            speciesId: mappedId,
                        });
                    }
                    return accumulator;
                }, []),
            products: reaction.products
                .reduce((accumulator: Product[], product) => {
                    const mappedId = idMappings.get(product.speciesId);
                    if (mappedId) {
                        accumulator.push({
                            ...product,
                            speciesId: mappedId,
                        });
                    }
                    return accumulator;
                }, []),
            gasPhaseId: idMappings.get(reaction.gasPhaseId),
            gasPhaseSpeciesId: idMappings.get(reaction.gasPhaseSpeciesId),
            aerosolPhaseId: idMappings.get(reaction.aerosolPhaseId),
            aerosolPhaseSpeciesId: idMappings.get(reaction.aerosolPhaseSpeciesId),
            aerosolPhaseWaterId: idMappings.get(reaction.aerosolPhaseWaterId),
            isInDatabase: false,
        })
    }

    for (const mechanism of family.mechanisms) {
        const frontendId = generateFrontendID();
        idMappings.set(mechanism.id, frontendId);
        clonedFamily.mechanisms.push({
            ...mechanism,
            speciesIds: mechanism.speciesIds
                .reduce((accumulator: string[], id) => {
                    const mappedId = idMappings.get(id);
                    if (mappedId) {
                        accumulator.push(mappedId);
                    }
                    return accumulator;
                }, []),
            phaseIds: mechanism.phaseIds
                .reduce((accumulator: string[], id) => {
                    const mappedId = idMappings.get(id);
                    if (mappedId) {
                        accumulator.push(mappedId);
                    }
                    return accumulator;
                }, []),
            reactionIds: mechanism.reactionIds
                .reduce((accumulator: string[], id) => {
                    const mappedId = idMappings.get(id);
                    if (mappedId) {
                        accumulator.push(mappedId);
                    }
                    return accumulator;
                }, []),
            isInDatabase: false,
        })
    }

    return clonedFamily;
}


/**
 * Adds a family's id that is in the database to localstorage
 * @param familyId Database id of the family id to add to local storage
 */
export const addUploadedFamilyIdLocally = (familyId: UUID): void => {
    let uploadedFamilyIds: Array<UUID> = [];
    try {
        uploadedFamilyIds = JSON.parse(
            localStorage.getItem("uploadedFamilyIds") || "[]",
        );
        if (Array.isArray(uploadedFamilyIds)) {
            if (!uploadedFamilyIds.find((e) => e == familyId)) {
                uploadedFamilyIds.unshift(familyId);
            }
        } else {
            uploadedFamilyIds = [familyId];
        }
        localStorage.setItem(
            "uploadedFamilyIds",
            JSON.stringify(uploadedFamilyIds),
        );
    } catch (err) {
        console.error(err);
        alert(`An error occurred: ${err}`);
    }
}

/**
 * Adds a family to localStorage for reference later
 * @param family 
 */
export const addFamilyLocally = (family: Family): void => {
    let localFamilies: Array<Family> = [];
    try {
        localFamilies = JSON.parse(
            localStorage.getItem("localFamilies") || "[]",
        );
        if (!Array.isArray(localFamilies)) {
            localFamilies = [];
        }
    }
    catch (err) {
        console.error("Issue adding family to localStorage: ", err);
    }
    finally {
        localFamilies.push(family);
        localStorage.setItem("localFamilies", JSON.stringify(localFamilies));
    }
}

/**
 * Clears localStorage families and ids
 */
export const clearFamiliesLocally = () => {
    localStorage.removeItem("localFamilies");
    localStorage.removeItem("uploadedFamilyIds");
}

/**
 * Updates all locally stored families in localStorage
 * @param families List of families to put in localStorage
 */
export const updateLocalStorageFamilyInfo = (families: Family[]): void => {
    const localFamilies = families.filter((e) => !e.isInDatabase);
    const uploadedFamilyIds = families
        .filter(e => e.isInDatabase)
        .map(e => e.id);
    try {
        localStorage.setItem("localFamilies", JSON.stringify(localFamilies));
        localStorage.setItem(
            "uploadedFamilyIds",
            JSON.stringify(uploadedFamilyIds),
        );
    } catch (e) {
        console.error("There was an issue storing families locally:", e);
    }
}


