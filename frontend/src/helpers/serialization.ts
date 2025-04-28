import {
  Family,
  Mechanism,
  Phase,
  Reactant,
  Reaction,
  reactionConfigurations,
  ReactionSpeciesCount,
  ReactionTypeName,
  Species,
  supportedReactionTypes,
} from "../types/chemistryModels";
import * as YAML from "yaml";
import JSZip from "jszip";
import { generateFrontendID } from "./localFamilies";

//////////////////////
// V1 CONFIGURATION //
//////////////////////

type campV1Versions = "1.0.0";
const supportedV1Versions: Array<campV1Versions> = ["1.0.0"];

type serializedCampV1Species = {
  [key: string]: number | string;
  name: string;
};

type serializedCampV1Phase = {
  name: string;
  species: Array<string>;
};

type serializedCampV1Reaction = {
  [key: string]: number | string | undefined | Array<any>;
  name?: string;
  type: string;
  "gas phase"?: string;
  "gas-phase species"?: string;
  "aerosol phase"?: string;
  "aerosol-phase species"?: string;
  "aerosol-phase water"?: string;
  reactants?: Array<{
    "species name": string;
    coefficient: number;
  }>;
  products?: Array<{
    "species name": string;
    coefficient: number;
  }>;
  "gas-phase products"?: Array<{
    "species name": string;
    coefficient: number;
  }>;
  "alkoxy products"?: Array<{
    "species name": string;
    coefficient: number;
  }>;
  "nitrate products"?: Array<{
    "species name": string;
    coefficient: number;
  }>;
};

type serializedCampV1Mechanism = {
  version: campV1Versions;
  name: string;
  species: Array<serializedCampV1Species>;
  phases: Array<serializedCampV1Phase>;
  reactions: Array<serializedCampV1Reaction>;
};

/**
 * Converts a species to the CAMP V1 format
 */
const speciesToCAMPV1 = (species: Species): serializedCampV1Species => {
  let serializedSpecies: serializedCampV1Species = {
    name: species.name,
  };

  for (const key of Object.keys(species.attributes)) {
    serializedSpecies[key] = species.attributes[key].value;
  }

  return serializedSpecies;
};

