// Generates seed.json from the v1 configs in ./configs, grouped into families.
// Plain Node (no deps): reads normalized v1 configs, maps wire keys to the
// backend seed shape, and merges each family's configs (dedup species/phases
// by name, one mechanism per config). Run: `node generate-seed.mjs`.
//
// Other properties: any key starting with "__" on a species, phase, reaction
// or mechanism (the config's top-level object) is carried into that entity's
// seed `otherProperties`, with the "__" prefix removed. Values are copied
// as-is, so nested objects and arrays are kept, not only scalars.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const configsDir = join(here, "configs");

// family name -> config directory keys (order = mechanism order)
const FAMILIES = {
  Mozart: ["chapman", "ts1"],
  Test: ["analytical", "robertson", "oregonator", "hires"],
};

// wire species key -> seed species field
const SPECIES_FIELDS = {
  "molecular weight [kg mol-1]": "molecularWeight",
  "absolute tolerance": "absoluteTolerance",
  "constant concentration [mol m-3]": "constantConcentration",
  "constant mixing ratio [mol mol-1]": "constantMixingRatio",
  "is third body": "isThirdBody",
};

// reaction keys that are structural (not dedicated-table parameters)
const REACTION_STRUCTURAL = new Set([
  "type",
  "name",
  "reactants",
  "products",
  "gas phase",
  "gas-phase species",
  "gas-phase products",
  "aerosol phase",
  "aerosol-phase species",
  "aerosol-phase water",
  "nitrate products",
  "alkoxy products",
]);

// reaction type -> { seed field on SeedReaction, wire key -> DTO field }.
// Every reaction type has its own dedicated parameter table (#268); this
// mirrors the backend's ReactionMapper/backendInteractions.ts translation.
const REACTION_PARAM_FIELDS = {
  ARRHENIUS: {
    seedField: "arrhenius",
    fields: { A: "a", B: "b", C: "c", Ea: "ea", D: "d", E: "e" },
  },
  TUNNELING: {
    seedField: "tunneling",
    fields: { A: "a", B: "b", C: "c" },
  },
  TROE: {
    seedField: "troe",
    fields: {
      k0_A: "k0A",
      k0_B: "k0B",
      k0_C: "k0C",
      kinf_A: "kinfA",
      kinf_B: "kinfB",
      kinf_C: "kinfC",
      Fc: "fc",
      N: "n",
    },
  },
  TERNARY_CHEMICAL_ACTIVATION: {
    seedField: "ternaryChemicalActivation",
    fields: {
      k0_A: "k0A",
      k0_B: "k0B",
      k0_C: "k0C",
      kinf_A: "kinfA",
      kinf_B: "kinfB",
      kinf_C: "kinfC",
      Fc: "fc",
      N: "n",
    },
  },
  BRANCHED_NO_RO2: {
    seedField: "branched",
    fields: { X: "x", Y: "y", a0: "a0", n: "n" },
  },
  TAYLOR_SERIES: {
    seedField: "taylorSeries",
    fields: {
      A: "a",
      B: "b",
      C: "c",
      Ea: "ea",
      D: "d",
      E: "e",
      "taylor coefficients": "taylorCoefficients",
    },
  },
  SURFACE: {
    seedField: "surface",
    fields: { "reaction probability": "reactionProbability" },
  },
  EMISSION: {
    seedField: "emission",
    fields: { "scaling factor": "scalingFactor" },
  },
  FIRST_ORDER_LOSS: {
    seedField: "firstOrderLoss",
    fields: { "scaling factor": "scalingFactor" },
  },
  PHOTOLYSIS: {
    seedField: "photolysis",
    fields: { "scaling factor": "scalingFactor" },
  },
  USER_DEFINED: {
    seedField: "userDefined",
    fields: { "scaling factor": "scalingFactor" },
  },
};

const OTHER_PROPERTY_PREFIX = "__";

// The "__" keys of a config object, prefix stripped, values untouched.
function collectOtherProperties(source) {
  return Object.fromEntries(
    Object.entries(source)
      .filter(([key]) => key.startsWith(OTHER_PROPERTY_PREFIX))
      .map(([key, value]) => [key.slice(OTHER_PROPERTY_PREFIX.length), value]),
  );
}

// Sets seed.otherProperties from the source's "__" keys; omitted when none.
function withOtherProperties(seed, source) {
  const otherProperties = collectOtherProperties(source);
  if (Object.keys(otherProperties).length > 0) seed.otherProperties = otherProperties;
  return seed;
}

