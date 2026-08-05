import { describe, expect, it } from "vitest";
import {
  Family,
  Mechanism,
  Phase,
  Reaction,
  Species,
} from "../src/types/chemistryModels";
import {
  deserializeV1Mechanism,
  serializeMechanismJSON,
  serializeMechanismMusicBox,
  serializeMechanismYAML,
} from "../src/helpers/serialization";

/** Build a reaction/attribute bag ({ [key]: { serializationKey, value } }). */
const attrs = (obj: Record<string, number | string>): Reaction["attributes"] =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, { serializationKey: k, value: v }]),
  );

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

const plainSpecies: Species = {
  id: "species-plain",
  name: "Plain Species",
  description: null,
  familyId: "",
  attributes: {},
};

const species = [
  molecularWeightSpecies,
  mixingRatioSpecies,
  thirdBodySpecies,
  absoluteToleranceSpecies,
  plainSpecies,
];

// common reactant/product picks, for readable reaction definitions
const reactant = molecularWeightSpecies;
const product = plainSpecies;

// ── phases ───────────────────────────────────────────────────
const gasPhase: Phase = {
  id: "phase-gas",
  name: "gas",
  description: null,
  speciesIds: species.map((s) => s.id),
};

const aerosolPhase: Phase = {
  id: "phase-aerosol",
  name: "aerosol",
  description: null,
  speciesIds: [molecularWeightSpecies.id, plainSpecies.id],
};

// present in the family but NOT referenced by the mechanism (filtering case)
const unreferencedPhase: Phase = {
  id: "phase-unreferenced",
  name: "unreferenced",
  description: null,
  speciesIds: [plainSpecies.id],
};

// ── reactions (one per supported type) ───────────────────────
const arrheniusReaction: Reaction = {
  id: "reaction-arrhenius",
  name: "arrhenius",
  description: null,
  type: "ARRHENIUS",
  gasPhaseId: gasPhase.id,
  attributes: attrs({ A: 1, B: 2, Ea: 3, D: 4, E: 5 }),
  reactants: [{ speciesId: reactant.id, coefficient: 1 }],
  products: [{ speciesId: product.id, coefficient: 2 }],
};

const branchedReaction: Reaction = {
  id: "reaction-branched",
  name: "branched",
  description: null,
  type: "BRANCHED_NO_RO2",
  gasPhaseId: gasPhase.id,
  attributes: attrs({ X: 1, Y: 2, a0: 3, n: 4 }),
  reactants: [{ speciesId: reactant.id, coefficient: 1 }],
  products: [
    { speciesId: product.id, coefficient: 1, branch: "alkoxy" },
    { speciesId: reactant.id, coefficient: 1, branch: "nitrate" },
  ],
};

const emissionReaction: Reaction = {
  id: "reaction-emission",
  name: "emission",
  description: null,
  type: "EMISSION",
  gasPhaseId: gasPhase.id,
  attributes: attrs({ "scaling factor": 2.5 }),
  reactants: [],
  products: [{ speciesId: product.id, coefficient: 1 }],
};

const photolysisReaction: Reaction = {
  id: "reaction-photolysis",
  name: "photolysis",
  description: null,
  type: "PHOTOLYSIS",
  gasPhaseId: gasPhase.id,
  attributes: attrs({ "scaling factor": 3 }),
  reactants: [{ speciesId: reactant.id, coefficient: 1 }],
  products: [{ speciesId: product.id, coefficient: 1 }],
};

const firstOrderLossReaction: Reaction = {
  id: "reaction-first-order-loss",
  name: "first order loss",
  description: null,
  type: "FIRST_ORDER_LOSS",
  gasPhaseId: gasPhase.id,
  attributes: attrs({ "scaling factor": 1.5 }),
  reactants: [{ speciesId: reactant.id, coefficient: 1 }],
  products: [],
};

// no gas phase — exercises the "gas phase omitted" case
const troeReaction: Reaction = {
  id: "reaction-troe",
  name: "troe",
  description: null,
  type: "TROE",
  gasPhaseId: gasPhase.id,
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
  reactants: [{ speciesId: reactant.id, coefficient: 1 }],
  products: [{ speciesId: product.id, coefficient: 1 }],
};

