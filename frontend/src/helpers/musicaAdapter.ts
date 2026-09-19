import { mechanismConfiguration } from "@ncar/musica";
import {
  Family,
  Mechanism,
  Phase,
  Product,
  Reactant,
  Reaction,
  ReactionTypeName,
  Species,
} from "../types/chemistryModels";
import { generateID } from "./localFamilies";
import { UUID } from "crypto";

/* Wrap @ncar/musica types for use in chemistry cafe.
 *
 * import/export is done by the musica library. On export we build musica
 * objects from the chemistry-cafe Family/Mechanism model and let musica
 * serialize; on import, we translate musica types to chemsitry cafe data models
 */

const {
  types,
  reactionTypes,
  Mechanism: MusicaMechanism,
} = mechanismConfiguration;

type MusicaReaction = InstanceType<
  (typeof reactionTypes)[keyof typeof reactionTypes]
>;

const V1_VERSION = "1.0.0";

/** Convert a value to a number. */
const num = (value: unknown, fallback: number): number =>
  value === undefined || value === null || value === ""
    ? fallback
    : Number(value);

/** Build a reaction.attributes object from a params record, dropping undefined. */
const attrsFromParams = (
  params: Record<string, number | number[] | string | undefined>,
): Reaction["attributes"] => {
  const attributes: Reaction["attributes"] = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    attributes[key] = { value };
  }
  return attributes;
};

// ── identity bridge (export direction) ───────────────────────
type NameResolver = (id: string) => string;
type ExportCtx = { speciesName: NameResolver; phaseName: NameResolver };

function componentsToMusica(items: Array<Reactant | Product>, ctx: ExportCtx) {
  return items.map(
    (item) =>
      new types.ReactionComponent({
        name: ctx.speciesName(String(item.speciesId)),
        coefficient: item.coefficient,
      }),
  );
}

/** Map a list of wire components ({ name, coefficient }) to editable products,
 * temporarily storing the species *name* in speciesId (linked to an id later). */
function componentsFromJSON(
  arr: Array<{ name?: string; coefficient?: number }> = [],
  branch?: string,
): Product[] {
  return arr.map((c) => ({
    // Temporarily stash the species name; linkComponentIds rewrites it to the id.
    speciesId: (c.name ?? "") as UUID,
    coefficient: c.coefficient ?? 1,
    ...(branch ? { branch } : {}),
  }));
}

// ── per-reaction-type registry ───────────────────────────────
type ReactionAdapter = {
  toMusica: (reaction: Reaction, ctx: ExportCtx) => MusicaReaction;
  fromMusica: (json: Record<string, any>) => Reaction;
};

