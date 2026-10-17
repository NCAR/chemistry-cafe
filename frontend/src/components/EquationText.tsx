import { Fragment } from "react";
import { Reaction, Species } from "../types/chemistryModels";

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

/** Renders a reaction as a chemical equation, for example OH + NO₂ → HNO₃. */
export const EquationText = ({
  reaction,
  species,
}: {
  reaction: Reaction;
  species: Array<Species>;
}) => (
  <>
    <EquationSide entries={reaction.reactants} species={species} />
    {" → "}
    <EquationSide entries={reaction.products} species={species} />
  </>
);
