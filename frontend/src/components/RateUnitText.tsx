import { Fragment } from "react";
import { genericRateUnitExponent, RateUnits } from "../helpers/rateUnits";

/**
 * Renders a unit such as "cm3 molecule-1 s-1" inline, with the exponents as
 * superscripts.
 */
export const UnitText = ({ units }: { units: string }) => (
  <span>
    {units.split(/\s+/).map((unit, index) => {
      const [base, exponent] = unit.split(/(-?[0-9]+)$/);
      return (
        <Fragment key={`${unit}-${index}`}>
          {index > 0 && " "}
          {base}
          {exponent && <sup>{exponent}</sup>}
        </Fragment>
      );
    })}
  </span>
);

/**
 * Renders the unit of a rate parameter before the reactants are known, for
 * example (cm3 molecule-1)^(n-1) s-1.
 */
export const GenericRateUnit = ({
  rateUnits,
  offset,
}: {
  rateUnits: RateUnits;
  offset: number;
}) => {
  const [volume, amount] =
    rateUnits === "Molecule" ? ["cm", "molecule"] : ["m", "mol"];
  return (
    <span>
      ({volume}
      <sup>3</sup> {amount}
      <sup>-1</sup>)<sup>{genericRateUnitExponent(offset)}</sup> s<sup>-1</sup>
    </span>
  );
};
