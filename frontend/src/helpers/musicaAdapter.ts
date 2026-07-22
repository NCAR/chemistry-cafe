import { mechanismConfiguration } from "@ncar/musica";
import { Product, Reactant, ReactionTypeName } from "../types/chemistryModels";
import { generateFrontendID } from "./localFamilies";

/* Wrap @ncar/musica types for use in chemistry cafe
 *
 * import/export is now done by the musica library
 * on import, chemistry cafe IDs are added
 */

const { types, reactionTypes, Mechanism } = mechanismConfiguration;

// A musica reaction is any of the concrete reaction-rate class instances.
// Derived from the runtime registry so it stays in lockstep with reactionTypes.
type MusicaReaction = InstanceType<
  (typeof reactionTypes)[keyof typeof reactionTypes]
>;

const V1_VERSION = "1.0.0";
const MOLECULAR_WEIGHT_KEY = "molecular weight [kg mol-1]";

/** Coerce an editable param (string | number | empty) to a number with a default. */
const num = (value: unknown, fallback: number): number =>
  value === undefined || value === null || value === ""
    ? fallback
    : Number(value);

// types for exporting
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
  toMusica: (reaction: EditableReaction, ctx: ExportCtx) => MusicaReaction;
  fromMusica: (json: Record<string, any>) => EditableReaction;
};

const ARRHENIUS: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.Arrhenius({
      name: r.name,
      A: num(r.params.A, 1.0),
      B: num(r.params.B, 0.0),
      // C and Ea are mutually exclusive (see chemistry-cafe PR #166).
      ...(r.params.Ea !== undefined && r.params.Ea !== ""
        ? { Ea: num(r.params.Ea, 0) }
        : { C: num(r.params.C, 0) }),
      D: num(r.params.D, 300.0),
      E: num(r.params.E, 0.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateFrontendID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Arrhenius.type,
    params: {
      A: json.A,
      B: json.B,
      ...(json.Ea !== undefined ? { Ea: json.Ea } : { C: json.C }),
      D: json.D,
      E: json.E,
    },
    reactants: componentsFromJSON(json.reactants),
    products: componentsFromJSON(json.products),
  }),
};

const BRANCHED_NO_RO2: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.Branched({
      name: r.name,
      X: num(r.params.X, 0),
      Y: num(r.params.Y, 0),
      a0: num(r.params.a0, 0),
      n: num(r.params.n, 0),
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
    params: { X: json.X, Y: json.Y, a0: json.a0, n: json.n },
    reactants: componentsFromJSON(json.reactants),
    products: [
      ...componentsFromJSON(json["nitrate products"], "nitrate"),
      ...componentsFromJSON(json["alkoxy products"], "alkoxy"),
    ],
  }),
};

const SCALING_FACTOR_KEY = "scaling factor";

const EMISSION: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.Emission({
      name: r.name,
      scaling_factor: num(r.params[SCALING_FACTOR_KEY], 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateFrontendID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Emission.type,
    params: { [SCALING_FACTOR_KEY]: json[SCALING_FACTOR_KEY] },
    reactants: [],
    products: componentsFromJSON(json.products),
  }),
};

const PHOTOLYSIS: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.Photolysis({
      name: r.name,
      scaling_factor: num(r.params[SCALING_FACTOR_KEY], 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateFrontendID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Photolysis.type,
    params: { [SCALING_FACTOR_KEY]: json[SCALING_FACTOR_KEY] },
    reactants: componentsFromJSON(json.reactants),
    products: componentsFromJSON(json.products),
  }),
};

const FIRST_ORDER_LOSS: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.FirstOrderLoss({
      name: r.name,
      scaling_factor: num(r.params[SCALING_FACTOR_KEY], 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
    }),

  fromMusica: (json) => ({
    id: generateFrontendID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.FirstOrderLoss.type,
    params: { [SCALING_FACTOR_KEY]: json[SCALING_FACTOR_KEY] },
    reactants: componentsFromJSON(json.reactants),
    products: [],
  }),
};

const TROE: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.Troe({
      name: r.name,
      k0_A: num(r.params.k0_A, 1.0),
      k0_B: num(r.params.k0_B, 0.0),
      k0_C: num(r.params.k0_C, 0.0),
      kinf_A: num(r.params.kinf_A, 1.0),
      kinf_B: num(r.params.kinf_B, 0.0),
      kinf_C: num(r.params.kinf_C, 0.0),
      Fc: num(r.params.Fc, 0.6),
      N: num(r.params.N, 1.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateFrontendID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Troe.type,
    params: {
      k0_A: json.k0_A,
      k0_B: json.k0_B,
      k0_C: json.k0_C,
      kinf_A: json.kinf_A,
      kinf_B: json.kinf_B,
      kinf_C: json.kinf_C,
      Fc: json.Fc,
      N: json.N,
    },
    reactants: componentsFromJSON(json.reactants),
    products: componentsFromJSON(json.products),
  }),
};

