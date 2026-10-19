import { UUID } from "crypto";
import { Species } from "../types/chemistryModels";

export type EquationEntry = {
  speciesId: UUID;
  coefficient: number;
};

export type ParsedEquation = {
  reactants: Array<EquationEntry>;
  products: Array<EquationEntry>;
  /** Problems that stop the equation from being applied. Empty if none. */
  errors: Array<string>;
};

// The arrows that separate the reactants from the products.
const arrowPattern = /->|=>|→|=/;

const coefficientPattern = /^(\d+(?:\.\d+)?|\.\d+)\s*\*?\s*/;

type Term = { name: string; coefficient: number; length: number };

/**
 * Reads one term at the start of the text: an optional coefficient and the
 * longest known species name. A name can start with a digit, for example
 * "1-butene", so the name without a coefficient is tried first.
 */
function readTerm(text: string, names: Array<string>): Term | null {
  // A name must end where the term ends, so "NO3x" is not read as "NO".
  const matchAt = (rest: string) =>
    names.find(
      (n) => rest.startsWith(n) && /^(\s|\+|$)/.test(rest.slice(n.length)),
    );
  const name = matchAt(text);
  if (name) {
    return { name, coefficient: 1, length: name.length };
  }
  const coefficient = text.match(coefficientPattern);
  if (coefficient) {
    const rest = text.slice(coefficient[0].length);
    const named = matchAt(rest);
    if (named) {
      return {
        name: named,
        coefficient: Number(coefficient[1]),
        length: coefficient[0].length + named.length,
      };
    }
  }
  return null;
}

/**
 * Reads one side of an equation, for example "2 NO2 + OH". The terms are
 * separated by "+". A species name can contain "+", for example "H+", so the
 * names are matched against the known species, longest name first.
 */
function readSide(
  side: string,
  species: Array<Species>,
  names: Array<string>,
  errors: Array<string>,
): Array<EquationEntry> {
  const entries: Array<EquationEntry> = [];
  let text = side.trim();

  while (text.length > 0) {
    const term = readTerm(text, names);
    if (!term) {
      // The unknown text goes up to the next separator.
      const unknown = text.split(/\s*\+\s*/)[0].trim() || text;
      const coefficientFree = unknown.replace(coefficientPattern, "");
      const sameLetters = species.filter(
        (s) => s.name.toLowerCase() === coefficientFree.toLowerCase(),
      );
      errors.push(
        sameLetters.length === 1
          ? `Unknown species: ${coefficientFree} (did you mean ${sameLetters[0].name}?)`
          : `Unknown species: ${coefficientFree}`,
      );
      text = text.slice(unknown.length);
    } else {
      const found = species.find((s) => s.name === term.name)!;
      const existing = entries.find((e) => e.speciesId === found.id);
      if (existing) {
        // "NO2 + NO2" is the same as "2 NO2".
        existing.coefficient += term.coefficient;
      } else {
        entries.push({ speciesId: found.id, coefficient: term.coefficient });
      }
      text = text.slice(term.length);
    }

    text = text.trimStart();
    if (text.length === 0) {
      break;
    }
    if (!text.startsWith("+")) {
      errors.push(`Expected "+" before "${text}"`);
      break;
    }
    text = text.slice(1).trimStart();
    if (text.length === 0) {
      errors.push('Expected a species after "+"');
    }
  }
  return entries;
}

// The species names, longest first, so that "NO2" is not read as "NO" and
// "2".
const sortedNames = (species: Array<Species>) =>
  species
    .map((s) => s.name)
    .filter((name) => name.length > 0)
    .sort((a, b) => b.length - a.length);

/**
 * Reads an equation such as "2 NO2 + OH -> HNO3" against the species of a
 * family. It never creates species: a name that the family does not have is
 * an error. The arrow can be "->", "=>", "=", or "→".
 */
