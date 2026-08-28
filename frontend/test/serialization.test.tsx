import { beforeAll, describe, expect, it } from "vitest";
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
import * as YAML from "yaml";

/** Build a reaction/attribute bag ({ [key]: { serializationKey, value } }). */
const attrs = (
  obj: Record<string, number | number[] | string>,
): Reaction["attributes"] =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, { serializationKey: k, value: v }]),
  );

const molecularWeightSpecies: Species = {
  id: "species-molecular-weight",
  name: "Molecular Weight Species",
  description: null,
  familyId: "",
  molecularWeight: 1e-2,
};

const mixingRatioSpecies: Species = {
  id: "species-mixing-ratio",
  name: "Mixing Ratio Species",
  description: null,
  familyId: "",
  constantMixingRatio: 1e-2,
};

const thirdBodySpecies: Species = {
  id: "species-third-body",
  name: "Third Body Species",
  description: null,
  familyId: "",
  isThirdBody: true,
};

const absoluteToleranceSpecies: Species = {
  id: "species-absolute-tolerance",
  name: "Absolute Tolerance Species",
  description: null,
  familyId: "",
  absoluteTolerance: 1e-9,
};

const otherPropertiesSpecies: Species = {
  id: "species-other-properties",
  name: "Other Properties Species",
  description: null,
  familyId: "",
  otherProperties: { "long name": "ozone" },
};

const plainSpecies: Species = {
  id: "species-plain",
  name: "Plain Species",
  description: null,
  familyId: "",
};

