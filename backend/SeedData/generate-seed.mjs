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

// reaction keys that are structural (not free attributes)
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

  const numericalAttributes = {};
  const stringAttributes = {};
  for (const [key, value] of Object.entries(r)) {
    if (REACTION_STRUCTURAL.has(key)) continue;
    if (typeof value === "number") numericalAttributes[key] = value;
    else if (typeof value === "string") stringAttributes[key] = value;
    else throw new Error(`Unhandled reaction attribute type for "${key}" (${typeof value})`);
  }

  const seed = {
    name: r.name ?? `reaction-${index}`,
    type: r.type,
    reactants,
    products,
    numericalAttributes,
    stringAttributes,
  };
  if (r["gas phase"]) seed.gasPhase = r["gas phase"];
  if (r["gas-phase species"]) seed.gasPhaseSpecies = componentName(r["gas-phase species"]);
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
