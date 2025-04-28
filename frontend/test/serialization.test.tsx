import { describe, expect, it } from "vitest";
import {
  Family,
  Mechanism,
  Reaction,
  Species,
} from "../src/types/chemistryModels";
import {
  deserializeFamilyCAMPV1,
  serializeMechanismJSON,
  serializeMechanismMusicBox,
  serializeMechanismYAML,
} from "../src/helpers/serialization";

const species: Species = {
  id: "111-222-333-444-555",
  name: "Test Species",
  description: null,
  familyId: "",
  attributes: {
    weight: {
      name: "weight",
      serializationKey: "weight",
      value: 1e-2,
    },
    "density [kg m3]": {
      name: "Density",
      serializationKey: "density [kg m3]",
      value: 1e-2,
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
      speciesId: species.id,
      coefficient: 1,
    },
    {
      speciesId: "not-real-id",
      coefficient: 1,
    },
  ],
  products: [
    {
      speciesId: species.id,
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
      speciesId: species.id,
      coefficient: 1,
    },
  ],
  products: [
    {
      speciesId: species.id,
      coefficient: 1,
      branch: "alkoxy",
    },
    {
      speciesId: species.id,
      coefficient: 1,
      branch: "nitrate",
    },
  ],
  attributes: {},
};

const surfaceReaction: Reaction = {
  id: "55525-444-333-222-111",
  name: "",
  description: null,
  type: "SURFACE",
  reactants: [],
  products: [
    {
      speciesId: species.id,
      coefficient: 1,
      branch: "gas-phase",
    },
    {
      speciesId: species.id,
      coefficient: 1,
      branch: "notreal",
    },
  ],
  attributes: {},
};

const mechanism: Mechanism = {
  id: "",
  name: "Test Mechanism",
  description: null,
  phaseIds: [],
  familyId: "1234",
  speciesIds: [species.id],
  reactionIds: [reaction.id, branchedReaction.id, surfaceReaction.id],
};

const family: Family = {
  id: "1234",
  name: "Test Family",
  description: "",
  mechanisms: [],
  species: [species],
  reactions: [reaction, branchedReaction, surfaceReaction],
  phases: [],
  owner: null,
};

describe("Mechanism Serialization", () => {
  describe("JSON Serialization", () => {
    it("Gives a string", () => {
      const result = serializeMechanismJSON(mechanism, family);
      expect(typeof result).toBe("string");
      const reversedSerialization = deserializeFamilyCAMPV1(result);
      expect(typeof reversedSerialization).toBe("object");
    });
  });

  describe("YAML Serialization", () => {
    it("Gives a string", () => {
      const result = serializeMechanismYAML(mechanism, family);
      expect(typeof result).toBe("string");
      const reversedSerialization = deserializeFamilyCAMPV1(result);
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
