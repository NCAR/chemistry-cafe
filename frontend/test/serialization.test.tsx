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

// NOTE: SURFACE export is covered in "Reaction type serialization" below. It is
// kept out of these round-trip fixtures because import does not yet relink its
// gas-phase species (tracked in #238); the editor UI for it is #237.

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

// ── per-reaction-type serialization ──────────────────────────
// Each supported reaction type is exported through the musica adapter and its
// V1 wire shape asserted. SURFACE is intentionally absent (no adapter — #237).

const speciesA: Species = {
  id: "species-a",
  name: "A",
  description: null,
  familyId: "",
  attributes: {},
};
const speciesB: Species = {
  id: "species-b",
  name: "B",
  description: null,
  familyId: "",
  attributes: {},
};

/** Build a reaction attribute bag ({ [key]: { serializationKey, value } }). */
const attrs = (obj: Record<string, number | string>): Reaction["attributes"] =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, { serializationKey: k, value: v }]),
  );

/** Serialize a single reaction and return the parsed V1 reaction object. */
const serializeReaction = (reaction: Reaction): Record<string, any> => {
  const fam: Family = {
    id: "family",
    name: "Family",
    description: "",
    mechanisms: [],
    species: [speciesA, speciesB],
    reactions: [reaction],
    phases: [],
    owner: null,
  };
  const mech: Mechanism = {
    id: "mechanism",
    name: "Mechanism",
    description: null,
    familyId: "family",
    speciesIds: [speciesA.id, speciesB.id],
    reactionIds: [reaction.id],
    phaseIds: [],
  };
  const parsed = JSON.parse(serializeMechanismJSON(mech, fam));
  return parsed.reactions[0];
};

