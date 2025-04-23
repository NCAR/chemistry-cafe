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
import {
  Family,
  Mechanism,
  Phase,
  Reaction,
  reactionAttributeOptions,
  ReactionTypeName,
  Species,
  speciesAttributeOptions,
} from "../types/chemistryModels";
import {
  updateFamily,
  updateMechanism,
  updatePhase,
  updateReaction,
  updateSpecies,
} from "../API/API_UpdateMethods";
import { getFamily } from "../API/API_GetMethods";
import {
  createFamily,
  createMechanism,
  createPhase,
  createReaction,
  createSpecies,
} from "../API/API_CreateMethods";
import {
  deleteMechanism,
  deletePhase,
  deleteReaction,
  deleteSpecies,
} from "../API/API_DeleteMethods";

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
    const defaultAttribute = speciesAttributeOptions.find(
      (e) => e.serializationKey == attribute.serializationKey,
    );
    formattedSpecies.attributes[attribute.serializationKey] = {
      ...defaultAttribute,
      serializationKey: attribute.serializationKey,
      value: attribute.value,
    };
  }

  for (const attribute of apiSpecies.stringAttributes) {
    const defaultAttribute = speciesAttributeOptions.find(
      (e) => e.serializationKey == attribute.serializationKey,
    );
    formattedSpecies.attributes[attribute.serializationKey] = {
      ...defaultAttribute,
      serializationKey: attribute.serializationKey,
      value: attribute.value,
    };
  }

  return formattedSpecies;
}

/**
 * Converts a species as defined by the frontend to a species as defined by the backend.
 * This is intended to be called right before a backend request and assumes the family is already in the database.
 *
 * If the species is not currently in the database, its id will default to '00000000-0000-0000-0000-000000000000'
 * This will not reflect its returned id when creating the species
 *
 * Species -> APISpecies
 * @param species Species information to convert
 * @param family Family this species belongs to
 */
