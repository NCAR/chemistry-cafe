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
} from "../API/API_UpdateMethods";
import { getFamily } from "../API/API_GetMethods";
import {
  createFamily,
} from "../API/API_CreateMethods";

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
    speciesIds: phase.speciesIds,
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
    speciesIds: phase.speciesIds as UUID[],
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
    speciesIds: apiMechanism.speciesIds,
    reactionIds: apiMechanism.reactionIds,
    phaseIds: apiMechanism.phaseIds,
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
    speciesIds: mechanism.speciesIds as UUID[],
    reactionIds: mechanism.reactionIds as UUID[],
    phaseIds: mechanism.phaseIds as UUID[],
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
export async function uploadFamily(family: Family, owner: APIUser): Promise<Family> {
  const created = await createFamily(frontendToAPIFamily({ ...family, owner }, true));
  return apiToFrontendFamily(await getFamily(created.id as UUID));
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

  await updateFamily(frontendToAPIFamily(family, true));
  return apiToFrontendFamily(await getFamily(family.id as UUID));
}