describe("Reaction type serialization", () => {
  it("ARRHENIUS", () => {
    const rx = serializeReaction({
      id: "r",
      name: "arr",
      description: null,
      type: "ARRHENIUS",
      attributes: attrs({ A: 1, B: 2, Ea: 3, D: 4, E: 5 }),
      reactants: [{ speciesId: speciesA.id, coefficient: 1 }],
      products: [{ speciesId: speciesB.id, coefficient: 2 }],
    });
    expect(rx.type).toBe("ARRHENIUS");
    expect(rx.A).toBe(1);
    expect(rx.B).toBe(2);
    expect(rx.Ea).toBe(3); // Ea present, so C omitted
    expect(rx.C).toBeUndefined();
    expect(rx.D).toBe(4);
    expect(rx.E).toBe(5);
    expect(rx.reactants[0].name).toBe("A");
    expect(rx.products[0]).toEqual({ name: "B", coefficient: 2 });
  });

  it("ARRHENIUS without Ea falls back to C", () => {
    const rx = serializeReaction({
      id: "r",
      name: "arr",
      description: null,
      type: "ARRHENIUS",
      attributes: attrs({ A: 1, C: 9 }),
      reactants: [{ speciesId: speciesA.id, coefficient: 1 }],
      products: [{ speciesId: speciesB.id, coefficient: 1 }],
    });
    expect(rx.C).toBe(9);
    expect(rx.Ea).toBeUndefined();
  });

  it("BRANCHED_NO_RO2", () => {
    const rx = serializeReaction({
      id: "r",
      name: "br",
      description: null,
      type: "BRANCHED_NO_RO2",
      attributes: attrs({ X: 1, Y: 2, a0: 3, n: 4 }),
      reactants: [{ speciesId: speciesA.id, coefficient: 1 }],
      products: [
        { speciesId: speciesB.id, coefficient: 1, branch: "nitrate" },
        { speciesId: speciesA.id, coefficient: 1, branch: "alkoxy" },
      ],
    });
    expect(rx.type).toBe("BRANCHED_NO_RO2");
    expect(rx.X).toBe(1);
    expect(rx.Y).toBe(2);
    expect(rx.a0).toBe(3);
    expect(rx.n).toBe(4);
    expect(rx["nitrate products"][0].name).toBe("B");
    expect(rx["alkoxy products"][0].name).toBe("A");
  });

  it("EMISSION", () => {
    const rx = serializeReaction({
      id: "r",
      name: "em",
      description: null,
      type: "EMISSION",
      attributes: attrs({ "scaling factor": 2.5 }),
      reactants: [],
      products: [{ speciesId: speciesA.id, coefficient: 1 }],
    });
    expect(rx.type).toBe("EMISSION");
    expect(rx["scaling factor"]).toBe(2.5);
    expect(rx.products[0].name).toBe("A");
  });

  it("PHOTOLYSIS", () => {
    const rx = serializeReaction({
      id: "r",
      name: "photo",
      description: null,
      type: "PHOTOLYSIS",
      attributes: attrs({ "scaling factor": 3 }),
      reactants: [{ speciesId: speciesA.id, coefficient: 1 }],
      products: [{ speciesId: speciesB.id, coefficient: 1 }],
    });
    expect(rx.type).toBe("PHOTOLYSIS");
    expect(rx["scaling factor"]).toBe(3);
    expect(rx.reactants[0].name).toBe("A");
    expect(rx.products[0].name).toBe("B");
  });

  it("FIRST_ORDER_LOSS", () => {
    const rx = serializeReaction({
      id: "r",
      name: "fol",
      description: null,
      type: "FIRST_ORDER_LOSS",
      attributes: attrs({ "scaling factor": 1.5 }),
      reactants: [{ speciesId: speciesA.id, coefficient: 1 }],
      products: [],
    });
    expect(rx.type).toBe("FIRST_ORDER_LOSS");
    expect(rx["scaling factor"]).toBe(1.5);
    expect(rx.reactants[0].name).toBe("A");
    // no products supplied → key omitted
    expect(rx.products).toBeUndefined();
  });

  it("TROE", () => {
    const rx = serializeReaction({
      id: "r",
      name: "troe",
      description: null,
      type: "TROE",
      attributes: attrs({
        k0_A: 1,
        k0_B: 2,
        k0_C: 3,
        kinf_A: 4,
        kinf_B: 5,
        kinf_C: 6,
        Fc: 0.5,
        N: 1,
      }),
      reactants: [{ speciesId: speciesA.id, coefficient: 1 }],
      products: [{ speciesId: speciesB.id, coefficient: 1 }],
    });
    expect(rx.type).toBe("TROE");
    expect(rx.k0_A).toBe(1);
    expect(rx.k0_C).toBe(3);
    expect(rx.kinf_A).toBe(4);
    expect(rx.Fc).toBe(0.5);
    expect(rx.N).toBe(1);
  });

  it("TUNNELING", () => {
    const rx = serializeReaction({
      id: "r",
      name: "tun",
      description: null,
      type: "TUNNELING",
      attributes: attrs({ A: 1, B: 2, C: 3 }),
      reactants: [{ speciesId: speciesA.id, coefficient: 1 }],
      products: [{ speciesId: speciesB.id, coefficient: 1 }],
    });
    expect(rx.type).toBe("TUNNELING");
    expect(rx.A).toBe(1);
    expect(rx.B).toBe(2);
    expect(rx.C).toBe(3);
  });

  it("SURFACE", () => {
    const rx = serializeReaction({
      id: "r",
      name: "surf",
      description: null,
      type: "SURFACE",
      attributes: attrs({ "reaction probability": 0.5 }),
      gasPhaseSpeciesId: speciesA.id,
      reactants: [],
      products: [{ speciesId: speciesB.id, coefficient: 2, branch: "gas-phase" }],
    });
    expect(rx.type).toBe("SURFACE");
    expect(rx["reaction probability"]).toBe(0.5);
    // single gas-phase species resolves to its name
    expect(rx["gas-phase species"]).toBe("A");
    expect(rx["gas-phase products"][0]).toEqual({ name: "B", coefficient: 2 });
  });
});