const ARRHENIUS: ReactionAdapter = {
  toMusica: (r, ctx) => {
    const ea = r.attributes["Ea"]?.value;
    return new reactionTypes.Arrhenius({
      name: r.name,
      A: num(r.attributes["A"]?.value, 1.0),
      B: num(r.attributes["B"]?.value, 0.0),
      // C and Ea are mutually exclusive (see chemistry-cafe PR #166).
      ...(ea !== undefined && ea !== ""
        ? { Ea: num(ea, 0) }
        : { C: num(r.attributes["C"]?.value, 0) }),
      D: num(r.attributes["D"]?.value, 300.0),
      E: num(r.attributes["E"]?.value, 0.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    });
  },

  fromMusica: (json) => ({
    id: generateID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Arrhenius.type,
    gasPhaseId: json["gas phase"] ?? undefined,
    attributes: attrsFromParams({
      A: json.A,
      B: json.B,
      ...(json.Ea !== undefined ? { Ea: json.Ea } : { C: json.C }),
      D: json.D,
      E: json.E,
    }),
    reactants: componentsFromJSON(json.reactants),
    products: componentsFromJSON(json.products),
  }),
};

const BRANCHED_NO_RO2: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.Branched({
      name: r.name,
      X: num(r.attributes["X"]?.value, 0),
      Y: num(r.attributes["Y"]?.value, 0),
      a0: num(r.attributes["a0"]?.value, 0),
      n: num(r.attributes["n"]?.value, 0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      nitrate_products: componentsToMusica(
        r.products.filter((p) => p.branch === "nitrate"),
        ctx,
      ),
      alkoxy_products: componentsToMusica(
        r.products.filter((p) => p.branch === "alkoxy"),
        ctx,
      ),
    }),

  fromMusica: (json) => ({
    id: generateID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Branched.type,
    gasPhaseId: json["gas phase"] ?? undefined,
    attributes: attrsFromParams({
      X: json.X,
      Y: json.Y,
      a0: json.a0,
      n: json.n,
    }),
    reactants: componentsFromJSON(json.reactants),
    products: [
      ...componentsFromJSON(json["nitrate products"], "nitrate"),
      ...componentsFromJSON(json["alkoxy products"], "alkoxy"),
    ],
  }),
};

const EMISSION: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.Emission({
      name: r.name,
      scaling_factor: num(r.attributes["scalingFactor"]?.value, 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Emission.type,
    gasPhaseId: json["gas phase"] ?? undefined,
    attributes: attrsFromParams({
      scalingFactor: json["scaling factor"],
    }),
    reactants: [],
    products: componentsFromJSON(json.products),
  }),
};

const FIRST_ORDER_LOSS: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.FirstOrderLoss({
      name: r.name,
      scaling_factor: num(r.attributes["scalingFactor"]?.value, 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
    }),

  fromMusica: (json) => ({
    id: generateID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.FirstOrderLoss.type,
    gasPhaseId: json["gas phase"] ?? undefined,
    attributes: attrsFromParams({
      scalingFactor: json["scaling factor"],
    }),
    reactants: componentsFromJSON(json.reactants),
    products: [],
  }),
};

const PHOTOLYSIS: ReactionAdapter = {
  toMusica: (r, ctx) => {
    return new reactionTypes.Photolysis({
      name: r.name,
      scaling_factor: num(r.attributes["scalingFactor"]?.value, 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    });
  },

  fromMusica: (json) => {
    let obj = {
      id: generateID(),
      name: json.name ?? "",
      description: null,
      gasPhaseId: json["gas phase"] ?? undefined,
      type: reactionTypes.Photolysis.type,
      attributes: attrsFromParams({
        scalingFactor: json["scaling factor"],
      }),
      reactants: componentsFromJSON(json.reactants),
      products: componentsFromJSON(json.products),
    };
    return obj;
  },
};

const SURFACE: ReactionAdapter = {
  toMusica: (r, ctx) => {
    return new reactionTypes.Surface({
      name: r.name,
      reaction_probability: num(
        r.attributes["reactionProbability"]?.value,
        1.0,
      ),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      gas_phase_species: new types.ReactionComponent({
        name: ctx.speciesName(String(r.gasPhaseSpeciesId)),
      }),
      gas_phase_products: componentsToMusica(
        r.products.filter((p) => p.branch === "gas-phase"),
        ctx,
      ),
    });
  },

  fromMusica: (json) => {
    return {
      id: generateID(),
      name: json.name ?? "",
      description: null,
      type: reactionTypes.Surface.type,
      gasPhaseId: json["gas phase"] ?? undefined,
      attributes: attrsFromParams({
        reactionProbability: json["reaction probability"],
      }),
      reactants: [],
      products: componentsFromJSON(json["gas-phase products"], "gas-phase"),
      gasPhaseSpeciesId: json["gas-phase species"],
    };
  },
};

const TAYLOR_SERIES: ReactionAdapter = {
  toMusica: (r, ctx) => {
    const ea = r.attributes["Ea"]?.value;
    return new reactionTypes.TaylorSeries({
      name: r.name,
      A: num(r.attributes["A"]?.value, 1.0),
      B: num(r.attributes["B"]?.value, 0.0),
      ...(ea !== undefined && ea !== ""
        ? { Ea: num(ea, 0) }
        : { C: num(r.attributes["C"]?.value, 0) }),
      D: num(r.attributes["D"]?.value, 300.0),
      E: num(r.attributes["E"]?.value, 0.0),
      taylor_coefficients: r.attributes["taylorCoefficients"]
        ?.value as number[],
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    });
  },

  fromMusica: (json) => ({
    id: generateID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.TaylorSeries.type,
    attributes: attrsFromParams({
      A: json.A,
      B: json.B,
      ...(json.Ea !== undefined ? { Ea: json.Ea } : { C: json.C }),
      D: json.D,
      E: json.E,
      taylorCoefficients: json["taylor coefficients"] as number[],
    }),
    gasPhaseId: json["gas phase"] ?? undefined,
    reactants: componentsFromJSON(json.reactants),
    products: componentsFromJSON(json.products),
  }),
};

const TERNARY_CHEMICAL_ACTIVATION: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.TernaryChemicalActivation({
      name: r.name,
      k0_A: num(r.attributes["k0A"]?.value, 1.0),
      k0_B: num(r.attributes["k0B"]?.value, 0.0),
      k0_C: num(r.attributes["k0C"]?.value, 0.0),
      kinf_A: num(r.attributes["kinfA"]?.value, 1.0),
      kinf_B: num(r.attributes["kinfB"]?.value, 0.0),
      kinf_C: num(r.attributes["kinfC"]?.value, 0.0),
      Fc: num(r.attributes["Fc"]?.value, 0.6),
      N: num(r.attributes["N"]?.value, 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.TernaryChemicalActivation.type,
    gasPhaseId: json["gas phase"] ?? undefined,
    attributes: attrsFromParams({
      k0A: json.k0_A,
      k0B: json.k0_B,
      k0C: json.k0_C,
      kinfA: json.kinf_A,
      kinfB: json.kinf_B,
      kinfC: json.kinf_C,
      Fc: json.Fc,
      N: json.N,
    }),
    reactants: componentsFromJSON(json.reactants),
    products: componentsFromJSON(json.products),
  }),
};

const TROE: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.Troe({
      name: r.name,
      k0_A: num(r.attributes["k0A"]?.value, 1.0),
      k0_B: num(r.attributes["k0B"]?.value, 0.0),
      k0_C: num(r.attributes["k0C"]?.value, 0.0),
      kinf_A: num(r.attributes["kinfA"]?.value, 1.0),
      kinf_B: num(r.attributes["kinfB"]?.value, 0.0),
      kinf_C: num(r.attributes["kinfC"]?.value, 0.0),
      Fc: num(r.attributes["Fc"]?.value, 0.6),
      N: num(r.attributes["N"]?.value, 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Troe.type,
    gasPhaseId: json["gas phase"] ?? undefined,
    attributes: attrsFromParams({
      k0A: json.k0_A,
      k0B: json.k0_B,
      k0C: json.k0_C,
      kinfA: json.kinf_A,
      kinfB: json.kinf_B,
      kinfC: json.kinf_C,
      Fc: json.Fc,
      N: json.N,
    }),
    reactants: componentsFromJSON(json.reactants),
    products: componentsFromJSON(json.products),
  }),
};

const TUNNELING: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.Tunneling({
      name: r.name,
      A: num(r.attributes["A"]?.value, 1.0),
      B: num(r.attributes["B"]?.value, 0.0),
      C: num(r.attributes["C"]?.value, 0.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Tunneling.type,
    gasPhaseId: json["gas phase"] ?? undefined,
    attributes: attrsFromParams({ A: json.A, B: json.B, C: json.C }),
    reactants: componentsFromJSON(json.reactants),
    products: componentsFromJSON(json.products),
  }),
};

const USER_DEFINED: ReactionAdapter = {
  toMusica: (r, ctx) => {
    return new reactionTypes.UserDefined({
      name: r.name,
      scaling_factor: num(r.attributes["scalingFactor"]?.value, 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    });
  },

  fromMusica: (json) => {
    let obj = {
      id: generateID(),
      name: json.name ?? "",
      description: null,
      gasPhaseId: json["gas phase"] ?? undefined,
      type: reactionTypes.UserDefined.type,
      attributes: attrsFromParams({
        scalingFactor: json["scaling factor"],
      }),
      reactants: componentsFromJSON(json.reactants),
      products: componentsFromJSON(json.products),
    };
    return obj;
  },
};

const REACTION_ADAPTERS: Partial<Record<ReactionTypeName, ReactionAdapter>> = {
  ARRHENIUS,
  BRANCHED_NO_RO2,
  EMISSION,
  FIRST_ORDER_LOSS,
  PHOTOLYSIS,
  SURFACE,
  TAYLOR_SERIES,
  TERNARY_CHEMICAL_ACTIVATION,
  TROE,
  TUNNELING,
  USER_DEFINED,
};

// ── species / phase mapping ──────────────────────────────────
function speciesToMusica(s: Species) {
  const params: mechanismConfiguration.SpeciesParams = {
    name: s.name,
    absolute_tolerance: s.absoluteTolerance,
    molecular_weight: s.molecularWeight,
    is_third_body: s.isThirdBody,
    constant_concentration: s.constantConcentration,
    constant_mixing_ratio: s.constantMixingRatio,
    other_properties: s.otherProperties,
  };
  return new types.Species(params);
}

function phaseToMusica(p: Phase, ctx: ExportCtx) {
  return new types.Phase({
    name: p.name,
    // musica's Phase holds PhaseSpecies objects (each serializes to
    // { name, "diffusion coefficient [m2 s-1]" }), not bare name strings.
    species: p.speciesIds.map(
      (id) => new types.PhaseSpecies({ name: ctx.speciesName(String(id)) }),
    ),
  });
}

/**
 * Serialize one mechanism of a family into a V1 mechanism-configuration object
 * (the value musica's getJSON() produces). Callers format it as JSON or YAML.
 * @throws if the mechanism contains a reaction type without a registry entry.
 */
export function serializeMechanism(mech: Mechanism, family: Family) {
  const speciesIdToName = new Map(
    family.species.map((s) => [String(s.id), s.name]),
  );
  const phaseIdToName = new Map(
    family.phases.map((p) => [String(p.id), p.name]),
  );
  const ctx: ExportCtx = {
    speciesName: (id) => speciesIdToName.get(id) ?? id,
    phaseName: (id) => phaseIdToName.get(id) ?? id,
  };

  const musicaMechanism = new MusicaMechanism({
    name: mech.name,
    version: V1_VERSION,
    species: family.species
      .filter((s) => mech.speciesIds.includes(s.id))
      .map(speciesToMusica),
    phases: family.phases
      .filter((p) => mech.phaseIds.includes(p.id))
      .map((p) => phaseToMusica(p, ctx)),
    reactions: family.reactions
      .filter((r) => mech.reactionIds.includes(r.id))
      .map((r) => {
        const adapter = REACTION_ADAPTERS[r.type];
        if (!adapter) {
          throw new Error(`Unsupported reaction type for export: ${r.type}`);
        }
        return adapter.toMusica(r, ctx);
      }),
  });

  return musicaMechanism.getJSON();
}

/**
 * Build a new Family (with one mechanism's worth of data) from a parsed V1
 * object. Species/phase references arrive as names on the wire and are relinked
 * to freshly generated frontend ids.
 * @throws if the object is missing the required top-level arrays.
 */
export function deserializeMechanism(parsed: Record<string, any>): Family {
  if (
    !Array.isArray(parsed?.species) ||
    !Array.isArray(parsed?.phases) ||
    !Array.isArray(parsed?.reactions)
  ) {
    throw new Error(
      "Mechanism is missing 'species', 'phases', or 'reactions' arrays",
    );
  }

  const familyId = generateID();
  const family: Family = {
    id: familyId,
    name: parsed.name ?? "New Family",
    description: "This family was automatically generated from a file",
    owner: null,
    species: [],
    phases: [],
    reactions: [],
    mechanisms: [],
  };

  // 1. species — build, and remember name -> frontend id.
  const nameToId = new Map<string, UUID>();
  for (const s of parsed.species) {
    const id = generateID();
    nameToId.set(s.name, id);
    family.species.push(speciesFromJSON(s, id, familyId));
  }

  // 2. phases — resolve member species names back to ids.
  const phaseToId = new Map<string, UUID>();
  for (const p of parsed.phases) {
    const id = generateID();
    phaseToId.set(p.name, id);
    family.phases.push({
      id,
      name: p.name,
      description: null,
      speciesIds: (p.species ?? [])
        // musica emits phase species as { name, … } objects; older v1 configs
        // used bare name strings. Accept either.
        .map((s: string | { name: string }) =>
          nameToId.get(typeof s === "string" ? s : s.name),
        )
        .filter((x: string | undefined): x is string => x !== undefined),
    });
  }

  // 3. reactions — build via the registry, then relink component names -> ids.
  for (const r of parsed.reactions) {
    const adapter = REACTION_ADAPTERS[r.type as ReactionTypeName];
    if (!adapter) {
      console.warn(`Unsupported reaction type on import: ${r.type}`);
      continue;
    }
    let reaction = adapter.fromMusica(r);
    reaction = linkPhaseIds(reaction, phaseToId);
    reaction = linkComponentIds(reaction, nameToId);
    family.reactions.push(reaction);
  }

  return family;
}

function speciesFromJSON(
  s: Record<string, unknown>,
  id: UUID,
  familyId: UUID,
): Species {
  const otherProperties: Record<string, string | number | boolean> = {};
  for (const [rawKey, value] of Object.entries(s)) {
    if (!rawKey.startsWith("__")) continue;
    if (
      typeof value === "number" ||
      typeof value === "string" ||
      typeof value === "boolean"
    ) {
      otherProperties[rawKey.replace(/^__/, "")] = value;
    }
  }
  const species: Species = {
    absoluteTolerance: s["absolute tolerance"] as number | undefined,
    constantConcentration: s["constant concentration [mol m-3]"] as
      | number
      | undefined,
    constantMixingRatio: s["constant mixing ratio [mol mol-1]"] as
      | number
      | undefined,
    description: null,
    familyId,
    id,
    isThirdBody: s["is third body"] as boolean | undefined,
    molecularWeight: s["molecular weight [kg mol-1]"] as number | undefined,
    name: String(s.name),
    otherProperties: Object.keys(otherProperties).length
      ? otherProperties
      : undefined,
  };
  return species;
}

/** fromMusica stores species *names* in component.speciesId; rewrite to ids. */
function linkComponentIds(r: Reaction, nameToId: Map<string, UUID>): Reaction {
  const toId = (speciesId: Reactant["speciesId"]) =>
    nameToId.get(String(speciesId)) ?? speciesId;
  if (r.type === reactionTypes.Surface.type) {
    return {
      ...r,
      gasPhaseSpeciesId: r.gasPhaseSpeciesId
        ? toId(r.gasPhaseSpeciesId)
        : undefined,
      products: r.products.map((c) =>
        c.branch === "gas-phase" ? { ...c, speciesId: toId(c.speciesId) } : c,
      ),
    };
  } else {
    return {
      ...r,
      reactants: r.reactants.map((c) => ({
        ...c,
        speciesId: toId(c.speciesId),
      })),
      products: r.products.map((c) => ({ ...c, speciesId: toId(c.speciesId) })),
    };
  }
}

function linkPhaseIds(r: Reaction, nameToId: Map<string, UUID>) {
  return {
    ...r,
    gasPhaseId: r.gasPhaseId
      ? (nameToId.get(String(r.gasPhaseId)) ?? r.gasPhaseId)
      : undefined,
  };
}
