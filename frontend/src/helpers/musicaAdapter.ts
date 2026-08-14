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
import { generateFrontendID } from "./localFamilies";

/* Wrap @ncar/musica types for use in chemistry cafe.
 *
 * import/export is done by the musica library. On export we build musica
 * objects from the chemistry-cafe Family/Mechanism model and let musica
 * serialize; on import we read the parsed wire object back into the model,
 * assigning fresh frontend ids.
 */

const {
  types,
  reactionTypes,
  Mechanism: MusicaMechanism,
} = mechanismConfiguration;

// A musica reaction is any of the concrete reaction-rate class instances.
// Derived from the runtime registry so it stays in lockstep with reactionTypes.
type MusicaReaction = InstanceType<
  (typeof reactionTypes)[keyof typeof reactionTypes]
>;

const V1_VERSION = "1.0.0";
const SCALING_FACTOR_KEY = "scaling factor";

// Chemistry-cafe species attribute (serializationKey) -> musica Species param.
// These are the only species properties musica models as first-class fields;
// anything else is treated as an "other property" (see speciesToMusica).
const SPECIES_ATTR_TO_MUSICA: Record<
  string,
  keyof mechanismConfiguration.SpeciesParams
> = {
  "molecular weight [kg mol-1]": "molecular_weight",
  "constant concentration [mol m-3]": "constant_concentration",
  "constant mixing ratio [mol mol-1]": "constant_mixing_ratio",
  "is third body": "is_third_body",
};

/** Coerce an attribute value (string | number | empty) to a number with a default. */
const num = (value: unknown, fallback: number): number =>
  value === undefined || value === null || value === ""
    ? fallback
    : Number(value);

/** Read a reaction parameter value out of the reaction's attribute bag. */
const paramVal = (r: Reaction, key: string): unknown =>
  r.attributes[key]?.value;

