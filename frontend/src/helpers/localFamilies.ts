import { UUID } from "crypto";
import { Family, Product, Reactant } from "../types/chemistryModels";

/**
 * Creates a temporary frontend id for a given object.
 * This is used for relating things together that aren't in the database yet.
 */
export const generateID = (): UUID => {
  return crypto.randomUUID();
};

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
    isPublic: false,
    contributorIds: [],
  };
  const idMappings: Map<UUID, UUID> = new Map();

  clonedFamily.id = generateID();
  idMappings.set(family.id, clonedFamily.id);

  for (const species of family.species) {
    const frontendId = generateID();
    idMappings.set(species.id, frontendId);
    clonedFamily.species.push({
      ...species,
      id: frontendId,
    });
  }

  for (const phase of family.phases) {
    const frontendId = generateID();
    idMappings.set(phase.id, frontendId);
    clonedFamily.phases.push({
      ...phase,
      id: frontendId,
      speciesIds: phase.speciesIds.reduce((accumulator: UUID[], id) => {
        const mappedId = idMappings.get(id);
        if (mappedId) {
          accumulator.push(mappedId);
        }
        return accumulator;
      }, []),
      diffusionCoefficients: Object.fromEntries(
        Object.entries(phase.diffusionCoefficients ?? {}).flatMap(
          ([id, value]) => {
            const mappedId = idMappings.get(id as UUID);
            return mappedId ? [[mappedId, value]] : [];
          },
        ),
      ),
    });
  }

  for (const reaction of family.reactions) {
    const frontendId = generateID();
    idMappings.set(reaction.id, frontendId);
    clonedFamily.reactions.push({
      ...reaction,
      id: frontendId,
      reactants: reaction.reactants.reduce(
        (accumulator: Reactant[], reactant) => {
          const mappedId = idMappings.get(reactant.speciesId);
          if (mappedId) {
            accumulator.push({
              ...reactant,
              speciesId: mappedId,
            });
          }
          return accumulator;
        },
        [],
      ),
      products: reaction.products.reduce((accumulator: Product[], product) => {
        const mappedId = idMappings.get(product.speciesId);
        if (mappedId) {
          accumulator.push({
            ...product,
            speciesId: mappedId,
          });
        }
        return accumulator;
      }, []),
      gasPhaseId: reaction.gasPhaseId
        ? idMappings.get(reaction.gasPhaseId)
        : undefined,
      gasPhaseSpeciesId: reaction.gasPhaseSpeciesId
        ? idMappings.get(reaction.gasPhaseSpeciesId)
        : undefined,
    });
  }

  for (const mechanism of family.mechanisms) {
    const frontendId = generateID();
    idMappings.set(mechanism.id, frontendId);
    clonedFamily.mechanisms.push({
      ...mechanism,
      id: frontendId,
      speciesIds: mechanism.speciesIds.reduce((accumulator: UUID[], id) => {
        const mappedId = idMappings.get(id);
        if (mappedId) {
          accumulator.push(mappedId);
        }
        return accumulator;
      }, []),
      phaseIds: mechanism.phaseIds.reduce((accumulator: UUID[], id) => {
        const mappedId = idMappings.get(id);
        if (mappedId) {
          accumulator.push(mappedId);
        }
        return accumulator;
      }, []),
      reactionIds: mechanism.reactionIds.reduce((accumulator: UUID[], id) => {
        const mappedId = idMappings.get(id);
        if (mappedId) {
          accumulator.push(mappedId);
        }
        return accumulator;
      }, []),
    });
  }

  return clonedFamily;
};

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
};

/**
 * Adds a family to localStorage for reference later
 * @param family
 */
export const addFamilyLocally = (family: Family): void => {
  let localFamilies: Array<Family> = [];
  try {
    localFamilies = JSON.parse(localStorage.getItem("localFamilies") || "[]");
    if (!Array.isArray(localFamilies)) {
      localFamilies = [];
    }
  } catch (err) {
    console.error("Issue adding family to localStorage: ", err);
  } finally {
    localFamilies.push(family);
    localStorage.setItem("localFamilies", JSON.stringify(localFamilies));
  }
};

/**
 * Saves or updates a family in localStorage for immediate persistence.
 * If the family already exists in localFamilies, updates it in place; otherwise prepends it.
 * @param family Family to save locally
 */
export const saveFamilyLocally = (family: Family): void => {
  let localFamilies: Array<Family> = [];
  try {
    const stored = localStorage.getItem("localFamilies");
    if (stored) {
      localFamilies = JSON.parse(stored);
      if (!Array.isArray(localFamilies)) {
        localFamilies = [];
      }
    }
  } catch (err) {
    console.error("Issue reading families from localStorage: ", err);
    localFamilies = [];
  }
  const index = localFamilies.findIndex((f) => f.id === family.id);
  if (index >= 0) {
    localFamilies[index] = family;
  } else {
    localFamilies.unshift(family);
  }
  try {
    localStorage.setItem("localFamilies", JSON.stringify(localFamilies));
  } catch (err) {
    console.error("Issue saving family to localStorage: ", err);
  }
};

/**
 * Clears localStorage families and ids
 */
export const clearFamiliesLocally = () => {
  localStorage.removeItem("localFamilies");
  localStorage.removeItem("uploadedFamilyIds");
};

/**
 * Removes a family from local storage (both draft and uploaded id)
 */
export const removeFamilyLocally = (family: Family): void => {
  try {
    const localFamilies: Family[] = JSON.parse(
      localStorage.getItem("localFamilies") || "[]",
    );
    localStorage.setItem(
      "localFamilies",
      JSON.stringify(localFamilies.filter((f) => f.id !== family.id)),
    );
    const uploadedFamilyIds: string[] = JSON.parse(
      localStorage.getItem("uploadedFamilyIds") || "[]",
    );
    localStorage.setItem(
      "uploadedFamilyIds",
      JSON.stringify(uploadedFamilyIds.filter((id) => id !== family.id)),
    );
  } catch (err) {
    console.error("Issue removing family from localStorage: ", err);
  }
};