export function frontendToAPISpecies(
  species: Species,
  family: Family,
): APISpecies {
  const id: UUID = uuidRegex.test(species.id)
    ? (species.id as UUID)
    : "00000000-0000-0000-0000-000000000000";
  const formattedSpecies: APISpecies = {
    id: id,
    name: species.name,
    description: species.description,
    familyId: family.id as UUID,
    numericalAttributes: [],
    stringAttributes: [],
  };

  for (const attribute of Object.values(species.attributes)) {
    if (typeof attribute.value === "number") {
      formattedSpecies.numericalAttributes.push({
        serializationKey: attribute.serializationKey,
        value: attribute.value,
      });
    } else if (typeof attribute.value === "string") {
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
  };

  for (const attribute of apiReaction.numericalAttributes) {
    const defaultAttribute = reactionAttributeOptions[
      apiReaction.reactionType as ReactionTypeName
    ]?.find((e) => e.serializationKey == attribute.serializationKey);
    formattedReaction.attributes[attribute.serializationKey] = {
      ...defaultAttribute,
      serializationKey: attribute.serializationKey,
      value: attribute.value,
    };
  }

  for (const attribute of apiReaction.stringAttributes) {
    const defaultAttribute = speciesAttributeOptions.find(
      (e) => e.serializationKey == attribute.serializationKey,
    );
    formattedReaction.attributes[attribute.serializationKey] = {
      ...defaultAttribute,
      serializationKey: attribute.serializationKey,
      value: attribute.value,
    };
  }

  return formattedReaction;
}

/**
 * Converts a reaction as defined by the frontend to a reaction as defined by the backend.
 * This is intended to be called right before a backend request.
 *
 * If the reaction is not currently in the database, its id will default to '00000000-0000-0000-0000-000000000000'
 * This will not reflect its returned id when creating the reaction
 *
 * Reaction -> APIReaction
 * @param reaction Reaction information to convert
 * @param family Family this reaction belongs to
 */
export function frontendToAPIReaction(
  reaction: Reaction,
  family: Family,
): APIReaction {
  for (const reactant of reaction.reactants) {
    if (!uuidRegex.test(reactant.speciesId)) {
      throw new Error(`Reactant id is not a uuid: ${reactant.speciesId}`);
    }
  }
  for (const product of reaction.products) {
    if (!uuidRegex.test(product.speciesId)) {
      throw new Error(`Product id is not a uuid: ${product.speciesId}`);
    }
  }

  const id: UUID = uuidRegex.test(reaction.id)
    ? (reaction.id as UUID)
    : "00000000-0000-0000-0000-000000000000";
  const formattedReaction: APIReaction = {
    id: id,
    familyId: family.id as UUID,
    name: reaction.name,
    description: reaction.description ?? "",
    numericalAttributes: [],
    stringAttributes: [],
    reactants: reaction.reactants.filter((e) =>
      uuidRegex.test(e.speciesId),
    ) as Array<APIReactant>,
    products: reaction.products.filter((e) =>
      uuidRegex.test(e.speciesId),
    ) as Array<APIProduct>,
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
    } else if (typeof attribute.value === "string") {
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
    speciesIds: phase.species.map((e) => e.id),
    isInDatabase: true,
    isModified: false,
    isDeleted: false,
  };
  return formattedPhase;
}

/**
 * Converts a phase as defined by the frontend to a phase as defined by the backend.
 * This is intended to be called right before a backend request.
 *
 * If the phase is not currently in the database, its id will default to '00000000-0000-0000-0000-000000000000'
 * This will not reflect its returned id when creating the phase
 *
 * Nested objects will be converted to shells with only the id being valid.
 * This will not add any nested object ids that have invalid UUIDs
 *
 * Phase -> APIPhase
 * @param phase Phase information to convert
 * @param family Family this phase belongs to
 */
export function frontendToAPIPhase(phase: Phase, family: Family): APIPhase {
  const phaseId: UUID = uuidRegex.test(phase.id)
    ? (phase.id as UUID)
    : "00000000-0000-0000-0000-000000000000";
  const formattedPhase: APIPhase = {
    id: phaseId,
    name: phase.name,
    familyId: family.id as UUID,
    species: phase.speciesIds
      .filter((id) => uuidRegex.test(id))
      .map((id) => {
        // Creates temporary object which is used for setting up relations.
        // This relies on the fact that the backend does not update nested objects.
        const species: APISpecies = {
          id: id as UUID,
          name: "",
          numericalAttributes: [],
          stringAttributes: [],
          familyId: family.id as UUID,
        };
        return species;
      }),
  };
  return formattedPhase;
}

/**
 * Converts a mechanism as defined by the backend to a mechanism as defined by the frontend.
 * This is intended to be called right after a backend request.
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
    speciesIds: apiMechanism.species.map((e) => e.id),
    reactionIds: apiMechanism.reactions.map((e) => e.id),
    phaseIds: apiMechanism.phases.map((e) => e.id),
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
 * If the mechanism is not currently in the database, its id will default to '00000000-0000-0000-0000-000000000000'
 * This will not reflect its returned id when creating the mechanism
 *
 * Nested objects will be converted to shells with only the id being valid.
 * This will not add any nested object ids that aren't valid UUIDs
 *
 * Mechanism -> APIMechanism
 * @param apiMechanism
 */
export function frontendToAPIMechanism(
  mechanism: Mechanism,
  family: Family,
): APIMechanism {
  const mechanismId: UUID = uuidRegex.test(mechanism.id)
    ? (mechanism.id as UUID)
    : "00000000-0000-0000-0000-000000000000";
  const formattedMechanism: APIMechanism = {
    id: mechanismId,
    name: mechanism.name,
    species: mechanism.speciesIds
      .filter((id) => uuidRegex.test(id))
      .map((id) => {
        const species: APISpecies = {
          id: id as UUID,
          name: "",
          numericalAttributes: [],
          stringAttributes: [],
          familyId: family.id as UUID,
        };
        return species;
      }),
    phases: mechanism.phaseIds
      .filter((id) => uuidRegex.test(id))
      .map((id) => {
        const phase: APIPhase = {
          id: id as UUID,
          name: "",
          familyId: family.id as UUID,
          species: [],
        };
        return phase;
      }),
    reactions: mechanism.reactionIds
      .filter((id) => uuidRegex.test(id))
      .map((id) => {
        const reaction: APIReaction = {
          id: id as UUID,
          name: "",
          reactionType: "",
          numericalAttributes: [],
          stringAttributes: [],
          reactants: [],
          products: [],
          familyId: family.id as UUID,
        };
        return reaction;
      }),
    familyId: family.id as UUID,
  };

  return formattedMechanism;
}

/**
 * Converts a family as defined by the backend to a family as defined by the frontend.
 * This is intended to be called right after a backend request.
 *
 * This will not add any nested object ids that aren't valid UUIDs
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
    owner: apiFamily.owner,
    mechanisms: apiFamily.mechanisms
      .filter((e) => uuidRegex.test(e.id))
      .map((e) => apiToFrontendMechanism(e)),
    species: apiFamily.species
      .filter((e) => uuidRegex.test(e.id))
      .map((e) => apiToFrontendSpecies(e)),
    reactions: apiFamily.reactions
      .filter((e) => uuidRegex.test(e.id))
      .map((e) => apiToFrontendReaction(e)),
    phases: apiFamily.phases
      .filter((e) => uuidRegex.test(e.id))
      .map((e) => apiToFrontendPhase(e)),
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
export function frontendToAPIFamily(
  family: Family,
  expand: boolean = true,
): APIFamily {
  if (!family.owner) {
    throw new Error("family owner is null");
  }

  const familyId: UUID = uuidRegex.test(family.id)
    ? (family.id as UUID)
    : "00000000-0000-0000-0000-000000000000";
  const formattedFamily: APIFamily = {
    id: familyId,
    name: family.name,
    description: family.description,
    owner: family.owner,
    species: expand
      ? family.species.map((e) => frontendToAPISpecies(e, family))
      : [],
    reactions: expand
      ? family.reactions.map((e) => frontendToAPIReaction(e, family))
      : [],
    phases: expand
      ? family.phases.map((e) => frontendToAPIPhase(e, family))
      : [],
    mechanisms: expand
      ? family.mechanisms.map((e) => frontendToAPIMechanism(e, family))
      : [],
  };

  return formattedFamily;
}

/**
 * Uploads a *new* family to the backend
 * @param family
 * @returns Family with updated UUIDs of each object
 */
export async function uploadFamily(family: Family): Promise<Family> {
  const resultFamily = await createFamily(frontendToAPIFamily(family, false));

  return saveFamilyChanges({
    ...family,
    id: resultFamily.id,
    isInDatabase: true,
    isModified: true,
  });
}

/**
 * Saves any changes made to the family to the backend
 * @param family
 * @throws HTTP errors
 * @returns Family with updated UUIDs of objects
 */
export async function saveFamilyChanges(family: Family): Promise<Family> {
  // Don't make a network request if the family has not been modified
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

  // Used to map frontend ids to real ids
  const speciesIdMappings: Map<string, UUID> = new Map();
  const phaseIdMappings: Map<string, UUID> = new Map();
  const reactionIdMappings: Map<string, UUID> = new Map();

  for (const species of family.species) {
    const apiSpecies = frontendToAPISpecies(species, family);
    if (species.isInDatabase) {
      if (species.isDeleted) {
        await deleteSpecies(apiSpecies.id);
      } else if (species.isModified) {
        await updateSpecies(apiSpecies);
        speciesIdMappings.set(species.id, apiSpecies.id as UUID);
      } else {
        speciesIdMappings.set(species.id, apiSpecies.id as UUID);
      }
    } else {
      if (!species.isDeleted) {
        const resultSpecies: APISpecies = await createSpecies(apiSpecies);
        speciesIdMappings.set(species.id, resultSpecies.id);
      }
    }
  }

  for (const phase of family.phases) {
    const phaseWithMappings: Phase = {
      ...phase,
      speciesIds: phase.speciesIds
        .filter((id) => speciesIdMappings.get(id) != undefined)
        .map((id) => speciesIdMappings.get(id) as UUID),
    };

    const apiPhase = frontendToAPIPhase(phaseWithMappings, family);
    if (phase.isInDatabase) {
      if (phase.isDeleted) {
        deletePhase(phase.id).catch((e) => console.error(e));
      } else if (phase.isModified) {
        await updatePhase(apiPhase);
        phaseIdMappings.set(phase.id, apiPhase.id);
      } else {
        phaseIdMappings.set(phase.id, apiPhase.id);
      }
    } else {
      if (!phase.isDeleted) {
        const resultPhase = await createPhase(apiPhase);
        phaseIdMappings.set(phase.id, resultPhase.id);
      }
    }
  }

  for (const reaction of family.reactions) {
    const reactionWithMappings: Reaction = {
      ...reaction,
      reactants: reaction.reactants
        .filter((e) => speciesIdMappings.get(e.speciesId) != undefined)
        .map((e) => {
          return {
            ...e,
            speciesId: speciesIdMappings.get(e.speciesId) as UUID,
          };
        }),
      products: reaction.products
        .filter((e) => speciesIdMappings.get(e.speciesId) != undefined)
        .map((e) => {
          return {
            ...e,
            speciesId: speciesIdMappings.get(e.speciesId) as UUID,
          };
        }),
      gasPhaseId: phaseIdMappings.get(reaction.gasPhaseId ?? ""),
      gasPhaseSpeciesId: speciesIdMappings.get(
        reaction.gasPhaseSpeciesId ?? "",
      ),
      aerosolPhaseId: phaseIdMappings.get(reaction.aerosolPhaseId ?? ""),
      aerosolPhaseSpeciesId: speciesIdMappings.get(
        reaction.aerosolPhaseSpeciesId ?? "",
      ),
      aerosolPhaseWaterId: speciesIdMappings.get(
        reaction.aerosolPhaseWaterId ?? "",
      ),
    };

    const apiReaction = frontendToAPIReaction(reactionWithMappings, family);
    if (reaction.isInDatabase) {
      if (reaction.isDeleted) {
        deleteReaction(reaction.id).catch((e) => console.error(e));
      } else if (reaction.isModified) {
        await updateReaction(apiReaction);
        reactionIdMappings.set(reaction.id, apiReaction.id);
      } else {
        reactionIdMappings.set(reaction.id, apiReaction.id);
      }
    } else {
      const resultReaction = await createReaction(apiReaction);
      reactionIdMappings.set(reaction.id, resultReaction.id);
    }
  }

  for (const mechanism of family.mechanisms) {
    const mechanismWithMappings: Mechanism = {
      ...mechanism,
      speciesIds: mechanism.speciesIds
        .filter((id) => speciesIdMappings.get(id) != undefined)
        .map((id) => speciesIdMappings.get(id) as UUID),
      reactionIds: mechanism.reactionIds
        .filter((id) => reactionIdMappings.get(id) != undefined)
        .map((id) => reactionIdMappings.get(id) as UUID),
      phaseIds: mechanism.phaseIds
        .filter((id) => phaseIdMappings.get(id) != undefined)
        .map((id) => phaseIdMappings.get(id) as UUID),
    };

    const apiMechanism = frontendToAPIMechanism(mechanismWithMappings, family);
    if (mechanism.isInDatabase) {
      if (mechanism.isDeleted) {
        deleteMechanism(mechanism.id).catch((e) => console.error(e));
      } else if (mechanism.isModified) {
        await updateMechanism(apiMechanism);
      }
    } else {
      await createMechanism(apiMechanism);
    }
  }

  await updateFamily(frontendToAPIFamily(family, false));
  return apiToFrontendFamily(await getFamily(family.id as UUID));
}