/** Build a reaction attribute bag from a params record, dropping undefined. */
const attrsFromParams = (
  params: Record<string, number | number[] | string | undefined>,
): Reaction["attributes"] => {
  const attributes: Reaction["attributes"] = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    attributes[key] = { serializationKey: key, value };
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
    speciesId: c.name ?? "",
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
    const ea = paramVal(r, "Ea");
    return new reactionTypes.Arrhenius({
      name: r.name,
      A: num(paramVal(r, "A"), 1.0),
      B: num(paramVal(r, "B"), 0.0),
      // C and Ea are mutually exclusive (see chemistry-cafe PR #166).
      ...(ea !== undefined && ea !== ""
        ? { Ea: num(ea, 0) }
        : { C: num(paramVal(r, "C"), 0) }),
      D: num(paramVal(r, "D"), 300.0),
      E: num(paramVal(r, "E"), 0.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    });
  },

  fromMusica: (json) => ({
    id: generateFrontendID(),
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
      X: num(paramVal(r, "X"), 0),
      Y: num(paramVal(r, "Y"), 0),
      a0: num(paramVal(r, "a0"), 0),
      n: num(paramVal(r, "n"), 0),
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
    id: generateFrontendID(),
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
      scaling_factor: num(paramVal(r, SCALING_FACTOR_KEY), 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateFrontendID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Emission.type,
    gasPhaseId: json["gas phase"] ?? undefined,
    attributes: attrsFromParams({
      [SCALING_FACTOR_KEY]: json[SCALING_FACTOR_KEY],
    }),
    reactants: [],
    products: componentsFromJSON(json.products),
  }),
};

const PHOTOLYSIS: ReactionAdapter = {
  toMusica: (r, ctx) => {
    return new reactionTypes.Photolysis({
      name: r.name,
      scaling_factor: num(paramVal(r, SCALING_FACTOR_KEY), 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    });
  },

  fromMusica: (json) => {
    let obj = {
      id: generateFrontendID(),
      name: json.name ?? "",
      description: null,
      gasPhaseId: json["gas phase"] ?? undefined,
      type: reactionTypes.Photolysis.type,
      attributes: attrsFromParams({
        [SCALING_FACTOR_KEY]: json[SCALING_FACTOR_KEY],
      }),
      reactants: componentsFromJSON(json.reactants),
      products: componentsFromJSON(json.products),
    };
    return obj;
  },
};

const USER_DEFINED: ReactionAdapter = {
  toMusica: (r, ctx) => {
    return new reactionTypes.UserDefined({
      name: r.name,
      scaling_factor: num(paramVal(r, SCALING_FACTOR_KEY), 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    });
  },

  fromMusica: (json) => {
    let obj = {
      id: generateFrontendID(),
      name: json.name ?? "",
      description: null,
      gasPhaseId: json["gas phase"] ?? undefined,
      type: reactionTypes.UserDefined.type,
      attributes: attrsFromParams({
        [SCALING_FACTOR_KEY]: json[SCALING_FACTOR_KEY],
      }),
      reactants: componentsFromJSON(json.reactants),
      products: componentsFromJSON(json.products),
    };
    return obj;
  },
};

const FIRST_ORDER_LOSS: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.FirstOrderLoss({
      name: r.name,
      scaling_factor: num(paramVal(r, SCALING_FACTOR_KEY), 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
    }),

  fromMusica: (json) => ({
    id: generateFrontendID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.FirstOrderLoss.type,
    gasPhaseId: json["gas phase"] ?? undefined,
    attributes: attrsFromParams({
      [SCALING_FACTOR_KEY]: json[SCALING_FACTOR_KEY],
    }),
    reactants: componentsFromJSON(json.reactants),
    products: [],
  }),
};

const TROE: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.Troe({
      name: r.name,
      k0_A: num(paramVal(r, "k0_A"), 1.0),
      k0_B: num(paramVal(r, "k0_B"), 0.0),
      k0_C: num(paramVal(r, "k0_C"), 0.0),
      kinf_A: num(paramVal(r, "kinf_A"), 1.0),
      kinf_B: num(paramVal(r, "kinf_B"), 0.0),
      kinf_C: num(paramVal(r, "kinf_C"), 0.0),
      Fc: num(paramVal(r, "Fc"), 0.6),
      N: num(paramVal(r, "N"), 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateFrontendID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Troe.type,
    gasPhaseId: json["gas phase"] ?? undefined,
    attributes: attrsFromParams({
      k0_A: json.k0_A,
      k0_B: json.k0_B,
      k0_C: json.k0_C,
      kinf_A: json.kinf_A,
      kinf_B: json.kinf_B,
      kinf_C: json.kinf_C,
      Fc: json.Fc,
      N: json.N,
    }),
    reactants: componentsFromJSON(json.reactants),
    products: componentsFromJSON(json.products),
  }),
};

const TERNARY_CHEMICAL_ACTIVATION: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.TernaryChemicalActivation({
      name: r.name,
      k0_A: num(paramVal(r, "k0_A"), 1.0),
      k0_B: num(paramVal(r, "k0_B"), 0.0),
      k0_C: num(paramVal(r, "k0_C"), 0.0),
      kinf_A: num(paramVal(r, "kinf_A"), 1.0),
      kinf_B: num(paramVal(r, "kinf_B"), 0.0),
      kinf_C: num(paramVal(r, "kinf_C"), 0.0),
      Fc: num(paramVal(r, "Fc"), 0.6),
      N: num(paramVal(r, "N"), 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateFrontendID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.TernaryChemicalActivation.type,
    gasPhaseId: json["gas phase"] ?? undefined,
    attributes: attrsFromParams({
      k0_A: json.k0_A,
      k0_B: json.k0_B,
      k0_C: json.k0_C,
      kinf_A: json.kinf_A,
      kinf_B: json.kinf_B,
      kinf_C: json.kinf_C,
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
      A: num(paramVal(r, "A"), 1.0),
      B: num(paramVal(r, "B"), 0.0),
      C: num(paramVal(r, "C"), 0.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateFrontendID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Tunneling.type,
    gasPhaseId: json["gas phase"] ?? undefined,
    attributes: attrsFromParams({ A: json.A, B: json.B, C: json.C }),
    reactants: componentsFromJSON(json.reactants),
    products: componentsFromJSON(json.products),
  }),
};

const SURFACE: ReactionAdapter = {
  toMusica: (r, ctx) => {
    return new reactionTypes.Surface({
      name: r.name,
      reaction_probability: num(paramVal(r, "reaction probability"), 1.0),
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
      id: generateFrontendID(),
      name: json.name ?? "",
      description: null,
      type: reactionTypes.Surface.type,
      gasPhaseId: json["gas phase"] ?? undefined,
      attributes: attrsFromParams({
        "reaction probability": json["reaction probability"],
      }),
      reactants: [],
      products: componentsFromJSON(json["gas-phase products"], "gas-phase"),
      gasPhaseSpeciesId: json["gas-phase species"],
    };
  },
};

const TAYLOR_SERIES: ReactionAdapter = {
  toMusica: (r, ctx) => {
    const ea = paramVal(r, "Ea");
    return new reactionTypes.TaylorSeries({
      name: r.name,
      A: num(paramVal(r, "A"), 1.0),
      B: num(paramVal(r, "B"), 0.0),
      ...(ea !== undefined && ea !== ""
        ? { Ea: num(ea, 0) }
        : { C: num(paramVal(r, "C"), 0) }),
      D: num(paramVal(r, "D"), 300.0),
      E: num(paramVal(r, "E"), 0.0),
      taylor_coefficients: paramVal(r, "taylor_coefficients") as number[],
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    });
  },

  fromMusica: (json) => ({
    id: generateFrontendID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.TaylorSeries.type,
    attributes: attrsFromParams({
      A: json.A,
      B: json.B,
      ...(json.Ea !== undefined ? { Ea: json.Ea } : { C: json.C }),
      D: json.D,
      E: json.E,
      taylor_coefficients: json["taylor coefficients"] as number[],
    }),
    gasPhaseId: json["gas phase"] ?? undefined,
    reactants: componentsFromJSON(json.reactants),
    products: componentsFromJSON(json.products),
  }),
};

const REACTION_ADAPTERS: Partial<Record<ReactionTypeName, ReactionAdapter>> = {
  ARRHENIUS,
  BRANCHED_NO_RO2,
  EMISSION,
  PHOTOLYSIS,
  USER_DEFINED,
  FIRST_ORDER_LOSS,
  TROE,
  TERNARY_CHEMICAL_ACTIVATION,
  TUNNELING,
  SURFACE,
  TAYLOR_SERIES,
};

// ── species / phase mapping ──────────────────────────────────
function speciesToMusica(s: Species) {
  const params: Record<string, unknown> = { name: s.name };
  for (const attr of Object.values(s.attributes)) {
    if (attr.value === "") continue; // empty → omit
    const mapped = SPECIES_ATTR_TO_MUSICA[attr.serializationKey];
    if (mapped === "is_third_body") {
      // mech config defaults is_third_body to false, so only write when true.
      if (attr.value === "true" || attr.value === true) {
        params.is_third_body = true;
      }
    } else if (mapped) {
      params[mapped] = Number(attr.value);
    } else {
      // "other property": musica re-adds the `__` prefix on serialization, so
      // strip one leading `__` here to avoid doubling it.
      params[attr.serializationKey.replace(/^__/, "")] = attr.value;
    }
  }
  // musica's Species constructor accepts the four named params plus arbitrary
  // extras (routed to other_properties); the loose record is the honest input.
  return new types.Species(
    params as unknown as mechanismConfiguration.SpeciesParams,
  );
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

  const familyId = generateFrontendID();
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
  const nameToId = new Map<string, string>();
  for (const s of parsed.species) {
    const id = generateFrontendID();
    nameToId.set(s.name, id);
    family.species.push(speciesFromJSON(s, id, familyId));
  }

  // 2. phases — resolve member species names back to ids.
  const phaseToId = new Map<string, string>();
  for (const p of parsed.phases) {
    const id = generateFrontendID();
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
  id: string,
  familyId: string,
): Species {
  const species: Species = {
    id,
    name: String(s.name),
    description: null,
    familyId,
    attributes: {},
  };
  for (const [rawKey, value] of Object.entries(s)) {
    if (rawKey === "name") continue;
    if (
      typeof value !== "number" &&
      typeof value !== "string" &&
      typeof value !== "boolean"
    ) {
      continue;
    }
    // `__` is musica's serialization prefix for non-first-class properties;
    // strip it so the stored key matches the chemistry-cafe serializationKey.
    const key = rawKey.replace(/^__/, "");
    // SpeciesAttribute.value is number | string, so normalize booleans.
    const storedValue = typeof value === "boolean" ? String(value) : value;
    species.attributes[key] = { serializationKey: key, value: storedValue };
  }
  return species;
}

/** fromMusica stores species *names* in component.speciesId; rewrite to ids. */
function linkComponentIds(
  r: Reaction,
  nameToId: Map<string, string>,
): Reaction {
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

function linkPhaseIds(r: Reaction, nameToId: Map<string, string>) {
  return {
    ...r,
    gasPhaseId: r.gasPhaseId
      ? (nameToId.get(String(r.gasPhaseId)) ?? r.gasPhaseId)
      : undefined,
  };
}
