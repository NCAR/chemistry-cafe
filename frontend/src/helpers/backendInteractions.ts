import { UUID } from "crypto";
import {
  APIFamily,
  APIMechanism,
  APIPhase,
  APIProduct,
  APIReactant,
  APIReaction,
  APISpecies,
} from "../API/API_Interfaces";
import { Family, Mechanism, Phase, Reaction, reactionAttributeOptions, ReactionTypeName, Species, speciesAttributeOptions } from "../types/chemistryModels";
import { updateFamily } from "../API/API_UpdateMethods";

/**
 * Used to determine if a uuid is valid
 */
const uuidRegex =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

/**
 * Converts a species as defined by the backend to a species as defined by the frontend.
 * This is intended to be called right after a backend request.
 *
 * APISpecies -> Species
 * @param apiSpecies Species information from  the backend
 */
export function apiToFrontendSpecies(apiSpecies: APISpecies): Species {
  const formattedSpecies: Species = {
    id: apiSpecies.id,
    name: apiSpecies.name ?? "<Empty>",
    description: apiSpecies.description || "",
    attributes: {},
    familyId: apiSpecies.familyId,
    isInDatabase: true,
    isModified: false,
    isDeleted: false,
  };

  for (const attribute of apiSpecies.numericalAttributes) {
    const defaultAttribute = speciesAttributeOptions.find((e) => e.serializationKey == attribute.serializationKey);
    formattedSpecies.attributes[attribute.serializationKey] = {
      ...defaultAttribute,
      serializationKey: attribute.serializationKey,
      value: attribute.value,
    }
  }

  for (const attribute of apiSpecies.stringAttributes) {
    const defaultAttribute = speciesAttributeOptions.find((e) => e.serializationKey == attribute.serializationKey);
    formattedSpecies.attributes[attribute.serializationKey] = {
      ...defaultAttribute,
      serializationKey: attribute.serializationKey,
      value: attribute.value,
    }
  }

  return formattedSpecies;
}

/**
 * Converts a species as defined by the frontend to a species as defined by the backend.
 * This is intended to be called right before a backend request and assumes the family is already in the database.
 * 
 * If the species is not currently in the database, its id will default to '00000000-0000-0000-0000-00000000000'
 * This will not reflect its returned id when creating the species
 *
 * Species -> APISpecies
 * @param species Species information to convert
 * @param family Family this species belongs to
 */
export function frontendToAPISpecies(species: Species, family: Family): APISpecies {
  const id: UUID = uuidRegex.test(species.id) ? species.id as UUID : "00000000-0000-0000-0000-00000000000";
  const formattedSpecies: APISpecies = {
    id: id,
    name: species.name,
    description: species.description,
    familyId: family.id as UUID,
    numericalAttributes: [],
    stringAttributes: []
  };

  for (const attribute of Object.values(species.attributes)) {
    if (typeof attribute.value === "number") {
      formattedSpecies.numericalAttributes.push({
        serializationKey: attribute.serializationKey,
        value: attribute.value,
      });
    }
    else if (typeof attribute.value === "string") {
      formattedSpecies.stringAttributes.push({
        serializationKey: attribute.serializationKey,
        value: attribute.value,
      });
    }
  }

  return formattedSpecies;
}

/**
 * Converts a reaction as defined by the backend to a reaction as defined by the frontend.
 * This is intended to be called right after a backend request.
 *
 * APIReaction -> Reaction
 * @param apiReaction Reaction information from the backend
 */
export function apiToFrontendReaction(apiReaction: APIReaction): Reaction {
  const formattedReaction: Reaction = {
    id: apiReaction.id,
    name: apiReaction.name,
    description: apiReaction.description ?? "",
    type: apiReaction.reactionType as ReactionTypeName,
    reactants: apiReaction.reactants,
    products: apiReaction.products,
    attributes: {},
    isInDatabase: true,
    isModified: false,
    isDeleted: false,
  }

  for (const attribute of apiReaction.numericalAttributes) {
    const defaultAttribute = reactionAttributeOptions[apiReaction.reactionType as ReactionTypeName]?.find((e) => e.serializationKey == attribute.serializationKey);
    formattedReaction.attributes[attribute.serializationKey] = {
      ...defaultAttribute,
      serializationKey: attribute.serializationKey,
      value: attribute.value,
    }
  }

  for (const attribute of apiReaction.stringAttributes) {
    const defaultAttribute = speciesAttributeOptions.find((e) => e.serializationKey == attribute.serializationKey);
    formattedReaction.attributes[attribute.serializationKey] = {
      ...defaultAttribute,
      serializationKey: attribute.serializationKey,
      value: attribute.value,
    }
  }

  return formattedReaction;
}

