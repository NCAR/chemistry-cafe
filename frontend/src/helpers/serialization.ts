import { Family, Mechanism, Reaction, Species } from "../types/chemistryModels";
import { serializeMechanism, deserializeMechanism } from "./musicaAdapter";
import * as YAML from "yaml";
import JSZip from "jszip";

// V1 mechanism-configuration serialization is owned by @ncar/musica via the
// adapter (musicaAdapter.ts). This module only handles file-level concerns:
// parsing/formatting (JSON & YAML) and the separate MusicBox/CAMP-V0 export.

const supportedV1Versions = ["1.0.0"];

/**
 * Converts a given mechanism to a serialized JSON string which uses the V1 schema
 * @param mechanism Mechanism to serialize
 * @param family Family mechanism is in
 * @returns Serialized Mechanism
 */
export const serializeMechanismJSON = (
  mechanism: Mechanism,
  family: Family,
): string => JSON.stringify(serializeMechanism(mechanism, family), null, 2);

/**
 * Converts a given mechanism to a serialized YAML string which uses the V1 schema
 * @param mechanism Mechanism to serialize
 * @param family Family mechanism is in
 * @returns Serialized Mechanism
 */
export const serializeMechanismYAML = (
  mechanism: Mechanism,
  family: Family,
): string => YAML.stringify(serializeMechanism(mechanism, family));

/**
 * Takes a V1 mechanism string in either JSON or YAML and creates a new Family
 * with one mechanism's worth of data based on the file.
 * @throws Parsing errors
 */
export const deserializeV1Mechanism = (fileText: string): Family | null => {
  // YAML.parse also accepts JSON, so it covers both file formats.
  const parsed = YAML.parse(fileText);
  if (parsed?.version && !supportedV1Versions.includes(parsed.version)) {
    console.warn(
      `Errors may occur due to an unsupported V1 mechanism version: ${parsed.version}`,
    );
  }
  return deserializeMechanism(parsed);
};

/////////////////////////////////
// V0 CONFIGURATION (CAMP) //
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

    if (reaction.type == "FIRST_ORDER_LOSS") {
      serializedReaction.__species = species.name;
    }
  }

  for (const { speciesId, coefficient } of reaction.products) {
    const species = family.species.find((e) => e.id === speciesId);
    if (!species) {
      continue;
    }
    serializedReaction.products[species.name] = {
      yield: coefficient,
    };

    if (reaction.type == "EMISSION") {
      serializedReaction.__species = species.name;
    }
  }

  // Edge Cases
  if (reaction.type == "FIRST_ORDER_LOSS" || reaction.type == "EMISSION") {
    serializedReaction.type = "PHOTOLYSIS";
    serializedReaction.__music_box_type = reaction.type;
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
