import { Family, Mechanism, Reaction, Species } from "../types/chemistryModels";
import * as YAML from "yaml";
/**
 * Converts a species to the CAMP V1 format
 */
const speciesToCAMPV1 = (
  species: Species,
): Object => {
  let serializedSpecies: any = {
    name: species.name,
  }

  for (const key of Object.keys(species.attributes)) {
    serializedSpecies[key] = species.attributes[key].value;
  }

  return serializedSpecies;
}

const reactionToCAMPV1 = (
  reaction: Reaction,
  family: Family,
): Object => {
  let serializedReaction: any = {
    name: reaction.name,
    type: reaction.type,
    "gas phase": "gas",
    reactants: [],
    products: [],
  }

  for (const { speciesId, coefficient } of reaction.reactants) {
    const species = family.species.find((e) => e.id === speciesId);
    if (!species) {
      continue;
    }
    serializedReaction.reactants.push({
      "species name": species.name,
      "coefficient": coefficient,
    });
  }

  for (const { speciesId, coefficient } of reaction.products) {
    const species = family.species.find((e) => e.id === speciesId);
    if (!species) {
      continue;
    }
    serializedReaction.products.push({
      "species name": species.name,
      "coefficient": coefficient,
    });
  }

  for (const key of Object.keys(reaction.attributes)) {
    serializedReaction[key] = reaction.attributes[key].value;
  }

  return serializedReaction;
}

/**
 * Stub of serialization of mechanism
 * @param mechanism
 * @param family
 * @returns
 */
const mechanismToCAMPV1 = (
  mechanism: Mechanism,
  family: Family,
): Object => {
  const jsonObject = {
    version: "1.0.0",
    name: mechanism.name,
    species: family.species.filter((e) => mechanism.speciesIds.includes(e.id)).map((e) => speciesToCAMPV1(e)),
    phases: [
      {
        name: "gas",
        species: family.species.filter((e) =>
          mechanism.speciesIds.includes(e.id),
        ).map((e) => e.name),
      },
    ],
    reactions: family.reactions.filter((e) => mechanism.reactionIds.includes(e.id)).map((e) => reactionToCAMPV1(e, family)),
  };

  return jsonObject;
};

export const serializeMechanismJSON = (
  mechanism: Mechanism,
  family: Family,
): string => {
  return JSON.stringify(mechanismToCAMPV1(mechanism, family), null, 2);
}

export const serializeMechanismYAML = (
  mechanism: Mechanism,
  family: Family,
): string => {
  return YAML.stringify(mechanismToCAMPV1(mechanism, family), null, 2);
}