const tunnelingReaction: Reaction = {
  id: "reaction-tunneling",
  name: "tunneling",
  description: null,
  type: "TUNNELING",
  gasPhaseId: gasPhase.id,
  attributes: attrs({ A: 1, B: 2, C: 3 }),
  reactants: [{ speciesId: reactant.id, coefficient: 1 }],
  products: [{ speciesId: product.id, coefficient: 1 }],
};

const surfaceReaction: Reaction = {
  id: "reaction-surface",
  name: "surface",
  description: null,
  type: "SURFACE",
  gasPhaseId: gasPhase.id,
  attributes: attrs({ "reaction probability": 0.5 }),
  gasPhaseSpeciesId: reactant.id,
  reactants: [],
  products: [{ speciesId: product.id, coefficient: 2, branch: "gas-phase" }],
};

const reactions = [
  arrheniusReaction,
  branchedReaction,
  emissionReaction,
  photolysisReaction,
  firstOrderLossReaction,
  troeReaction,
  tunnelingReaction,
  surfaceReaction,
];

const mechanism: Mechanism = {
  id: "mechanism",
  name: "Test Mechanism",
  description: null,
  familyId: "family",
  speciesIds: species.map((s) => s.id),
  reactionIds: reactions.map((r) => r.id),
  // note: unreferencedPhase intentionally omitted
  phaseIds: [gasPhase.id, aerosolPhase.id],
};

const family: Family = {
  id: "family",
  name: "Test Family",
  description: "",
  owner: null,
  mechanisms: [],
  species,
  reactions,
  phases: [gasPhase, aerosolPhase, unreferencedPhase],
};

/** Serialize the shared mechanism to JSON and parse it back to an object. */
const serialize = (m = mechanism, f = family): Record<string, any> =>
  JSON.parse(serializeMechanismJSON(m, f));

const serialized = serialize();

/** Find the serialized reaction of a given type. */
const reactionOfType = (type: string): Record<string, any> =>
  serialized.reactions.find((r: any) => r.type === type);

const reactionHasGasPhase = (reaction: Reaction, gasPhaseId: string): boolean => {
  return reaction.gasPhaseId !== undefined && reaction.gasPhaseId !== null && reaction.gasPhaseId === gasPhaseId;
}

describe("Mechanism Serialization", () => {
  it("serializes to a JSON string that deserializes to an object", () => {
    const result = serializeMechanismJSON(mechanism, family);
    const deserialized = deserializeV1Mechanism(result);
    expect(typeof result).toBe("string");
    expect(typeof deserialized).toBe("object");
    console.log(deserialized);
    const deserializedGasPhase = deserialized?.phases.find((p) => p.name === "gas");
    expect(deserializedGasPhase).toBeDefined();
    deserialized?.reactions.forEach((reaction) => {
      expect(reactionHasGasPhase(reaction, deserializedGasPhase.id)).toBe(true);
    });
  });

  it("serializes to a YAML string that deserializes to an object", () => {
    const result = serializeMechanismYAML(mechanism, family);
    expect(typeof result).toBe("string");
    const deserialized = deserializeV1Mechanism(result);
    expect(typeof deserialized).toBe("object");
    const deserializedGasPhase = deserialized?.phases.find((p) => p.name === "gas");
    expect(deserializedGasPhase).toBeDefined();
    deserialized?.reactions.forEach((reaction) => {
      expect(reactionHasGasPhase(reaction, deserializedGasPhase.id)).toBe(true);
    });
  });

  it("serializes a MusicBox (V0) blob object", () => {
    const result = serializeMechanismMusicBox(mechanism, family);
    expect(typeof result).toBe("object");
  });
});

describe("Phase serialization", () => {
  it("serializes referenced phases with their member species", () => {
    const phaseNames = serialized.phases.map((p: any) => p.name);
    expect(phaseNames).toContain("gas");
    expect(phaseNames).toContain("aerosol");

    // species ids are resolved to names, one entry per member species
    const gas = serialized.phases.find((p: any) => p.name === "gas");
    expect(gas.species.map((s: any) => s.name).sort()).toEqual(
      species.map((s) => s.name).sort(),
    );

    const aerosol = serialized.phases.find((p: any) => p.name === "aerosol");
    expect(aerosol.species.map((s: any) => s.name).sort()).toEqual(
      [molecularWeightSpecies.name, plainSpecies.name].sort(),
    );
  });

  it("omits phases the mechanism does not reference", () => {
    const phaseNames = serialized.phases.map((p: any) => p.name);
    expect(phaseNames).not.toContain("unreferenced");
  });
});