export function parseEquation(
  equation: string,
  species: Array<Species>,
): ParsedEquation {
  const errors: Array<string> = [];
  const names = sortedNames(species);

  if (equation.trim().length === 0) {
    return { reactants: [], products: [], errors: [] };
  }
  const sides = equation.split(arrowPattern);
  if (sides.length !== 2) {
    return {
      reactants: [],
      products: [],
      errors: [
        sides.length < 2
          ? 'Use "->" between the reactants and the products'
          : "Use only one arrow",
      ],
    };
  }

  const reactants = readSide(sides[0], species, names, errors);
  const products = readSide(sides[1], species, names, errors);
  return { reactants, products, errors };
}

/** Writes one side of an equation, for example "2 NO2 + OH". */
export const formatSide = (
  entries: Array<{ speciesId: string; coefficient: number }>,
  species: Array<Species>,
) =>
  entries
    .flatMap((entry) => {
      const found = species.find((s) => s.id === entry.speciesId);
      if (!found) {
        return [];
      }
      return [
        entry.coefficient === 1
          ? found.name
          : `${entry.coefficient} ${found.name}`,
      ];
    })
    .join(" + ");

/** Writes reactants and products as an equation, for example "2 NO2 -> N2O4". */
export function formatEquation(
  reactants: Array<{ speciesId: string; coefficient: number }>,
  products: Array<{ speciesId: string; coefficient: number }>,
  species: Array<Species>,
): string {
  const left = formatSide(reactants, species);
  const right = formatSide(products, species);
  if (left.length === 0 && right.length === 0) {
    return "";
  }
  return `${left} -> ${right}`.trim();
}

/**
 * Reads an equation with more than one product branch, for example
 * "NO + RO2 -> NO2 + RO | RONO2". The products of each branch are separated
 * by "|", in the order of the branches. Each product gets its branch.
 */
export function parseBranchedEquation(
  equation: string,
  species: Array<Species>,
  branches: Array<string>,
): {
  reactants: Array<EquationEntry>;
  products: Array<EquationEntry & { branch: string }>;
  errors: Array<string>;
} {
  if (equation.trim().length === 0) {
    return { reactants: [], products: [], errors: [] };
  }
  const sides = equation.split(arrowPattern);
  if (sides.length !== 2) {
    return {
      reactants: [],
      products: [],
      errors: [
        sides.length < 2
          ? 'Use "->" between the reactants and the products'
          : "Use only one arrow",
      ],
    };
  }
  const groups = sides[1].split("|");
  if (groups.length > branches.length) {
    return {
      reactants: [],
      products: [],
      errors: [
        `Use "|" only between the ${branches.length} product branches (${branches.join(" | ")})`,
      ],
    };
  }

  const errors: Array<string> = [];
  const names = sortedNames(species);
  const reactants = readSide(sides[0], species, names, errors);
  const products = groups.flatMap((group, index) =>
    readSide(group, species, names, errors).map((entry) => ({
      ...entry,
      branch: branches[index],
    })),
  );
  return { reactants, products, errors };
}

/**
 * Writes reactants and products with more than one product branch, for
 * example "NO + RO2 -> NO2 + RO | RONO2". A product with a missing or
 * unknown branch is in the first branch.
 */
export function formatBranchedEquation(
  reactants: Array<{ speciesId: string; coefficient: number }>,
  products: Array<{ speciesId: string; coefficient: number; branch?: string }>,
  species: Array<Species>,
  branches: Array<string>,
): string {
  const branchOf = (branch?: string) =>
    branch && branches.includes(branch) ? branch : branches[0];
  const groups = branches.map((branch) =>
    formatSide(
      products.filter((product) => branchOf(product.branch) === branch),
      species,
    ),
  );
  const left = formatSide(reactants, species);
  if (left.length === 0 && groups.every((group) => group.length === 0)) {
    return "";
  }
  // An empty branch leaves no extra space, for example "OH -> | HNO3".
  const right = groups.join(" | ").replace(/\s+/g, " ").trim();
  return `${left} -> ${right}`.trim();
}
