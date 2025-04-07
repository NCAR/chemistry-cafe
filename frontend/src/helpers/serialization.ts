import { Family, Mechanism, Reaction, Species } from "../types/chemistryModels";

/**
 * Converts a species to the V1 format
 */
const serializeSpeciesJSON = (
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

const serializeReactionJSON = (
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
export const serializeMechanismJSON = (
  mechanism: Mechanism,
  family: Family,
): string => {
  const jsonObject = {
    version: "1.0.0",
    name: mechanism.name,
    species: family.species.filter((e) => mechanism.speciesIds.includes(e.id)).map((e) => serializeSpeciesJSON(e)),
    phases: [
      {
        name: "gas",
        species: family.species.filter((e) =>
          mechanism.speciesIds.includes(e.id),
        ).map((e) => e.name),
      },
    ],
    reactions: family.reactions.filter((e) => mechanism.reactionIds.includes(e.id)).map((e) => serializeReactionJSON(e, family)),
  };

  return JSON.stringify(jsonObject);
};