describe("Reaction type serialization", () => {
  it("ARRHENIUS", () => {
    const rx = reactionOfType("ARRHENIUS");
    expect(rx.A).toBe(1);
    expect(rx.B).toBe(2);
    expect(rx.Ea).toBe(3); // Ea present, so C omitted
    expect(rx.C).toBeUndefined();
    expect(rx.D).toBe(4);
    expect(rx.E).toBe(5);
    expect(rx.reactants[0].name).toBe(reactant.name);
    expect(rx.products[0]).toEqual({ name: product.name, coefficient: 2 });
    expect(rx["gas phase"]).toBe("gas");
  });

  it("ARRHENIUS without Ea falls back to C", () => {
    // the one case that needs a reaction variant: C and Ea are mutually
    // exclusive, so the shared (Ea) reaction cannot also cover the C branch.
    const cReaction: Reaction = {
      ...arrheniusReaction,
      id: "reaction-arrhenius-c",
      attributes: attrs({ A: 1, C: 9 }),
    };
    const parsed = serialize(
      { ...mechanism, reactionIds: [cReaction.id] },
      { ...family, reactions: [cReaction] },
    );
    const rx = parsed.reactions[0];
    expect(rx.C).toBe(9);
    expect(rx.Ea).toBeUndefined();
    expect(rx["gas phase"]).toBe("gas");
  });

  it("BRANCHED_NO_RO2", () => {
    const rx = reactionOfType("BRANCHED_NO_RO2");
    expect(rx.X).toBe(1);
    expect(rx.Y).toBe(2);
    expect(rx.a0).toBe(3);
    expect(rx.n).toBe(4);
    expect(rx["alkoxy products"][0].name).toBe(product.name);
    expect(rx["nitrate products"][0].name).toBe(reactant.name);
    expect(rx["gas phase"]).toBe("gas");
  });

  it("EMISSION", () => {
    const rx = reactionOfType("EMISSION");
    expect(rx["scaling factor"]).toBe(2.5);
    expect(rx.products[0].name).toBe(product.name);
    expect(rx["gas phase"]).toBe("gas");
  });

  it("PHOTOLYSIS", () => {
    const rx = reactionOfType("PHOTOLYSIS");
    expect(rx["scaling factor"]).toBe(3);
    expect(rx.reactants[0].name).toBe(reactant.name);
    expect(rx.products[0].name).toBe(product.name);
    expect(rx["gas phase"]).toBe("gas");
  });

  it("FIRST_ORDER_LOSS", () => {
    const rx = reactionOfType("FIRST_ORDER_LOSS");
    expect(rx["scaling factor"]).toBe(1.5);
    expect(rx.reactants[0].name).toBe(reactant.name);
    expect(rx.products).toBeUndefined(); // no products supplied → key omitted
    expect(rx["gas phase"]).toBe("gas");
  });

  it("TROE", () => {
    const rx = reactionOfType("TROE");
    expect(rx.k0_A).toBe(1);
    expect(rx.k0_C).toBe(3);
    expect(rx.kinf_A).toBe(4);
    expect(rx.Fc).toBe(0.5);
    expect(rx.N).toBe(1);
    expect(rx["gas phase"]).toBe("gas");
  });

  it("TUNNELING", () => {
    const rx = reactionOfType("TUNNELING");
    expect(rx.A).toBe(1);
    expect(rx.B).toBe(2);
    expect(rx.C).toBe(3);
    expect(rx["gas phase"]).toBe("gas");
  });

  it("SURFACE", () => {
    const rx = reactionOfType("SURFACE");
    expect(rx["reaction probability"]).toBe(0.5);
    // single gas-phase species resolves to its name
    expect(rx["gas-phase species"]).toBe(reactant.name);
    expect(rx["gas-phase products"][0]).toEqual({
      name: product.name,
      coefficient: 2,
    });
    expect(rx["gas phase"]).toBe("gas");
  });
});