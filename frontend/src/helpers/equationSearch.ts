import { Reaction, Species } from "../types/chemistryModels";

// Removes the spaces and gives one form of the arrow, so that "NO2+OH",
// "NO2 + OH", and "NO2 + OH → HNO3" can be compared.
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/→|=>|=/g, "->");

// Gives the species names of one side of a search. A leading coefficient,
// for example the 2 in "2NO2", is removed.
const searchTerms = (side: string) =>
  side
    .split("+")
    .map((term) => term.replace(/^\d*\.?\d+(?=\D)/, ""))
    .filter((term) => term.length > 0);

const speciesNames = (
  entries: Array<{ speciesId: string }>,
  species: Array<Species>,
) =>
  entries.flatMap((entry) => {
    const found = species.find((s) => s.id === entry.speciesId);
    return found ? [found.name.toLowerCase().replace(/\s+/g, "")] : [];
  });

// Each term must equal one of the names. The last term of the search can be
// the start of a name, so the search finds species while the user types.
const allTermsMatch = (
  terms: Array<string>,
  names: Array<string>,
  lastIsPartial: boolean,
) =>
  terms.every((term, index) =>
    names.some((name) =>
      lastIsPartial && index === terms.length - 1
        ? name.startsWith(term)
        : name === term,
    ),
  );

/**
 * Tells if a search matches the equation of a reaction. The search can be a
 * part of an equation with or without spaces, in any species order, for
 * example "NO2+OH", "OH + NO2", "2NO2", or "NO2 + OH -> HNO3". With an arrow,
 * the left side matches the reactants and the right side the products. The
 * last species of the search can be incomplete, for example "NO2+O".
 */
export function equationMatchesSearch(
  search: string,
  reaction: Reaction,
  species: Array<Species>,
): boolean {
  const query = normalize(search);
  if (query.length === 0) {
    return true;
  }
  const reactants = speciesNames(reaction.reactants, species);
  const products = speciesNames(reaction.products, species);

  if (query.includes("->")) {
    const [left, right] = query.split("->", 2);
    return (
      allTermsMatch(searchTerms(left), reactants, false) &&
      allTermsMatch(searchTerms(right), products, true)
    );
  }
  return allTermsMatch(searchTerms(query), [...reactants, ...products], true);
}
