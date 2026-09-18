// Generates seed.json from the v1 configs in ./configs, grouped into families.
// Plain Node (no deps): reads normalized v1 configs, maps wire keys to the
// backend seed shape, and merges each family's configs (dedup species/phases
// by name, one mechanism per config). Run: `node generate-seed.mjs`.
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

function speciesToSeed(s) {
  const seed = { name: s.name };
  const otherProperties = {};
  for (const [key, value] of Object.entries(s)) {
    if (key === "name") continue;
    const field = SPECIES_FIELDS[key];
    if (field) {
      seed[field] = value;
    } else if (key.startsWith("__")) {
      otherProperties[key.replace(/^__/, "")] = value;
    }
  }
  if (Object.keys(otherProperties).length) seed.otherProperties = otherProperties;
  return seed;
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
  if (r["gas phase"]) seed.gasPhase = r["gas phase"];
  if (r["gas-phase species"]) seed.gasPhaseSpecies = componentName(r["gas-phase species"]);
  if (Object.keys(params).length > 0) seed[paramConfig.seedField] = params;
  return seed;
}

function buildFamily(name, keys) {
  const speciesByName = new Map(); // name -> seed species
  const phaseByName = new Map(); // name -> { name, species: Set }
  const mechanisms = [];

  for (const key of keys) {
    const config = JSON.parse(readFileSync(join(configsDir, key, "config.json"), "utf8"));

    for (const s of config.species ?? []) {
      if (!speciesByName.has(s.name)) speciesByName.set(s.name, speciesToSeed(s));
    }

    const mechPhases = [];
    for (const p of config.phases ?? []) {
      const members = (p.species ?? []).map(componentName);
      if (!phaseByName.has(p.name)) phaseByName.set(p.name, { name: p.name, species: new Set() });
      const entry = phaseByName.get(p.name);
      for (const m of members) entry.species.add(m);
      mechPhases.push(p.name);
    }

    const reactions = (config.reactions ?? []).map((r, i) => reactionToSeed(r, i));

    mechanisms.push({
      name: key,
      species: (config.species ?? []).map((s) => s.name),
      phases: mechPhases,
      reactions,
    });
  }

  return {
    name,
    species: [...speciesByName.values()],
    phases: [...phaseByName.values()].map((p) => ({ name: p.name, species: [...p.species] })),
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
