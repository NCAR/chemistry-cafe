import { describe, expect, it } from "vitest";
import {
  Family,
  Mechanism,
  Reaction,
  Species,
} from "../src/types/chemistryModels";
import {
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
      value: 1e-2,
    },
    "density [kg m3]": {
      name: "Density",
      serializedKey: "density [kg m3]",
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
      serializedKey: "attribute [mol]",
    },
    "another attribute": {
      name: "another attribute",
      value: 1.0,
    },
  },
};

const mechanism: Mechanism = {
  name: "Test Mechanism",
  description: null,
  phases: [],
  familyId: "1234",
  speciesIds: [species.id],
  reactionIds: [reaction.id],
};

const family: Family = {
  id: "1234",
  name: "Test Family",
  description: "",
  mechanisms: [],
  species: [species],
  reactions: [reaction],
};

describe("Mechanism Serialization", () => {
  describe("JSON Serialization", () => {
    it("Gives a string", () => {
      const result = serializeMechanismJSON(mechanism, family);
      expect(typeof result).toBe("string");
    });
  });

  describe("YAML Serialization", () => {
    it("Gives a string", () => {
      const result = serializeMechanismYAML(mechanism, family);
      expect(typeof result).toBe("string");
    });
  });

  describe("V0 Serialization", () => {
    it("Gives a resulting blob object", () => {
      const result = serializeMechanismMusicBox(mechanism, family);
      expect(typeof result).toBe("object");
    });
  });
});
