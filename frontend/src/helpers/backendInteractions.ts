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
import { updateFamily } from "../API/API_UpdateMethods";
import { getFamily } from "../API/API_GetMethods";
import { createFamily } from "../API/API_CreateMethods";

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
    isThirdBody: apiSpecies.isThirdBody ?? undefined,
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
    isThirdBody: species.isThirdBody,
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
    gasPhaseId: apiReaction.gasPhaseId as UUID | undefined,
    gasPhaseSpeciesId: apiReaction.gasPhaseSpeciesId as UUID | undefined,
    aerosolPhaseId: apiReaction.aerosolPhaseId as UUID | undefined,
    aerosolPhaseSpeciesId: apiReaction.aerosolPhaseSpeciesId as
      | UUID
      | undefined,
    aerosolPhaseWaterId: apiReaction.aerosolPhaseWaterId as UUID | undefined,
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

  // Arrhenius reactions store their parameters in a dedicated table. Read them
  // back into the attribute bag, keyed by the serialization key the editor uses.
  if (apiReaction.reactionType === "ARRHENIUS" && apiReaction.arrhenius) {
    const arrheniusValues: Record<string, number | null | undefined> = {
      A: apiReaction.arrhenius.a,
      B: apiReaction.arrhenius.b,
      C: apiReaction.arrhenius.c,
      Ea: apiReaction.arrhenius.ea,
      D: apiReaction.arrhenius.d,
      E: apiReaction.arrhenius.e,
    };
    for (const [serializationKey, value] of Object.entries(arrheniusValues)) {
      if (value === null || value === undefined) {
        continue;
      }
      const defaultAttribute = reactionAttributeOptions.ARRHENIUS?.find(
        (e) => e.serializationKey === serializationKey,
      );
      formattedReaction.attributes[serializationKey] = {
        ...defaultAttribute,
        serializationKey,
        value,
      };
    }
  }

  // Tunneling reactions store their parameters in a dedicated table. Read them
  // back into the attribute bag, keyed by the serialization key the editor uses.
  if (apiReaction.reactionType === "TUNNELING" && apiReaction.tunneling) {
    const tunnelingValues: Record<string, number | null | undefined> = {
      A: apiReaction.tunneling.a,
      B: apiReaction.tunneling.b,
      C: apiReaction.tunneling.c,
    };
    for (const [serializationKey, value] of Object.entries(tunnelingValues)) {
      if (value === null || value === undefined) {
        continue;
      }
      const defaultAttribute = reactionAttributeOptions.TUNNELING?.find(
        (e) => e.serializationKey === serializationKey,
      );
      formattedReaction.attributes[serializationKey] = {
        ...defaultAttribute,
        serializationKey,
        value,
      };
    }
  }

  // Troe reactions store their parameters in a dedicated table. Read them
  // back into the attribute bag, keyed by the serialization key the editor uses.
  if (apiReaction.reactionType === "TROE" && apiReaction.troe) {
    const troeValues: Record<string, number | null | undefined> = {
      k0_A: apiReaction.troe.k0A,
      k0_B: apiReaction.troe.k0B,
      k0_C: apiReaction.troe.k0C,
      kinf_A: apiReaction.troe.kinfA,
      kinf_B: apiReaction.troe.kinfB,
      kinf_C: apiReaction.troe.kinfC,
      Fc: apiReaction.troe.fc,
      N: apiReaction.troe.n,
    };
    for (const [serializationKey, value] of Object.entries(troeValues)) {
      if (value === null || value === undefined) {
        continue;
      }
      const defaultAttribute = reactionAttributeOptions.TROE?.find(
        (e) => e.serializationKey === serializationKey,
      );
      formattedReaction.attributes[serializationKey] = {
        ...defaultAttribute,
        serializationKey,
        value,
      };
    }
  }

  // Ternary Chemical Activation reactions store their parameters in a
  // dedicated table. Read them back into the attribute bag, keyed by the
  // serialization key the editor uses.
  if (
    apiReaction.reactionType === "TERNARY_CHEMICAL_ACTIVATION" &&
    apiReaction.ternaryChemicalActivation
  ) {
    const tcaValues: Record<string, number | null | undefined> = {
      k0_A: apiReaction.ternaryChemicalActivation.k0A,
      k0_B: apiReaction.ternaryChemicalActivation.k0B,
      k0_C: apiReaction.ternaryChemicalActivation.k0C,
      kinf_A: apiReaction.ternaryChemicalActivation.kinfA,
      kinf_B: apiReaction.ternaryChemicalActivation.kinfB,
      kinf_C: apiReaction.ternaryChemicalActivation.kinfC,
      Fc: apiReaction.ternaryChemicalActivation.fc,
      N: apiReaction.ternaryChemicalActivation.n,
    };
    for (const [serializationKey, value] of Object.entries(tcaValues)) {
      if (value === null || value === undefined) {
        continue;
      }
      const defaultAttribute =
        reactionAttributeOptions.TERNARY_CHEMICAL_ACTIVATION?.find(
          (e) => e.serializationKey === serializationKey,
        );
      formattedReaction.attributes[serializationKey] = {
        ...defaultAttribute,
        serializationKey,
        value,
      };
    }
  }

  // Branched (no RO2) reactions store their parameters in a dedicated table.
  // Read them back into the attribute bag, keyed by the serialization key
  // the editor uses.
  if (apiReaction.reactionType === "BRANCHED_NO_RO2" && apiReaction.branched) {
    const branchedValues: Record<string, number | null | undefined> = {
      X: apiReaction.branched.x,
      Y: apiReaction.branched.y,
      a0: apiReaction.branched.a0,
      n: apiReaction.branched.n,
    };
    for (const [serializationKey, value] of Object.entries(branchedValues)) {
      if (value === null || value === undefined) {
        continue;
      }
      const defaultAttribute = reactionAttributeOptions.BRANCHED_NO_RO2?.find(
        (e) => e.serializationKey === serializationKey,
      );
      formattedReaction.attributes[serializationKey] = {
        ...defaultAttribute,
        serializationKey,
        value,
      };
    }
  }

  // Taylor Series reactions store their parameters in a dedicated table.
  // Read them back into the attribute bag, keyed by the serialization key
  // the editor uses. taylorCoefficients is the one variable-length value,
  // stored inline as a number array rather than a scalar.
  if (
    apiReaction.reactionType === "TAYLOR_SERIES" &&
    apiReaction.taylorSeries
  ) {
    const taylorSeriesValues: Record<
      string,
      number | Array<number> | null | undefined
    > = {
      A: apiReaction.taylorSeries.a,
      B: apiReaction.taylorSeries.b,
      C: apiReaction.taylorSeries.c,
      Ea: apiReaction.taylorSeries.ea,
      D: apiReaction.taylorSeries.d,
      E: apiReaction.taylorSeries.e,
      "taylor coefficients": apiReaction.taylorSeries.taylorCoefficients,
    };
    for (const [serializationKey, value] of Object.entries(
      taylorSeriesValues,
    )) {
      if (value === null || value === undefined) {
        continue;
      }
      const defaultAttribute = reactionAttributeOptions.TAYLOR_SERIES?.find(
        (e) => e.serializationKey === serializationKey,
      );
      formattedReaction.attributes[serializationKey] = {
        ...defaultAttribute,
        serializationKey,
        value,
      };
    }
  }

  // Surface reactions store their parameters in a dedicated table. Read
  // them back into the attribute bag, keyed by the serialization key the
  // editor uses.
  if (apiReaction.reactionType === "SURFACE" && apiReaction.surface) {
    const surfaceValues: Record<string, number | null | undefined> = {
      "reaction probability": apiReaction.surface.reactionProbability,
    };
    for (const [serializationKey, value] of Object.entries(surfaceValues)) {
      if (value === null || value === undefined) {
        continue;
      }
      const defaultAttribute = reactionAttributeOptions.SURFACE?.find(
        (e) => e.serializationKey === serializationKey,
      );
      formattedReaction.attributes[serializationKey] = {
        ...defaultAttribute,
        serializationKey,
        value,
      };
    }
  }

  // Emission reactions store their parameters in a dedicated table. Read
  // them back into the attribute bag, keyed by the serialization key the
  // editor uses.
  if (apiReaction.reactionType === "EMISSION" && apiReaction.emission) {
    const emissionValues: Record<string, number | null | undefined> = {
      "scaling factor": apiReaction.emission.scalingFactor,
    };
    for (const [serializationKey, value] of Object.entries(emissionValues)) {
      if (value === null || value === undefined) {
        continue;
      }
      const defaultAttribute = reactionAttributeOptions.EMISSION?.find(
        (e) => e.serializationKey === serializationKey,
      );
      formattedReaction.attributes[serializationKey] = {
        ...defaultAttribute,
        serializationKey,
        value,
      };
    }
  }

  // First Order Loss reactions store their parameters in a dedicated table.
  // Read them back into the attribute bag, keyed by the serialization key
  // the editor uses.
  if (
    apiReaction.reactionType === "FIRST_ORDER_LOSS" &&
    apiReaction.firstOrderLoss
  ) {
    const firstOrderLossValues: Record<string, number | null | undefined> = {
      "scaling factor": apiReaction.firstOrderLoss.scalingFactor,
    };
    for (const [serializationKey, value] of Object.entries(
      firstOrderLossValues,
    )) {
      if (value === null || value === undefined) {
        continue;
      }
      const defaultAttribute = reactionAttributeOptions.FIRST_ORDER_LOSS?.find(
        (e) => e.serializationKey === serializationKey,
      );
      formattedReaction.attributes[serializationKey] = {
        ...defaultAttribute,
        serializationKey,
        value,
      };
    }
  }

  // Photolysis reactions store their parameters in a dedicated table. Read
  // them back into the attribute bag, keyed by the serialization key the
  // editor uses.
  if (apiReaction.reactionType === "PHOTOLYSIS" && apiReaction.photolysis) {
    const photolysisValues: Record<string, number | null | undefined> = {
      "scaling factor": apiReaction.photolysis.scalingFactor,
    };
    for (const [serializationKey, value] of Object.entries(
      photolysisValues,
    )) {
      if (value === null || value === undefined) {
        continue;
      }
      const defaultAttribute = reactionAttributeOptions.PHOTOLYSIS?.find(
        (e) => e.serializationKey === serializationKey,
      );
      formattedReaction.attributes[serializationKey] = {
        ...defaultAttribute,
        serializationKey,
        value,
      };
    }
  }

  // User Defined reactions store their parameters in a dedicated table.
  // Read them back into the attribute bag, keyed by the serialization key
  // the editor uses.
  if (apiReaction.reactionType === "USER_DEFINED" && apiReaction.userDefined) {
    const userDefinedValues: Record<string, number | null | undefined> = {
      "scaling factor": apiReaction.userDefined.scalingFactor,
    };
    for (const [serializationKey, value] of Object.entries(
      userDefinedValues,
    )) {
      if (value === null || value === undefined) {
        continue;
      }
      const defaultAttribute = reactionAttributeOptions.USER_DEFINED?.find(
        (e) => e.serializationKey === serializationKey,
      );
      formattedReaction.attributes[serializationKey] = {
        ...defaultAttribute,
        serializationKey,
        value,
      };
    }
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

  // Reaction types with a dedicated parameter table write to that table's
  // field instead of the attribute lists.
  const numOrNull = (value: number | number[] | string | undefined) =>
    typeof value === "number" ? value : null;

  if (reaction.type === "ARRHENIUS") {
    formattedReaction.arrhenius = {
      a: numOrNull(reaction.attributes["A"]?.value),
      b: numOrNull(reaction.attributes["B"]?.value),
      c: numOrNull(reaction.attributes["C"]?.value),
      ea: numOrNull(reaction.attributes["Ea"]?.value),
      d: numOrNull(reaction.attributes["D"]?.value),
      e: numOrNull(reaction.attributes["E"]?.value),
    };
  } else if (reaction.type === "TUNNELING") {
    formattedReaction.tunneling = {
      a: numOrNull(reaction.attributes["A"]?.value),
      b: numOrNull(reaction.attributes["B"]?.value),
      c: numOrNull(reaction.attributes["C"]?.value),
    };
  } else if (reaction.type === "TROE") {
    formattedReaction.troe = {
      k0A: numOrNull(reaction.attributes["k0_A"]?.value),
      k0B: numOrNull(reaction.attributes["k0_B"]?.value),
      k0C: numOrNull(reaction.attributes["k0_C"]?.value),
      kinfA: numOrNull(reaction.attributes["kinf_A"]?.value),
      kinfB: numOrNull(reaction.attributes["kinf_B"]?.value),
      kinfC: numOrNull(reaction.attributes["kinf_C"]?.value),
      fc: numOrNull(reaction.attributes["Fc"]?.value),
      n: numOrNull(reaction.attributes["N"]?.value),
    };
  } else if (reaction.type === "TERNARY_CHEMICAL_ACTIVATION") {
    formattedReaction.ternaryChemicalActivation = {
      k0A: numOrNull(reaction.attributes["k0_A"]?.value),
      k0B: numOrNull(reaction.attributes["k0_B"]?.value),
      k0C: numOrNull(reaction.attributes["k0_C"]?.value),
      kinfA: numOrNull(reaction.attributes["kinf_A"]?.value),
      kinfB: numOrNull(reaction.attributes["kinf_B"]?.value),
      kinfC: numOrNull(reaction.attributes["kinf_C"]?.value),
      fc: numOrNull(reaction.attributes["Fc"]?.value),
      n: numOrNull(reaction.attributes["N"]?.value),
    };
  } else if (reaction.type === "BRANCHED_NO_RO2") {
    formattedReaction.branched = {
      x: numOrNull(reaction.attributes["X"]?.value),
      y: numOrNull(reaction.attributes["Y"]?.value),
      a0: numOrNull(reaction.attributes["a0"]?.value),
      n: numOrNull(reaction.attributes["n"]?.value),
    };
  } else if (reaction.type === "TAYLOR_SERIES") {
    const taylorCoefficients =
      reaction.attributes["taylor coefficients"]?.value;
    formattedReaction.taylorSeries = {
      a: numOrNull(reaction.attributes["A"]?.value),
      b: numOrNull(reaction.attributes["B"]?.value),
      c: numOrNull(reaction.attributes["C"]?.value),
      ea: numOrNull(reaction.attributes["Ea"]?.value),
      d: numOrNull(reaction.attributes["D"]?.value),
      e: numOrNull(reaction.attributes["E"]?.value),
      taylorCoefficients: Array.isArray(taylorCoefficients)
        ? taylorCoefficients
        : null,
    };
  } else if (reaction.type === "SURFACE") {
    formattedReaction.surface = {
      reactionProbability: numOrNull(
        reaction.attributes["reaction probability"]?.value,
      ),
    };
  } else if (reaction.type === "EMISSION") {
    formattedReaction.emission = {
      scalingFactor: numOrNull(reaction.attributes["scaling factor"]?.value),
    };
  } else if (reaction.type === "FIRST_ORDER_LOSS") {
    formattedReaction.firstOrderLoss = {
      scalingFactor: numOrNull(reaction.attributes["scaling factor"]?.value),
    };
  } else if (reaction.type === "PHOTOLYSIS") {
    formattedReaction.photolysis = {
      scalingFactor: numOrNull(reaction.attributes["scaling factor"]?.value),
    };
  } else if (reaction.type === "USER_DEFINED") {
    formattedReaction.userDefined = {
      scalingFactor: numOrNull(reaction.attributes["scaling factor"]?.value),
    };
  } else {
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
    description: phase.description ?? undefined,
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
    description: mechanism.description ?? undefined,
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
export async function uploadFamily(
  family: Family,
  owner: APIUser,
): Promise<Family> {
  const created = await createFamily(
    frontendToAPIFamily({ ...family, owner }, true),
  );
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