// TUNNELING: Wigner tunneling correction — A/B/C params, reactants + products.
const TUNNELING: ReactionAdapter = {
  toMusica: (r, ctx) =>
    new reactionTypes.Tunneling({
      name: r.name,
      A: num(r.params.A, 1.0),
      B: num(r.params.B, 0.0),
      C: num(r.params.C, 0.0),
      gas_phase: r.gasPhaseId ? ctx.phaseName(String(r.gasPhaseId)) : undefined,
      reactants: componentsToMusica(r.reactants, ctx),
      products: componentsToMusica(r.products, ctx),
    }),

  fromMusica: (json) => ({
    id: generateFrontendID(),
    name: json.name ?? "",
    description: null,
    type: reactionTypes.Tunneling.type,
    params: { A: json.A, B: json.B, C: json.C },
    reactants: componentsFromJSON(json.reactants),
    products: componentsFromJSON(json.products),
  }),
};

const REACTION_ADAPTERS: Partial<Record<ReactionTypeName, ReactionAdapter>> = {
  ARRHENIUS,
  BRANCHED_NO_RO2,
  EMISSION,
  PHOTOLYSIS,
  FIRST_ORDER_LOSS,
  TROE,
  TUNNELING,
};

// ── species / phase mapping ──────────────────────────────────
function speciesToMusica(s: EditableSpecies) {
  const attrs = Object.values(s.attributes);
  const molecularWeight = attrs.find(
    (a) => a.serializationKey === MOLECULAR_WEIGHT_KEY,
  );
  // Everything other than the named field falls through to other_properties.
  const rest = Object.fromEntries(
    attrs
      .filter((a) => a.serializationKey !== MOLECULAR_WEIGHT_KEY)
      .map((a) => [a.serializationKey, a.value]),
  );
  return new types.Species({
    name: s.name,
    // musica types molecular_weight as a number; the editable attribute bag
    // stores it as string | number, so coerce (empty -> omit).
    molecular_weight:
      molecularWeight && molecularWeight.value !== ""
        ? Number(molecularWeight.value)
        : undefined,
    ...rest,
  });
}

function phaseToMusica(p: EditablePhase, ctx: ExportCtx) {
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
 * Serialize one mechanism of a family to a V1 JSON string by building the
 * canonical musica objects and having musica serialize the mechanism
 * @throws if the mechanism contains a reaction type without a registry entry.
 */
export function serializeMechanism(
  mech: EditableMechanism,
  family: EditableFamily,
): string {
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

  const musicaMechanism = new Mechanism({
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

  return musicaMechanism.getString();
}

/**
 * Build a new EditableFamily (with one mechanism's worth of data) from a
 * parsed V1 object
 * @throws if the object is missing the required top-level arrays.
 */
export function deserializeMechanism(
  parsed: Record<string, any>,
): EditableFamily {
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
  const family: EditableFamily = {
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
  for (const p of parsed.phases) {
    family.phases.push({
      id: generateFrontendID(),
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
    family.reactions.push(linkComponentIds(adapter.fromMusica(r), nameToId));
  }

  return family;
}

function speciesFromJSON(
  s: Record<string, unknown>,
  id: string,
  familyId: string,
): EditableSpecies {
  const species: EditableSpecies = {
    id,
    name: String(s.name),
    description: null,
    familyId,
    attributes: {},
  };
  for (const [key, value] of Object.entries(s)) {
    if (key === "name") continue;
    if (typeof value !== "number" && typeof value !== "string") continue;
    species.attributes[key] = { serializationKey: key, value };
  }
  return species;
}

/** fromMusica stores species *names* in component.speciesId; rewrite to ids. */
function linkComponentIds(
  r: EditableReaction,
  nameToId: Map<string, string>,
): EditableReaction {
  const toId = (speciesId: Reactant["speciesId"]) =>
    nameToId.get(String(speciesId)) ?? speciesId;
  return {
    ...r,
    reactants: r.reactants.map((c) => ({ ...c, speciesId: toId(c.speciesId) })),
    products: r.products.map((c) => ({ ...c, speciesId: toId(c.speciesId) })),
  };
}