const species = [
  molecularWeightSpecies,
  mixingRatioSpecies,
  thirdBodySpecies,
  absoluteToleranceSpecies,
  otherPropertiesSpecies,
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

const taylorSeriesReaction: Reaction = {
  id: "reaction-taylor-series",
  name: "taylor series",
  description: null,
  type: "TAYLOR_SERIES",
  gasPhaseId: gasPhase.id,
  attributes: attrs({
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    taylor_coefficients: [1, 2, 3],
  }),
  reactants: [{ speciesId: reactant.id, coefficient: 1 }],
  products: [{ speciesId: product.id, coefficient: 1 }],
};

const ternaryChemicalActivationReaction: Reaction = {
  id: "reaction-ternary-chemical-activation",
  name: "ternary chemical activation",
  description: null,
  type: "TERNARY_CHEMICAL_ACTIVATION",
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

const userDefinedReaction: Reaction = {
  id: "reaction-user-defined",
  name: "user defined",
  description: null,
  type: "USER_DEFINED",
  gasPhaseId: gasPhase.id,
  attributes: attrs({ "scaling factor": 4 }),
  reactants: [
    { speciesId: reactant.id, coefficient: 1 },
    { speciesId: product.id, coefficient: 1 },
  ],
  products: [
    { speciesId: product.id, coefficient: 1 },
    { speciesId: reactant.id, coefficient: 1 },
  ],
};

const reactions = [
  arrheniusReaction,
  branchedReaction,
  emissionReaction,
  firstOrderLossReaction,
  photolysisReaction,
  surfaceReaction,
  taylorSeriesReaction,
  ternaryChemicalActivationReaction,
  troeReaction,
  tunnelingReaction,
  userDefinedReaction,
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

// Built once per consuming suite in `beforeAll(initFixtures)` (see below), so
// the shared serialize/deserialize runs inside those suites — not at module
// load, and not for the mechanism serialization tests, which have no beforeAll.
let serialized: Record<string, any>;
let imported: Family;

const initFixtures = () => {
  serialized = serialize();
  imported = deserializeV1Mechanism(serializeMechanismJSON(mechanism, family))!;
};

/** Find the serialized reaction of a given type. */
const reactionOfType = (type: string): Record<string, any> =>
  serialized.reactions.find((r: any) => r.type === type);

/** Find the deserialized (round-tripped) reaction of a given type. The imported
 * family carries fresh frontend ids, so component references resolve back to
 * species by name via `importedName`. */
const importedReactionOfType = (type: string): Reaction =>
  imported.reactions.find((r) => r.type === type)!;

const importedName = (speciesId: string): string | undefined =>
  imported.species.find((s) => s.id === speciesId)?.name;

const importedGasPhase = (): Phase | undefined =>
  imported.phases.find((p) => p.name === "gas");

const reactionHasGasPhase = (reaction: Reaction, gasPhaseId: string): boolean =>
  reaction.gasPhaseId !== undefined &&
  reaction.gasPhaseId !== null &&
  reaction.gasPhaseId === gasPhaseId;

describe("Mechanism Serialization", () => {
  it("serializes to a JSON string that deserializes to an object", () => {
    const result = serializeMechanismJSON(mechanism, family);
    const deserialized = deserializeV1Mechanism(result);
    expect(typeof result).toBe("string");
    expect(typeof deserialized).toBe("object");
    const deserializedGasPhase = deserialized?.phases.find(
      (p) => p.name === "gas",
    );
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
    const deserializedGasPhase = deserialized?.phases.find(
      (p) => p.name === "gas",
    );
    expect(deserializedGasPhase).toBeDefined();
    deserialized?.reactions.forEach((reaction) => {
      expect(reactionHasGasPhase(reaction, deserializedGasPhase.id)).toBe(true);
    });
  });

  it("serializes a MusicBox (V0) blob object", () => {
    const result = serializeMechanismMusicBox(mechanism, family);
    expect(typeof result).toBe("object");
  });

  it("always emits a pinned version on export (JSON and YAML)", () => {
    expect(JSON.parse(serializeMechanismJSON(mechanism, family)).version).toBe(
      "1.0.0",
    );
    expect(YAML.parse(serializeMechanismYAML(mechanism, family)).version).toBe(
      "1.0.0",
    );
  });
});

describe("Phase serialization", () => {
  beforeAll(initFixtures);

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

// Guards against a regression to a hardcoded `"gas phase": "gas"`. Every other
// suite names the gas phase "gas", so a hardcoded literal would still pass
// there. This one names it "troposphere" and checks both directions.
describe("Gas phase name fidelity (non-'gas')", () => {
  const tropospherePhase: Phase = {
    id: "phase-troposphere",
    name: "troposphere",
    description: null,
    speciesIds: [reactant.id, product.id],
  };

  const reaction: Reaction = {
    ...arrheniusReaction,
    id: "reaction-troposphere",
    gasPhaseId: tropospherePhase.id,
  };

  const tropoMechanism: Mechanism = {
    ...mechanism,
    speciesIds: [reactant.id, product.id],
    reactionIds: [reaction.id],
    phaseIds: [tropospherePhase.id],
  };

  const tropoFamily: Family = {
    ...family,
    species: [reactant, product],
    reactions: [reaction],
    phases: [tropospherePhase],
  };

  it("serializes the reaction's actual gas phase name", () => {
    const parsed = serialize(tropoMechanism, tropoFamily);
    expect(parsed.phases[0].name).toBe("troposphere");
    expect(parsed.reactions[0]["gas phase"]).toBe("troposphere");
  });

  it("imports the reaction's gas phase by name", () => {
    const back = deserializeV1Mechanism(
      serializeMechanismJSON(tropoMechanism, tropoFamily),
    )!;
    const importedPhase = back.phases.find((p) => p.name === "troposphere");
    expect(importedPhase).toBeDefined();
    expect(back.reactions[0].gasPhaseId).toBe(importedPhase!.id);
  });
});

describe("Species serialization", () => {
  beforeAll(initFixtures);

  it("serializes species to their v1 wire keys", () => {
    const byName = (name: string) =>
      serialized.species.find((s: any) => s.name === name);

    expect(
      byName(molecularWeightSpecies.name)["molecular weight [kg mol-1]"],
    ).toBe(0.01);
    expect(
      byName(mixingRatioSpecies.name)["constant mixing ratio [mol mol-1]"],
    ).toBe(0.01);
    expect(byName(thirdBodySpecies.name)["is third body"]).toBe(true);
    // absolute tolerance is a first-class field, so no `__` prefix
    expect(byName(absoluteToleranceSpecies.name)["absolute tolerance"]).toBe(
      1e-9,
    );
    // arbitrary passthrough keys are emitted with musica's `__` prefix
    expect(byName(otherPropertiesSpecies.name)["__long name"]).toBe("ozone");
    // a species with no properties serializes to just its name
    expect(Object.keys(byName(plainSpecies.name))).toEqual(["name"]);
  });

  it("deserializes species back to the model", () => {
    const byName = (name: string) =>
      imported.species.find((s) => s.name === name)!;
    expect(byName(molecularWeightSpecies.name).molecularWeight).toBe(0.01);
    expect(byName(mixingRatioSpecies.name).constantMixingRatio).toBe(0.01);
    expect(byName(thirdBodySpecies.name).isThirdBody).toBe(true);
    expect(byName(absoluteToleranceSpecies.name).absoluteTolerance).toBe(1e-9);
    // the `__` prefix is stripped back off passthrough properties
    expect(
      byName(otherPropertiesSpecies.name).otherProperties?.["long name"],
    ).toBe("ozone");
  });

  it("omits 'is third body' when the species is not a third body", () => {
    const notThirdBody: Species = {
      ...thirdBodySpecies,
      id: "species-not-third-body",
      isThirdBody: false,
    };
    const parsed = serialize(
      {
        ...mechanism,
        speciesIds: [notThirdBody.id],
        reactionIds: [],
        phaseIds: [],
      },
      { ...family, species: [notThirdBody], reactions: [], phases: [] },
    );
    expect(parsed.species[0]["is third body"]).toEqual(false);
  });
});

describe("Reaction type serialization and deserialization", () => {
  beforeAll(initFixtures);

  describe("ARRHENIUS", () => {
    it("serializes", () => {
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

    it("deserializes", () => {
      const back = importedReactionOfType("ARRHENIUS");
      expect(back.attributes["A"]?.value).toBe(1);
      expect(back.attributes["Ea"]?.value).toBe(3);
      expect(back.attributes["C"]).toBeUndefined();
      expect(importedName(String(back.reactants[0].speciesId))).toBe(
        reactant.name,
      );
      expect(importedName(String(back.products[0].speciesId))).toBe(
        product.name,
      );
      expect(back.products[0].coefficient).toBe(2);
      expect(reactionHasGasPhase(back, importedGasPhase()!.id)).toBe(true);
    });

    it("serializes with C when Ea is absent", () => {
      // C and Ea are mutually exclusive, so this needs a reaction variant.
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
  });

  describe("BRANCHED_NO_RO2", () => {
    it("serializes", () => {
      const rx = reactionOfType("BRANCHED_NO_RO2");
      expect(rx.X).toBe(1);
      expect(rx.Y).toBe(2);
      expect(rx.a0).toBe(3);
      expect(rx.n).toBe(4);
      expect(rx["alkoxy products"][0].name).toBe(product.name);
      expect(rx["nitrate products"][0].name).toBe(reactant.name);
      expect(rx["gas phase"]).toBe("gas");
    });

    it("deserializes", () => {
      const back = importedReactionOfType("BRANCHED_NO_RO2");
      expect(back.attributes["X"]?.value).toBe(1);
      expect(back.attributes["n"]?.value).toBe(4);
      const alkoxy = back.products.filter((p) => p.branch === "alkoxy");
      const nitrate = back.products.filter((p) => p.branch === "nitrate");
      expect(importedName(String(alkoxy[0].speciesId))).toBe(product.name);
      expect(importedName(String(nitrate[0].speciesId))).toBe(reactant.name);
      expect(reactionHasGasPhase(back, importedGasPhase()!.id)).toBe(true);
    });
  });

  describe("EMISSION", () => {
    it("serializes", () => {
      const rx = reactionOfType("EMISSION");
      expect(rx["scaling factor"]).toBe(2.5);
      expect(rx.products[0].name).toBe(product.name);
      expect(rx["gas phase"]).toBe("gas");
    });

    it("deserializes", () => {
      const back = importedReactionOfType("EMISSION");
      expect(back.attributes["scaling factor"]?.value).toBe(2.5);
      expect(importedName(String(back.products[0].speciesId))).toBe(
        product.name,
      );
      expect(reactionHasGasPhase(back, importedGasPhase()!.id)).toBe(true);
    });
  });

  describe("FIRST_ORDER_LOSS", () => {
    it("serializes", () => {
      const rx = reactionOfType("FIRST_ORDER_LOSS");
      expect(rx["scaling factor"]).toBe(1.5);
      expect(rx.reactants[0].name).toBe(reactant.name);
      expect(rx.products).toBeUndefined(); // no products supplied → key omitted
      expect(rx["gas phase"]).toBe("gas");
    });

    it("deserializes", () => {
      const back = importedReactionOfType("FIRST_ORDER_LOSS");
      expect(back.attributes["scaling factor"]?.value).toBe(1.5);
      expect(importedName(String(back.reactants[0].speciesId))).toBe(
        reactant.name,
      );
      expect(back.products).toHaveLength(0);
      expect(reactionHasGasPhase(back, importedGasPhase()!.id)).toBe(true);
    });
  });

  describe("PHOTOLYSIS", () => {
    it("serializes", () => {
      const rx = reactionOfType("PHOTOLYSIS");
      expect(rx["scaling factor"]).toBe(3);
      expect(rx.reactants[0].name).toBe(reactant.name);
      expect(rx.products[0].name).toBe(product.name);
      expect(rx["gas phase"]).toBe("gas");
    });

    it("deserializes", () => {
      const back = importedReactionOfType("PHOTOLYSIS");
      expect(back.attributes["scaling factor"]?.value).toBe(3);
      expect(importedName(String(back.reactants[0].speciesId))).toBe(
        reactant.name,
      );
      expect(importedName(String(back.products[0].speciesId))).toBe(
        product.name,
      );
      expect(reactionHasGasPhase(back, importedGasPhase()!.id)).toBe(true);
    });
  });

  describe("SURFACE", () => {
    it("serializes", () => {
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

    it("deserializes", () => {
      const back = importedReactionOfType("SURFACE");
      expect(back.attributes["reaction probability"]?.value).toBe(0.5);
      const gasPhaseProducts = back.products.filter(
        (p) => p.branch === "gas-phase",
      );
      expect(importedName(String(gasPhaseProducts[0].speciesId))).toBe(
        product.name,
      );
      expect(importedName(String(back.gasPhaseSpeciesId))).toBe(reactant.name);
      expect(reactionHasGasPhase(back, importedGasPhase()!.id)).toBe(true);
    });
  });

  describe("TAYLOR_SERIES", () => {
    it("serializes", () => {
      const rx = reactionOfType("TAYLOR_SERIES");
      expect(rx.A).toBe(1);
      expect(rx.B).toBe(2);
      expect(rx.C).toBe(3);
      expect(rx.D).toBe(4);
      expect(rx.E).toBe(5);
      expect(rx["taylor coefficients"]).toEqual([1, 2, 3]);
      expect(rx["gas phase"]).toBe("gas");
    });

    it("deserializes", () => {
      const back = importedReactionOfType("TAYLOR_SERIES");
      expect(back.attributes["A"]?.value).toBe(1);
      expect(back.attributes["C"]?.value).toBe(3);
      expect(back.attributes["taylor_coefficients"]?.value).toEqual([1, 2, 3]);
      expect(importedName(String(back.reactants[0].speciesId))).toBe(
        reactant.name,
      );
      expect(importedName(String(back.products[0].speciesId))).toBe(
        product.name,
      );
      expect(reactionHasGasPhase(back, importedGasPhase()!.id)).toBe(true);
    });
  });

  describe("TERNARY_CHEMICAL_ACTIVATION", () => {
    it("serializes", () => {
      const rx = reactionOfType("TERNARY_CHEMICAL_ACTIVATION");
      expect(rx.k0_A).toBe(1);
      expect(rx.k0_C).toBe(3);
      expect(rx.kinf_A).toBe(4);
      expect(rx.Fc).toBe(0.5);
      expect(rx.N).toBe(1);
      expect(rx["gas phase"]).toBe("gas");
    });

    it("deserializes", () => {
      const back = importedReactionOfType("TERNARY_CHEMICAL_ACTIVATION");
      expect(back.attributes["k0_A"]?.value).toBe(1);
      expect(back.attributes["Fc"]?.value).toBe(0.5);
      expect(back.attributes["N"]?.value).toBe(1);
      expect(importedName(String(back.reactants[0].speciesId))).toBe(
        reactant.name,
      );
      expect(reactionHasGasPhase(back, importedGasPhase()!.id)).toBe(true);
    });
  });

  describe("TROE", () => {
    it("serializes", () => {
      const rx = reactionOfType("TROE");
      expect(rx.k0_A).toBe(1);
      expect(rx.k0_C).toBe(3);
      expect(rx.kinf_A).toBe(4);
      expect(rx.Fc).toBe(0.5);
      expect(rx.N).toBe(1);
      expect(rx["gas phase"]).toBe("gas");
    });

    it("deserializes", () => {
      const back = importedReactionOfType("TROE");
      expect(back.attributes["k0_A"]?.value).toBe(1);
      expect(back.attributes["Fc"]?.value).toBe(0.5);
      expect(back.attributes["N"]?.value).toBe(1);
      expect(importedName(String(back.reactants[0].speciesId))).toBe(
        reactant.name,
      );
      expect(reactionHasGasPhase(back, importedGasPhase()!.id)).toBe(true);
    });
  });

  describe("TUNNELING", () => {
    it("serializes", () => {
      const rx = reactionOfType("TUNNELING");
      expect(rx.A).toBe(1);
      expect(rx.B).toBe(2);
      expect(rx.C).toBe(3);
      expect(rx["gas phase"]).toBe("gas");
    });

    it("deserializes", () => {
      const back = importedReactionOfType("TUNNELING");
      expect(back.attributes["A"]?.value).toBe(1);
      expect(back.attributes["C"]?.value).toBe(3);
      expect(importedName(String(back.reactants[0].speciesId))).toBe(
        reactant.name,
      );
      expect(reactionHasGasPhase(back, importedGasPhase()!.id)).toBe(true);
    });
  });

  describe("USER_DEFINED", () => {
    it("serializes", () => {
      const rx = reactionOfType("USER_DEFINED");
      expect(rx["scaling factor"]).toBe(4);
      expect(rx.reactants[0].name).toBe(reactant.name);
      expect(rx.reactants[1].name).toBe(product.name);
      expect(rx.products[0].name).toBe(product.name);
      expect(rx.products[1].name).toBe(reactant.name);
      expect(rx["gas phase"]).toBe("gas");
    });

    it("deserializes", () => {
      const back = importedReactionOfType("USER_DEFINED");
      expect(back.attributes["scaling factor"]?.value).toBe(4);
      expect(importedName(String(back.reactants[0].speciesId))).toBe(
        reactant.name,
      );
      expect(importedName(String(back.reactants[1].speciesId))).toBe(
        product.name,
      );
      expect(importedName(String(back.products[0].speciesId))).toBe(
        product.name,
      );
      expect(importedName(String(back.products[1].speciesId))).toBe(
        reactant.name,
      );
      expect(reactionHasGasPhase(back, importedGasPhase()!.id)).toBe(true);
    });
  });
});
