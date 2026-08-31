import { UUID } from "crypto";
import {
  APIFamily,
  APIMechanism,
  APIPhase,
  APIProduct,
  APIReactant,
  APIReaction,
  APISpecies,
  APIUser,
} from "../API/API_Interfaces";
import {
  Family,
  Mechanism,
  Phase,
  Reaction,
  reactionAttributeOptions,
  ReactionTypeName,
  Species,
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
 * Converts a species as defined by the backend to a species as defined by the frontend.
 * This is intended to be called right after a backend request.
 *
 * APISpecies -> Species
 * @param apiSpecies Species information from  the backend
 */
export function apiToFrontendSpecies(apiSpecies: APISpecies): Species {
  const formattedSpecies: Species = {
    absoluteTolerance: apiSpecies.absoluteTolerance ?? undefined,
    constantConcentration: apiSpecies.constantConcentration ?? undefined,
    constantMixingRatio: apiSpecies.constantMixingRatio ?? undefined,
    description: apiSpecies.description || "",
    familyId: apiSpecies.familyId,
    id: apiSpecies.id,
    isDeleted: false,
    isInDatabase: true,
    isModified: false,
    molecularWeight: apiSpecies.molecularWeight ?? undefined,
    name: apiSpecies.name ?? "<Empty>",
    otherProperties: apiSpecies.otherProperties ?? undefined,
  };
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
  const formattedSpecies: APISpecies = {
    absoluteTolerance: species.absoluteTolerance,
    constantConcentration: species.constantConcentration,
    constantMixingRatio: species.constantMixingRatio,
    description: species.description,
    familyId: family.id as UUID,
    id: species.id,
    molecularWeight: species.molecularWeight,
    name: species.name,
    otherProperties: species.otherProperties,
  };
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
    const defaultAttribute = reactionAttributeOptions[
      apiReaction.reactionType as ReactionTypeName
    ]?.find((e) => e.serializationKey == attribute.serializationKey);
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
  const formattedReaction: APIReaction = {
    id: reaction.id,
    familyId: family.id as UUID,
    name: reaction.name,
    description: reaction.description ?? "",
    numericalAttributes: [],
    stringAttributes: [],
    reactants: reaction.reactants as Array<APIReactant>,
    products: reaction.products as Array<APIProduct>,
    gasPhaseId: reaction.gasPhaseId as UUID,
    gasPhaseSpeciesId: reaction.gasPhaseSpeciesId as UUID,
    aerosolPhaseId: reaction.aerosolPhaseId as UUID,
    aerosolPhaseSpeciesId: reaction.aerosolPhaseSpeciesId as UUID,
    aerosolPhaseWaterId: reaction.aerosolPhaseWaterId as UUID,
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
  const formattedPhase: APIPhase = {
    id: phase.id,
    name: phase.name,
    familyId: family.id as UUID,
    species: phase.speciesIds.map((id) => {
      // Creates temporary object which is used for setting up relations.
      // This relies on the fact that the backend does not update nested objects.
      const species: APISpecies = {
        id: id as UUID,
        name: "",
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
  const formattedMechanism: APIMechanism = {
    id: mechanism.id,
    name: mechanism.name,
    species: mechanism.speciesIds.map((id) => {
      const species: APISpecies = {
        id: id as UUID,
        name: "",
        familyId: family.id as UUID,
      };
      return species;
    }),
    phases: mechanism.phaseIds.map((id) => {
      const phase: APIPhase = {
        id: id as UUID,
        name: "",
        familyId: family.id as UUID,
        species: [],
      };
      return phase;
    }),
    reactions: mechanism.reactionIds.map((id) => {
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
  const formattedFamily: Family = {
    id: apiFamily.id,
    name: apiFamily.name,
    description: apiFamily.description ?? "",
    owner: apiFamily.owner,
    mechanisms: apiFamily.mechanisms.map((e) => apiToFrontendMechanism(e)),
    species: apiFamily.species.map((e) => apiToFrontendSpecies(e)),
    reactions: apiFamily.reactions.map((e) => apiToFrontendReaction(e)),
    phases: apiFamily.phases.map((e) => apiToFrontendPhase(e)),
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

  const formattedFamily: APIFamily = {
    id: family.id,
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
export async function uploadFamily(
  family: Family,
  owner: APIUser,
): Promise<Family> {
  const familyToUpload: Family = {
    ...family,
    owner: owner,
  };

  const resultFamily = await createFamily(
    frontendToAPIFamily(familyToUpload, false),
  );

  return saveFamilyChanges({
    ...familyToUpload,
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

  if (!family.isInDatabase) {
    throw new Error(
      "Cannot save family not currently in database (did you mean 'uploadFamily()'?)",
    );
  }

  const liveSpeciesIds = new Set<string>(
    family.species
      .filter((species) => !species.isDeleted)
      .map((species) => species.id),
  );
  const livePhaseIds = new Set<string>(
    family.phases.filter((phase) => !phase.isDeleted).map((phase) => phase.id),
  );
  const liveReactionIds = new Set<string>(
    family.reactions
      .filter((reaction) => !reaction.isDeleted)
      .map((reaction) => reaction.id),
  );

  for (const species of family.species) {
    const apiSpecies = frontendToAPISpecies(species, family);
    if (species.isInDatabase) {
      if (species.isDeleted) {
        await deleteSpecies(apiSpecies.id);
      } else if (species.isModified) {
        await updateSpecies(apiSpecies);
      }
    } else if (!species.isDeleted) {
      await createSpecies(apiSpecies);
    }
  }

  for (const phase of family.phases) {
    const phaseWithLiveReferences: Phase = {
      ...phase,
      speciesIds: phase.speciesIds.filter((id) => liveSpeciesIds.has(id)),
    };

    const apiPhase = frontendToAPIPhase(phaseWithLiveReferences, family);
    if (phase.isInDatabase) {
      if (phase.isDeleted) {
        deletePhase(phase.id).catch((e) => console.error(e));
      } else if (phase.isModified) {
        await updatePhase(apiPhase);
      }
    } else if (!phase.isDeleted) {
      await createPhase(apiPhase);
    }
  }

  for (const reaction of family.reactions) {
    const reactionWithLiveReferences: Reaction = {
      ...reaction,
      reactants: reaction.reactants.filter((reactant) =>
        liveSpeciesIds.has(reactant.speciesId),
      ),
      products: reaction.products.filter((product) =>
        liveSpeciesIds.has(product.speciesId),
      ),
      gasPhaseId:
        reaction.gasPhaseId && livePhaseIds.has(reaction.gasPhaseId)
          ? reaction.gasPhaseId
          : undefined,
      gasPhaseSpeciesId:
        reaction.gasPhaseSpeciesId &&
        liveSpeciesIds.has(reaction.gasPhaseSpeciesId)
          ? reaction.gasPhaseSpeciesId
          : undefined,
      aerosolPhaseId:
        reaction.aerosolPhaseId && livePhaseIds.has(reaction.aerosolPhaseId)
          ? reaction.aerosolPhaseId
          : undefined,
      aerosolPhaseSpeciesId:
        reaction.aerosolPhaseSpeciesId &&
        liveSpeciesIds.has(reaction.aerosolPhaseSpeciesId)
          ? reaction.aerosolPhaseSpeciesId
          : undefined,
      aerosolPhaseWaterId:
        reaction.aerosolPhaseWaterId &&
        liveSpeciesIds.has(reaction.aerosolPhaseWaterId)
          ? reaction.aerosolPhaseWaterId
          : undefined,
    };

    const apiReaction = frontendToAPIReaction(
      reactionWithLiveReferences,
      family,
    );
    if (reaction.isInDatabase) {
      if (reaction.isDeleted) {
        deleteReaction(reaction.id).catch((e) => console.error(e));
      } else if (reaction.isModified) {
        await updateReaction(apiReaction);
      }
    } else {
      await createReaction(apiReaction);
    }
  }

  for (const mechanism of family.mechanisms) {
    const mechanismWithLiveReferences: Mechanism = {
      ...mechanism,
      speciesIds: mechanism.speciesIds.filter((id) => liveSpeciesIds.has(id)),
      reactionIds: mechanism.reactionIds.filter((id) =>
        liveReactionIds.has(id),
      ),
      phaseIds: mechanism.phaseIds.filter((id) => livePhaseIds.has(id)),
    };

    const apiMechanism = frontendToAPIMechanism(
      mechanismWithLiveReferences,
      family,
    );
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