function speciesToSeed(s) {
  const seed = { name: s.name };
  for (const [key, value] of Object.entries(s)) {
    if (key === "name") continue;
    const field = SPECIES_FIELDS[key];
    if (field) seed[field] = value;
  }
  return withOtherProperties(seed, s);
}

const componentName = (c) => (typeof c === "string" ? c : c.name);

function reactionToSeed(r, index) {
  const reactants = (r.reactants ?? []).map((c) => ({
    name: componentName(c),
    coefficient: c.coefficient ?? 1,
  }));
  const products = (r.products ?? []).map((c) => ({
    name: componentName(c),
    coefficient: c.coefficient ?? 1,
  }));
  // SURFACE emits its products under "gas-phase products" with a branch
  for (const c of r["gas-phase products"] ?? []) {
    products.push({ name: componentName(c), coefficient: c.coefficient ?? 1, branch: "gas-phase" });
  }

  const paramConfig = REACTION_PARAM_FIELDS[r.type];
  if (!paramConfig) {
    throw new Error(`Unknown reaction type "${r.type}" - no dedicated parameter mapping`);
  }

  const params = {};
  for (const [key, value] of Object.entries(r)) {
    if (REACTION_STRUCTURAL.has(key)) continue;
    if (key.startsWith(OTHER_PROPERTY_PREFIX)) continue; // kept as otherProperties below
    const dtoField = paramConfig.fields[key];
    if (!dtoField) {
      throw new Error(`Unhandled reaction attribute "${key}" for type "${r.type}"`);
    }
    params[dtoField] = value;
  }

  const seed = {
    name: r.name ?? `reaction-${index}`,
    type: r.type,
    reactants,
    products,
  };
  seed.gasPhase = r["gas phase"] ?? "gas";
  if (r["gas-phase species"]) seed.gasPhaseSpecies = componentName(r["gas-phase species"]);
  if (Object.keys(params).length > 0) seed[paramConfig.seedField] = params;
  return withOtherProperties(seed, r);
}

function buildFamily(name, keys) {
  const speciesByName = new Map(); // name -> seed species
  const phaseByName = new Map(); // name -> { name, species: Set, diffusionCoefficients: Map, otherProperties: Map }
  const mechanisms = [];

  for (const key of keys) {
    const config = JSON.parse(readFileSync(join(configsDir, key, "config.json"), "utf8"));

    for (const s of config.species ?? []) {
      if (!speciesByName.has(s.name)) speciesByName.set(s.name, speciesToSeed(s));
    }

    const mechPhases = [];
    for (const p of config.phases ?? []) {
      if (!phaseByName.has(p.name)) {
        phaseByName.set(p.name, {
          name: p.name,
          species: new Set(),
          diffusionCoefficients: new Map(),
          otherProperties: new Map(),
        });
      }
      const entry = phaseByName.get(p.name);
      // like diffusion coefficients, the first config to define a key wins
      for (const [key, value] of Object.entries(collectOtherProperties(p))) {
        if (!entry.otherProperties.has(key)) entry.otherProperties.set(key, value);
      }
      for (const member of p.species ?? []) {
        const memberName = componentName(member);
        entry.species.add(memberName);
        const coefficient = member["diffusion coefficient [m2 s-1]"];
        if (coefficient !== undefined && !entry.diffusionCoefficients.has(memberName)) {
          entry.diffusionCoefficients.set(memberName, coefficient);
        }
      }
      mechPhases.push(p.name);
    }

    const reactions = (config.reactions ?? []).map((r, i) => reactionToSeed(r, i));

    mechanisms.push(
      withOtherProperties(
        {
          name: key,
          species: (config.species ?? []).map((s) => s.name),
          phases: mechPhases,
          reactions,
        },
        config,
      ),
    );
  }

  return {
    name,
    species: [...speciesByName.values()],
    phases: [...phaseByName.values()].map((p) => ({
      name: p.name,
      species: [...p.species],
      ...(p.diffusionCoefficients.size > 0 && {
        diffusionCoefficients: Object.fromEntries(p.diffusionCoefficients),
      }),
      ...(p.otherProperties.size > 0 && {
        otherProperties: Object.fromEntries(p.otherProperties),
      }),
    })),
    mechanisms,
  };
}

const seed = {
  families: Object.entries(FAMILIES).map(([name, keys]) => buildFamily(name, keys)),
};

writeFileSync(join(here, "seed.json"), JSON.stringify(seed, null, 2) + "\n");

for (const f of seed.families) {
  console.log(
    `${f.name}: ${f.species.length} species, ${f.phases.length} phases, ` +
      `${f.mechanisms.length} mechanisms (${f.mechanisms.map((m) => `${m.name}:${m.reactions.length}rx`).join(", ")})`,
  );
}