const reactionToCAMPV1 = (
  reaction: Reaction,
  family: Family,
): serializedCampV1Reaction => {
  const serializedReaction: serializedCampV1Reaction = {
    name: reaction.name,
    type: reaction.type,
    products: [],
  };

  const reactionConfiguration = reactionConfigurations[reaction.type];

  // TODO Add other configuration attributes
  if (reactionConfiguration.hasGasPhase) {
    serializedReaction["gas phase"] = "gas";
  }

  if (reactionConfiguration.reactantCount != ReactionSpeciesCount.NONE) {
    serializedReaction.reactants = [];
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
  }

  if (reactionConfiguration.productCount != ReactionSpeciesCount.NONE) {
    if (reactionConfiguration.branches) {
      for (const branch of reactionConfiguration.branches) {
        serializedReaction[`${branch} products`] = [];
      }
    } else {
      serializedReaction.products = [];
    }

    for (const { speciesId, coefficient, branch } of reaction.products) {
      const species = family.species.find((e) => e.id === speciesId);
      if (!species) {
        continue;
      }

      if (reactionConfiguration.branches) {
        switch (branch) {
          case "alkoxy":
            serializedReaction["alkoxy products"]?.push({
              "species name": species.name,
              coefficient: coefficient,
            });
            break;
          case "nitrate":
            serializedReaction["nitrate products"]?.push({
              "species name": species.name,
              coefficient: coefficient,
            });
            break;
          case "gas-phase":
            serializedReaction["gas-phase products"]?.push({
              "species name": species.name,
              coefficient: coefficient,
            });
            break;
          default:
            console.warn("Skipping product with invalid branch name: ", branch);
            break;
        }
      } else {
        serializedReaction.products?.push({
          "species name": species.name,
          coefficient: coefficient,
        });
      }
    }
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
  const jsonObject: serializedCampV1Mechanism = {
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

/**
 * Takes a camp V1 string in either JSON or YAML and creates a new family
 * @throws Parsing errors
 */
export const deserializeFamilyCAMPV1 = (fileText: string): Family | null => {
  const parsedMechanism: Partial<serializedCampV1Mechanism> =
    YAML.parse(fileText);

  if (!supportedV1Versions.find((e) => e == parsedMechanism.version)) {
    console.warn(
      `Errors may occur due to an unsupported CAMP V1 version: ${parsedMechanism.version}`,
    );
  }

  if (
    !Array.isArray(parsedMechanism.species) ||
    !Array.isArray(parsedMechanism.phases) ||
    !Array.isArray(parsedMechanism.reactions)
  ) {
    throw new Error(
      "Mechanism is missing 'species', 'phases', or 'reactions' arrays",
    );
  }

  const createdFamily: Family = {
    id: generateFrontendID(),
    name: parsedMechanism.name || "New Family",
    description: "This family was automatically generated from a file",
    owner: null,
    mechanisms: [],
    species: [],
    reactions: [],
    phases: [],
  };

  const speciesIdMappings = new Map<string, string>();
  const phaseIdMappings = new Map<string, string>();

  for (const species of parsedMechanism.species) {
    const id = generateFrontendID();
    speciesIdMappings.set(species.name, id);

    const createdSpecies: Species = {
      id: id,
      name: species.name,
      description: null,
      familyId: createdFamily.id,
      attributes: {},
    };

    for (const [key, value] of Object.entries(species)) {
      if (
        (typeof value !== "number" && typeof value !== "string") ||
        key === "name"
      ) {
        continue;
      }

      createdSpecies.attributes[key] = {
        serializationKey: key,
        value: value,
      };
    }

    createdFamily.species.push(createdSpecies);
  }

  for (const phase of parsedMechanism.phases) {
    const id = generateFrontendID();
    phaseIdMappings.set(phase.name, id);

    const createdPhase: Phase = {
      id: id,
      name: phase.name,
      description: null,
      speciesIds: phase.species
        .map((e) => speciesIdMappings.get(e))
        .filter((e) => e != undefined),
    };

    createdFamily.phases.push(createdPhase);
  }

  for (const reaction of parsedMechanism.reactions) {
    const id = generateFrontendID();

    if (!supportedReactionTypes.find((e) => e == reaction.type)) {
      console.warn(`Possibly unsupported reaction type: ${reaction.type}`);
    }

    const createdReaction: Reaction = {
      id: id,
      name: reaction.name || "",
      description: null,
      type: reaction.type as ReactionTypeName,
      reactants:
        reaction.reactants?.reduce((accumulator: Reactant[], reactant) => {
          const speciesId = speciesIdMappings.get(reactant["species name"]);
          if (!speciesId) {
            return accumulator;
          }
          accumulator.push({
            speciesId: speciesId,
            coefficient: reactant.coefficient,
          });
          return accumulator;
        }, []) || [],
      products:
        reaction.products?.reduce((accumulator: Reactant[], reactant) => {
          const speciesId = speciesIdMappings.get(reactant["species name"]);
          if (!speciesId) {
            return accumulator;
          }
          accumulator.push({
            speciesId: speciesId,
            coefficient: reactant.coefficient,
          });
          return accumulator;
        }, []) || [],
      attributes: {},
    };

    // Branches that *may* exists in a reaction
    const productBranches = ["gas-phase", "alkoxy", "nitrate"];

    for (const branch of productBranches) {
      const products = reaction[`${branch} products`];
      if (!Array.isArray(products)) {
        continue;
      }

      for (const product of products) {
        const speciesId = speciesIdMappings.get(product["species name"]);
        if (!speciesId) {
          return product;
        }

        createdReaction.products.push({
          speciesId: speciesId,
          coefficient: product.coefficient,
          branch: branch,
        });
      }
    }

    // Keys to not put in attributes
    const skipKeys: Array<keyof serializedCampV1Reaction> = [
      "name",
      "gas phase",
      "gas-phase species",
      "aerosol phase",
      "aerosol-phase species",
      "aerosol-phase water",
      "reactants",
      "products",
    ];

    for (const [key, value] of Object.entries(reaction)) {
      if (
        (typeof value !== "number" && typeof value !== "string") ||
        skipKeys.find((e) => e == key)
      ) {
        continue;
      }

      createdReaction.attributes[key] = {
        serializationKey: key,
        value: value,
      };
    }

    createdFamily.reactions.push(createdReaction);
  }

  const createdMechanism: Mechanism = {
    id: generateFrontendID(),
    name: parsedMechanism.name || "New Mechanism",
    description: "This mechanism was automatically generated from a file",
    familyId: createdFamily.id,
    speciesIds: createdFamily.species.map((e) => e.id),
    reactionIds: createdFamily.reactions.map((e) => e.id),
    phaseIds: createdFamily.phases.map((e) => e.id),
  };

  createdFamily.mechanisms.push(createdMechanism);
  return createdFamily;
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
  } else if (reaction.type == "CONDENSED_PHASE_ARRHENIUS") {
    serializedReaction.type = "ARRHENIUS";
  } else if (reaction.type == "CONDENSED_PHASE_PHOTOLYSIS") {
    serializedReaction.type = "PHOTOLYSIS";
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