/**
 * Converts a reaction as defined by the frontend to a reaction as defined by the backend.
 * This is intended to be called right before a backend request.
 * 
 * If the reaction is not currently in the database, its id will default to '00000000-0000-0000-0000-00000000000'
 * This will not reflect its returned id when creating the reaction
 *
 * Reaction -> APIReaction
 * @param reaction Reaction information to convert
 * @param family Family this reaction belongs to
 */
export function frontendToAPIReaction(reaction: Reaction, family: Family): APIReaction {
  for (const reactant of reaction.reactants) {
    if (!uuidRegex.test(reactant.speciesId)) {
      throw new Error("Reactant id is not a uuid");
    }
  }
  for (const product of reaction.products) {
    if (!uuidRegex.test(product.speciesId)) {
      throw new Error("Product id is not a uuid");
    }
  }

  const id: UUID = uuidRegex.test(reaction.id) ? reaction.id as UUID : "00000000-0000-0000-0000-00000000000";
  const formattedReaction: APIReaction = {
    id: id,
    familyId: family.id as UUID,
    name: reaction.name,
    description: reaction.description ?? "",
    numericalAttributes: [],
    stringAttributes: [],
    reactants: reaction.reactants as Array<APIReactant>,
    products: reaction.products as Array<APIProduct>,
    gasPhaseId: reaction.gasPhaseId,
    gasPhaseSpeciesId: reaction.gasPhaseSpeciesId,
    aerosolPhaseId: reaction.aerosolPhaseId,
    aerosolPhaseSpeciesId: reaction.aerosolPhaseSpeciesId,
    aerosolPhaseWaterId: reaction.aerosolPhaseWaterId,
    reactionType: reaction.type,
  };

  for (const attribute of Object.values(reaction.attributes)) {
    if (typeof attribute.value === "number") {
      formattedReaction.numericalAttributes.push({
        serializationKey: attribute.serializationKey,
        value: attribute.value,
      });
    }
    else if (typeof attribute.value === "string") {
      formattedReaction.stringAttributes.push({
        serializationKey: attribute.serializationKey,
        value: attribute.value,
      });
    }
  }

  return formattedReaction;
}

/**
 * Converts a reaction as defined by the backend to a reaction as defined by the frontend.
 * This is intended to be called right after a backend request.
 * 
 * @param phase Phase returned from the backend
 */
export function apiToFrontendPhase(phase: APIPhase): Phase {
  const formattedPhase: Phase = {
    id: phase.id,
    name: phase.name,
    description: phase.description ?? "",
    speciesIds: phase.species.map(e => e.id),
    isInDatabase: true,
    isModified: false,
    isDeleted: false,
  }
  return formattedPhase;
}

/**
 * Converts a phase as defined by the frontend to a phase as defined by the backend.
 * This is intended to be called right before a backend request.
 * 
 * If the phase is not currently in the database, its id will default to '00000000-0000-0000-0000-00000000000'
 * This will not reflect its returned id when creating the phase
 *
 * Phase -> APIPhase
 * @param phase Phase information to convert
 * @param family Family this phase belongs to
 */
export function frontendToAPIPhase(phase: Phase, family: Family): APIPhase {
  const id: UUID = uuidRegex.test(phase.id) ? phase.id as UUID : "00000000-0000-0000-0000-00000000000";
  const formattedPhase: APIPhase = {
    id: id,
    name: phase.name,
    familyId: family.id as UUID,
    species: phase.speciesIds.map(id => {
      const species = family.species.find(s => s.id == id);
      if (!species) {
        throw new Error(`Species with id '${id}' not found in family`)
      }

      return frontendToAPISpecies(species, family);
    }),
  }
  return formattedPhase;
}

