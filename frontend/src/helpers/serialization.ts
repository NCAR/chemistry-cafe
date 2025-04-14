import { Family, Mechanism, Reaction, Species } from "../types/chemistryModels";
import * as YAML from "yaml";
import JSZip from "jszip";

//////////////////////
// V1 CONFIGURATION //
//////////////////////

/**
 * Converts a species to the CAMP V1 format
 */
const speciesToCAMPV1 = (species: Species): Object => {
  let serializedSpecies: any = {
    name: species.name,
  };

  for (const key of Object.keys(species.attributes)) {
    serializedSpecies[key] = species.attributes[key].value;
  }

  return serializedSpecies;
};

const reactionToCAMPV1 = (reaction: Reaction, family: Family): Object => {
  let serializedReaction: any = {
    name: reaction.name,
    type: reaction.type,
    "gas phase": "gas",
    reactants: [],
    products: [],
  };

  for (const { speciesId, coefficient } of reaction.reactants) {
    const species = family.species.find((e) => e.id === speciesId);
    if (!species) {
      continue;
    }
    serializedReaction.reactants.push({
      "species name": species.name,
      coefficient: coefficient,
    });
  }

  for (const { speciesId, coefficient } of reaction.products) {
    const species = family.species.find((e) => e.id === speciesId);
    if (!species) {
      continue;
    }
    serializedReaction.products.push({
      "species name": species.name,
      coefficient: coefficient,
    });
  }

  for (const key of Object.keys(reaction.attributes)) {
    serializedReaction[key] = reaction.attributes[key].value;
  }

  return serializedReaction;
};

/**
 * Stub of serialization of mechanism
 * @param mechanism
 * @param family
 * @returns
 */
const mechanismToCAMPV1 = (mechanism: Mechanism, family: Family): Object => {
  const jsonObject = {
    version: "1.0.0",
    name: mechanism.name,
    species: family.species
      .filter((e) => mechanism.speciesIds.includes(e.id))
      .map((e) => speciesToCAMPV1(e)),
    phases: [
      {
        name: "gas",
        species: family.species
          .filter((e) => mechanism.speciesIds.includes(e.id))
          .map((e) => e.name),
      },
    ],
    reactions: family.reactions
      .filter((e) => mechanism.reactionIds.includes(e.id))
      .map((e) => reactionToCAMPV1(e, family)),
  };

  return jsonObject;
};

/**
 * Converts a given mechanism to a serialized JSON string which uses the CAMP V1 schema
 * @param mechanism Mechanism to serialize
 * @param family Family mechanism is in
 * @returns Serialized Mechanism
 */
export const serializeMechanismJSON = (
  mechanism: Mechanism,
  family: Family,
): string => {
  return JSON.stringify(mechanismToCAMPV1(mechanism, family), null, 2);
};

/**
 * Converts a given mechanism to a serialized YAML string which uses the CAMP V1 schema
 * @param mechanism Mechanism to serialize
 * @param family Family mechanism is in
 * @returns Serialized Mechanism
 */
export const serializeMechanismYAML = (
  mechanism: Mechanism,
  family: Family,
): string => {
  return YAML.stringify(mechanismToCAMPV1(mechanism, family), null, 2);
};

/////////////////////////////////
// V0 CONFIGURATION (MusicBox) //
/////////////////////////////////

const reactionToCAMPV0 = (reaction: Reaction, family: Family): Object => {
  let serializedReaction: any = {
    type: reaction.type,
    "gas phase": "gas",
    reactants: {},
    products: {},
  };

  for (const { speciesId, coefficient } of reaction.reactants) {
    const species = family.species.find((e) => e.id === speciesId);
    if (!species) {
      continue;
    }
    serializedReaction.reactants[species.name] = {
      qty: coefficient,
    };
  }

  for (const { speciesId, coefficient } of reaction.products) {
    const species = family.species.find((e) => e.id === speciesId);
    if (!species) {
      continue;
    }
    serializedReaction.products[species.name] = {
      yield: coefficient,
    };
  }

  for (const key of Object.keys(reaction.attributes)) {
    serializedReaction[key] = reaction.attributes[key].value;
  }

  return serializedReaction;
};

const speciesToCAMPV0 = (species: Species): Object => {
  let serializedSpecies: any = {
    "initial value [mol m-3]": 1.0e-9,
  };

  for (const key of Object.keys(species.attributes)) {
    serializedSpecies[key] = species.attributes[key].value;
  }

  return serializedSpecies;
};

const createReactionsDataCAMPV0 = (
  mechanism: Mechanism,
  family: Family,
): Object => {
  return {
    "camp-data": [
      {
        type: "MECHANISM",
        name: mechanism.name,
        reactions: family.reactions
          .filter((e) => mechanism.reactionIds.includes(e.id))
          .map((e) => reactionToCAMPV0(e, family)),
      },
    ],
  };
};

const createSpeciesDataCAMPV0 = (
  mechanism: Mechanism,
  family: Family,
): Object => {
  return {
    "camp-data": family.species
      .filter((e) => mechanism.speciesIds.includes(e.id))
      .map((e) => ({ name: e.name, type: "CHEM_SPEC" })),
  };
};

export const serializeMechanismMusicBox = async (
  mechanism: Mechanism,
  family: Family,
): Promise<Blob> => {
  // ./camp_data/config.json
  const config = {
    "camp-files": ["species.json", "reactions.json"],
  };

  // ./my_config.json
  const my_config: any = {
    "box model options": {
      grid: "box",
      "chemistry time step [sec]": 1,
      "output time step [sec]": 1,
      "simulation length [hr]": 1,
    },
    "chemical species": {},
    // Begin hard coded values
    "environmental conditions": {
      temperature: {
        "initial value [K]": 298.15,
      },
      pressure: {
        "initial value [Pa]": 101325.0,
      },
    },
    "evolving conditions": {},
    "initial conditions": {},
    "model components": [
      {
        type: "CAMP",
        "configuration file": "camp_data/config.json",
        "override species": {
          M: {
            "mixing ratio mol mol-1": 1.0,
          },
        },
        "suppress output": {
          M: {},
        },
      },
    ],
  };

  for (const species of family.species.filter((e) =>
    mechanism.speciesIds.includes(e.id),
  )) {
    my_config["chemical species"][species.name] = speciesToCAMPV0(species);
  }

  // ./camp_data/reactions.json
  const reactions = createReactionsDataCAMPV0(mechanism, family);

  // ./camp_data/species.json
  const species = createSpeciesDataCAMPV0(mechanism, family);

  const zip = new JSZip();
  zip.file("my_config.json", JSON.stringify(my_config, null, 2));
  const campData = zip.folder("camp_data");
  campData?.file("config.json", JSON.stringify(config, null, 2));
  campData?.file("reactions.json", JSON.stringify(reactions, null, 2));
  campData?.file("species.json", JSON.stringify(species, null, 2));

  return zip.generateAsync({ type: "blob" });
};
