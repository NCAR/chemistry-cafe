import { describe, expect, it } from "vitest";
import {
  Family,
  Mechanism,
  Reaction,
  Species,
} from "../src/types/chemistryModels";
import {
  deserializeV1Mechanism,
  serializeMechanismJSON,
  serializeMechanismMusicBox,
  serializeMechanismYAML,
} from "../src/helpers/serialization";

const mixingRatioSpecies: Species = {
  id: "species-mixing-ratio",
  name: "Mixing Ratio Species",
  description: null,
  familyId: "",
  attributes: {
    "constant mixing ratio [mol mol-1]": {
      name: "Constant Mixing Ratio",
      serializationKey: "constant mixing ratio [mol mol-1]",
      value: 1e-2,
    },
  },
};

const thirdBodySpecies: Species = {
  id: "species-third-body",
  name: "Third Body Species",
  description: null,
  familyId: "",
  attributes: {
    "is third body": {
      name: "Is third body?",
      serializationKey: "is third body",
      value: "true",
    },
  },
};

const molecularWeightSpecies: Species = {
  id: "species-molecular-weight",
  name: "Molecular Weight Species",
  description: null,
  familyId: "",
  attributes: {
    "molecular weight [kg mol-1]": {
      name: "Molecular Weight",
      serializationKey: "molecular weight [kg mol-1]",
      value: 1e-2,
    },
  },
};

const plainSpecies: Species = {
  id: "species-plain",
  name: "Plain Species",
  description: null,
  familyId: "",
  attributes: {},
};

const absoluteToleranceSpecies: Species = {
  id: "species-absolute-tolerance",
  name: "Absolute Tolerance Species",
  description: null,
  familyId: "",
  attributes: {
    "absolute tolerance": {
      name: "Absolute Tolerance",
      serializationKey: "absolute tolerance",
      value: 1e-9,
    },
  },
};

const reaction: Reaction = {
  id: "111-222-333-444-555",
  name: "Test Reaction",
  description: null,
  type: "PHOTOLYSIS",
  reactants: [
    {
      speciesId: mixingRatioSpecies.id,
      coefficient: 1,
    },
    {
      speciesId: absoluteToleranceSpecies.id,
      coefficient: 1,
    },
    {
      speciesId: "not-real-id",
      coefficient: 1,
    },
  ],
  products: [
    {
      speciesId: thirdBodySpecies.id,
      coefficient: 1,
    },
    {
      speciesId: "not-real-id",
      coefficient: 1,
    },
  ],
  attributes: {
    "attribute [mol]": {
      name: "Attribute",
      value: 1.0,
      serializationKey: "attribute [mol]",
    },
    "another attribute": {
      name: "another attribute",
      serializationKey: "another attribute",
      value: 1.0,
    },
  },
};

const branchedReaction: Reaction = {
  id: "555-444-333-222-111",
  name: "",
  description: null,
  type: "BRANCHED_NO_RO2",
  reactants: [
    {
      speciesId: molecularWeightSpecies.id,
      coefficient: 1,
    },
  ],
  products: [
    {
      speciesId: plainSpecies.id,
      coefficient: 1,
      branch: "alkoxy",
    },
    {
      speciesId: molecularWeightSpecies.id,
      coefficient: 1,
      branch: "nitrate",
    },
  ],
  attributes: {},
};

// NOTE: SURFACE is not yet exportable via the musica adapter (tracked in #237),
// so it is intentionally excluded from these round-trip fixtures.

const allSpecies = [
  mixingRatioSpecies,
  thirdBodySpecies,
  molecularWeightSpecies,
  plainSpecies,
  absoluteToleranceSpecies,
];

const mechanism: Mechanism = {
  id: "",
  name: "Test Mechanism",
  description: null,
  phaseIds: [],
  familyId: "1234",
  speciesIds: allSpecies.map((s) => s.id),
  reactionIds: [reaction.id, branchedReaction.id],
};

const family: Family = {
  id: "1234",
  name: "Test Family",
  description: "",
  mechanisms: [],
  species: allSpecies,
  reactions: [reaction, branchedReaction],
  phases: [],
  owner: null,
};

describe("Mechanism Serialization", () => {
  describe("JSON Serialization", () => {
    it("Gives a string", () => {
      const result = serializeMechanismJSON(mechanism, family);
      expect(typeof result).toBe("string");
      const reversedSerialization = deserializeV1Mechanism(result);
      expect(typeof reversedSerialization).toBe("object");
    });
  });

  describe("YAML Serialization", () => {
    it("Gives a string", () => {
      const result = serializeMechanismYAML(mechanism, family);
      expect(typeof result).toBe("string");
      const reversedSerialization = deserializeV1Mechanism(result);
      expect(typeof reversedSerialization).toBe("object");
    });
  });

  describe("V0 Serialization", () => {
    it("Gives a resulting blob object", () => {
      const result = serializeMechanismMusicBox(mechanism, family);
      expect(typeof result).toBe("object");
    });
  });
});
