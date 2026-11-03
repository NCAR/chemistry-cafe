import { Fragment } from "react";
import {
  Reaction,
  reactionConfigurations,
  Species,
} from "../types/chemistryModels";

/**
 * Renders a species name with the digits after a letter or a parenthesis as
 * subscripts, for example NO2 as NO₂ and Ca(OH)2 as Ca(OH)₂.
 */
export const SpeciesName = ({ name }: { name: string }) => (
  <>
    {name
      .split(/(?<=[A-Za-z)])(\d+)/)
      .map((part, index) =>
        index % 2 === 1 ? (
          <sub key={index}>{part}</sub>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
  </>
);

type SideProps = {
  entries: Array<{ speciesId: string; coefficient: number }>;
  species: Array<Species>;
};

const EquationSide = ({ entries, species }: SideProps) => {
  const named = entries.flatMap((entry) => {
    const found = species.find((s) => s.id === entry.speciesId);
    return found ? [{ ...entry, name: found.name }] : [];
  });
  if (named.length === 0) {
    return <>&lt;none&gt;</>;
  }
  return (
    <>
      {named.map((entry, index) => (
        <Fragment key={`${entry.speciesId}-${index}`}>
          {index > 0 && " + "}
          {entry.coefficient !== 1 && `${entry.coefficient} `}
          <SpeciesName name={entry.name} />
        </Fragment>
      ))}
    </>
  );
};

// The products of each branch of a type with more than one branch, for
// example the alkoxy and nitrate products of a branched reaction. A product
// with a missing or unknown branch is in the first branch.
const productsByBranch = (reaction: Reaction) => {
  const branches = reactionConfigurations[reaction.type]?.branches ?? [];
  if (branches.length < 2) {
    return null;
  }
  const branchOf = (branch?: string) =>
    branch && branches.includes(branch) ? branch : branches[0];
  return branches
    .map((branch) => ({
      branch,
      products: reaction.products.filter(
        (product) => branchOf(product.branch) === branch,
      ),
    }))
    .filter((group) => group.products.length > 0);
};

export const reactionReactants = (
  reaction: Reaction,
): Array<{ speciesId: string; coefficient: number }> => {
  if (reaction.reactants.length > 0) {
    return reaction.reactants;
  }
  if (reaction.gasPhaseSpeciesId) {
    return [{ speciesId: reaction.gasPhaseSpeciesId, coefficient: 1 }];
  }
  return [];
};

/**
 * Renders a reaction as a chemical equation, for example OH + NO₂ → HNO₃. A
 * type with more than one product branch shows each branch with its label,
 * for example NO + RO₂ → NO₂ + RO (alkoxy) | RONO₂ (nitrate).
 */
export const EquationText = ({
  reaction,
  species,
}: {
  reaction: Reaction;
  species: Array<Species>;
}) => {
  const groups = productsByBranch(reaction);
  return (
    <>
      <EquationSide entries={reactionReactants(reaction)} species={species} />
      {" → "}
      {groups && groups.length > 0 ? (
        groups.map((group, index) => (
          <Fragment key={group.branch}>
            {index > 0 && " | "}
            <EquationSide entries={group.products} species={species} /> (
            {group.branch})
          </Fragment>
        ))
      ) : (
        <EquationSide entries={reaction.products} species={species} />
      )}
    </>
  );
};