/**
 * Converts a mechanism as defined by the backend to a mechanism as defined by the frontend.
 * This is intended to be called right after a backend request.
 *
 * If the species is not currently in the database, its id will default to '00000000-0000-0000-0000-00000000000'
 * This will not reflect its returned id when creating the species
 * 
 * APIMechanism -> Mechanism
 * @param apiMechanism
 */
export function apiToFrontendMechanism(apiMechanism: APIMechanism): Mechanism {
  const formattedMechanism: Mechanism = {
    id: apiMechanism.id,
    name: apiMechanism.name,
    description: apiMechanism.description ?? "",
    familyId: apiMechanism.familyId,
    speciesIds: apiMechanism.species.map(e => e.id),
    reactionIds: apiMechanism.reactions.map(e => e.id),
    phaseIds: apiMechanism.phases.map(e => e.id),
    isInDatabase: true,
    isModified: false,
    isDeleted: false,
  };

  return formattedMechanism;
}

/**
 * Converts a mechanism as defined by the frontend to a mechanism as defined by the backend.
 * This is intended to be called right before a backend request.
 *
 * If the mechanism is not currently in the database, its id will default to '00000000-0000-0000-0000-00000000000'
 * This will not reflect its returned id when creating the mechanism
 * 
 * Mechanism -> APIMechanism
 * @param apiMechanism
 */
export function frontendToAPIMechanism(mechanism: Mechanism, family: Family): APIMechanism {
  const id: UUID = uuidRegex.test(mechanism.id) ? mechanism.id as UUID : "00000000-0000-0000-0000-00000000000";
  const formattedMechanism: APIMechanism = {
    id: id,
    name: mechanism.name,
    species: mechanism.speciesIds.map(e => {
      const species = family.species.find(s => s.id == e);
      if (!species) {
        throw new Error(`Species with id '${e}' was not found in family`);
      }
      return frontendToAPISpecies(species, family)
    }),
    phases: mechanism.speciesIds.map(e => {
      const phase = family.phases.find(s => s.id == e);
      if (!phase) {
        throw new Error(`Phase with id '${e}' was not found in family`);
      }
      return frontendToAPIPhase(phase, family);
    }),
    reactions: mechanism.reactionIds.map(e => {
      const reaction = family.reactions.find(s => s.id == e);
      if (!reaction) {
        throw new Error(`Reaction with id '${e}' was not found in family`);
      }
      return frontendToAPIReaction(reaction, family);
    }),
    familyId: family.id as UUID,
  };

  return formattedMechanism;
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
    description: apiFamily.description ?? "",
    mechanisms: apiFamily.mechanisms.map(e => apiToFrontendMechanism(e)),
    species: apiFamily.species.map(e => apiToFrontendSpecies(e)),
    reactions: apiFamily.reactions.map(e => apiToFrontendReaction(e)),
    phases: apiFamily.phases.map(e => apiToFrontendPhase(e)),
    isInDatabase: true,
    isModified: false,
    isDeleted: false,
  };

  return formattedFamily;
}

/**
 * Converts a family as defined by the frontend to a family as defined by the backend.
 * This is intended to be called right before a backend request.
 *
 * Family -> APIFamily
 * @param family Family information to convert
 */
export function frontendToAPIFamily(family: Family): APIFamily {
  if (!family.owner) {
    throw new Error("family owner is undefined");
  }

  const formattedFamily: APIFamily = {
    id: family.id as UUID,
    name: family.name,
    description: family.description,
    owner: family.owner,
    species: family.species.map(e => frontendToAPISpecies(e, family)),
    reactions: family.reactions.map(e => frontendToAPIReaction(e, family)),
    phases: family.phases.map(e => frontendToAPIPhase(e, family)),
    mechanisms: family.mechanisms.map(e => frontendToAPIMechanism(e, family)),
  };

  return formattedFamily;
}

/**
 * Uploads a *new* family to the backend
 * @param family
 * @returns Family with updated UUIDs of each object
 */
export async function uploadFamily(family: Family): Promise<Family> {
  // FIXME
  console.log(family);
  return family;
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
    throw new Error(
      "Cannot save family not currently in database (did you mean 'uploadFamily()'?)",
    );
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
  };

  for (const species of family.species) {
    // TODO Create Species database interactions
    if (!species.isInDatabase) {
    } else if (species.isModified) {
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
