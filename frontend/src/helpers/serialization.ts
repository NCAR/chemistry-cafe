import { Family, Mechanism, Reaction, Species } from "../types/chemistryModels";
import { serializeMechanism, deserializeMechanism } from "./musicaAdapter";
import { initModule, mechanismConfiguration } from "@ncar/musica";
import * as YAML from "yaml";
import JSZip from "jszip";

// V1 mechanism-configuration parsing and serialization are owned by @ncar/musica
// via the adapter (musicaAdapter.ts). This module only handles file-level
// concerns: formatting (JSON & YAML) and the separate MusicBox/CAMP-V0 export.

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
  metadata?: Record<string, unknown>,
): string => {
  const result = serializeMechanism(mechanism, family) as Record<string, unknown>;
  if (metadata) {
    result.verification = metadata;
  }
  return JSON.stringify(result, null, 2);
};

/**
 * Converts a given mechanism to a serialized YAML string which uses the V1 schema
 * @param mechanism Mechanism to serialize
 * @param family Family mechanism is in
 * @returns Serialized Mechanism
 */
export const serializeMechanismYAML = (
  mechanism: Mechanism,
  family: Family,
  metadata?: Record<string, unknown>,
): string => {
  const result = serializeMechanism(mechanism, family) as Record<string, unknown>;
  if (metadata) {
    result.verification = metadata;
  }
  return YAML.stringify(result);
};

/**
 * Takes a V1 mechanism string in either JSON or YAML and creates a new Family
 * with one mechanism's worth of data based on the file.
 * @throws Parsing and validation errors from the musica parser
 */
export const deserializeV1Mechanism = async (
  fileText: string,
): Promise<Family | null> => {
  // The musica parser validates the file and accepts JSON or YAML.
  await initModule();
  const { mechanism, errors } =
    mechanismConfiguration.parseMechanismFromString(fileText);
  if (errors.length > 0 || !mechanism) {
    throw new Error(errors.map((error) => error.message).join("\n"));
  }
  const parsed = mechanism as {
    version?: string;
  } & Record<string, unknown>;
  if (parsed?.version && !supportedV1Versions.includes(parsed.version)) {
    console.warn(
      `Errors may occur due to an unsupported V1 mechanism version: ${parsed.version}`,
    );
  }
  return deserializeMechanism(parsed);
};

/** A problem that the parser found in an imported configuration. */
export type ImportError = mechanismConfiguration.ParseError;

/** The result of an import. */
export type ImportResult = {
  /**
   * The imported family. It is null when the parser cannot read the
   * configuration. When there are errors, the family does not have the items
   * that the parser left out.
   */
  family: Family | null;
  /** The problems in the configuration. */
  errors: Array<ImportError>;
  /**
   * The species names that the configuration uses but does not define. The
   * import adds a species for each one.
   */
  addedSpecies: Array<string>;
};

/** Files that an archive program adds, which are not part of a configuration. */
const isArchiveMetadata = (path: string): boolean =>
  path.startsWith("__MACOSX/") || path.split("/").pop() === ".DS_Store";

/**
 * Reads the uploaded files into a map of path to contents. A .zip file gives
 * each file in it, with its path in the archive.
 */
export const readUploadedFiles = async (
  files: Array<File>,
): Promise<Record<string, string>> => {
  const contents: Record<string, string> = {};
  for (const file of files) {
    if (!file.name.toLowerCase().endsWith(".zip")) {
      contents[file.name] = await file.text();
      continue;
    }
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    for (const entry of Object.values(zip.files)) {
      if (entry.dir || isArchiveMetadata(entry.name)) continue;
      contents[entry.name] = await entry.async("string");
    }
  }
  return contents;
};

/**
 * Finds the entry point of a configuration: the one file with a top-level
 * `version` key (v1) or `camp-files` key (v0).
 * @throws if no file or more than one file has one of these keys
 */
export const findEntryPoint = (files: Record<string, string>): string => {
  const entryPoints = Object.keys(files).filter((path) => {
    try {
      const document = YAML.parse(files[path]);
      return (
        typeof document === "object" &&
        document !== null &&
        ("version" in document || "camp-files" in document)
      );
    } catch {
      return false;
    }
  });
  if (entryPoints.length === 0) {
    throw new Error(
      "No file has a 'version' or 'camp-files' key, so the configuration has no entry point.",
    );
  }
  if (entryPoints.length > 1) {
    throw new Error(
      `More than one file has a 'version' or 'camp-files' key: ${entryPoints.join(", ")}. Upload one configuration at a time.`,
    );
  }
  return entryPoints[0];
};

/**
 * Imports a mechanism configuration from uploaded files: one JSON or YAML
 * file, the files of a configuration, or a .zip file. The configuration can
 * be v1 or v0. The parser builds as much of the mechanism as it can, and the
 * result lists the problems that it found.
 * @throws if the files have no entry point, or more than one
 */
export const importMechanismFiles = async (
  files: Array<File>,
): Promise<ImportResult> => {
  const contents = await readUploadedFiles(files);
  const entryPoint = findEntryPoint(contents);
  await initModule();
  const { mechanism, errors } = mechanismConfiguration.parseMechanismFromFiles(
    contents,
    entryPoint,
  );
  if (!mechanism) {
    return { family: null, errors, addedSpecies: [] };
  }
  const parsed = mechanism as {
    version?: string;
    species?: Array<{ name: string }>;
  } & Record<string, unknown>;
  // The family does not keep the version. The export always writes v1, so a
  // v0 configuration becomes v1.
  if (
    parsed.version &&
    !parsed.version.startsWith("0.") &&
    !supportedV1Versions.includes(parsed.version)
  ) {
    console.warn(
      `Errors may occur due to an unsupported V1 mechanism version: ${parsed.version}`,
    );
  }
  const family = deserializeMechanism(parsed);
  const defined = new Set((parsed.species ?? []).map((s) => s.name));
  return {
    family,
    errors,
    addedSpecies: family.species
      .map((s) => s.name)
      .filter((name) => !defined.has(name)),
  };
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

const speciesToCAMPV0 = (_species: Species): Object => {
  return {
    "initial value [mol m-3]": 1.0e-9,
  };
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
