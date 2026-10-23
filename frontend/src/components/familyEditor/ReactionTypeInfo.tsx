import { Fragment, ReactNode } from "react";
import { Box, Link, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  Reaction,
  reactionAttributeOptions,
  ReactionTypeName,
  Species,
} from "../../types/chemistryModels";
import { reactionTypeToString } from "../../helpers/stringify";
import {
  parameterOrder,
  rateUnitLabel,
  rateUnitParameters,
  RateUnits,
  reactionOrder,
} from "../../helpers/rateUnits";
import {
  ActivationParameter,
  showsAttribute,
} from "../../helpers/activationEnergy";
import { GenericRateUnit, UnitText } from "../RateUnitText";
import { EquationText } from "../EquationText";

const docsUrl =
  "https://mechanismconfiguration.readthedocs.io/en/latest/v1/reactions";

/** The page of each reaction type in the MechanismConfiguration docs. */
export const reactionTypeDocs: Record<ReactionTypeName, string> = {
  ARRHENIUS: `${docsUrl}/arrhenius.html`,
  BRANCHED_NO_RO2: `${docsUrl}/branched.html`,
  EMISSION: `${docsUrl}/emission.html`,
  FIRST_ORDER_LOSS: `${docsUrl}/first_order_loss.html`,
  PHOTOLYSIS: `${docsUrl}/photolysis.html`,
  SURFACE: `${docsUrl}/surface.html`,
  TAYLOR_SERIES: `${docsUrl}/taylor_series.html`,
  TERNARY_CHEMICAL_ACTIVATION: `${docsUrl}/ternary_chemical_activation.html`,
  TROE: `${docsUrl}/troe.html`,
  TUNNELING: `${docsUrl}/tunneling.html`,
  USER_DEFINED: `${docsUrl}/user_defined.html`,
};

const arrhenius = String.raw`A\,e^{-E_a/(k_B T)}\left(\frac{T}{D}\right)^{B}(1 + E\,P)`;
const falloff = String.raw`F_c^{\left(1+\frac{1}{N}\left[\log_{10}(k_0[\mathrm{M}]/k_\infty)\right]^2\right)^{-1}}`;
const falloffLimits = String.raw`k_0 = k_{0,A}\,e^{k_{0,C}/T}\left(\frac{T}{300}\right)^{k_{0,B}},\; k_\infty = k_{\infty,A}\,e^{k_{\infty,C}/T}\left(\frac{T}{300}\right)^{k_{\infty,B}}`;

/**
 * The rate constant formula of each reaction type in LaTeX, as in the
 * MechanismConfiguration docs. Each entry is one or more formulas.
 */
const rateFormulas: Record<ReactionTypeName, Array<string>> = {
  ARRHENIUS: [String.raw`k = ${arrhenius}`],
  BRANCHED_NO_RO2: [
    String.raw`k_{\text{nitrate}} = X e^{-Y/T}\,\frac{A(T,[\mathrm{M}],n)}{A(T,[\mathrm{M}],n) + Z}`,
    String.raw`k_{\text{alkoxy}} = X e^{-Y/T}\,\frac{Z}{Z + A(T,[\mathrm{M}],n)}`,
  ],
  EMISSION: [
    String.raw`\text{rate} = \text{scaling factor} \cdot \text{emission rate}`,
  ],
  FIRST_ORDER_LOSS: [
    String.raw`k = \text{scaling factor} \cdot k_{\text{loss}}`,
  ],
  PHOTOLYSIS: [String.raw`k = \text{scaling factor} \cdot j`],
  SURFACE: [String.raw`k = \frac{4 N_a \pi r_e^2}{r_e/D_g + 4/(v(T)\,\gamma)}`],
  TAYLOR_SERIES: [String.raw`k = ${arrhenius} + \sum_i C_i T^i`],
  TERNARY_CHEMICAL_ACTIVATION: [
    String.raw`k = \frac{k_0}{1 + k_0[\mathrm{M}]/k_\infty}\,${falloff}`,
    falloffLimits,
  ],
  TROE: [
    String.raw`k = \frac{k_0[\mathrm{M}]}{1 + k_0[\mathrm{M}]/k_\infty}\,${falloff}`,
    falloffLimits,
  ],
  TUNNELING: [String.raw`k = A\,e^{-B/T}\,e^{C/T^3}`],
  USER_DEFINED: [String.raw`k = \text{scaling factor} \cdot k_{\text{user}}`],
};

/** Renders a LaTeX formula. The formulas are fixed strings in this file. */
const Formula = ({ tex }: { tex: string }) => (
  <Box
    component="span"
    dangerouslySetInnerHTML={{
      __html: katex.renderToString(tex, { throwOnError: false }),
    }}
  />
);

/**
 * Shows the rate constant formula of a reaction type in small gray text, with
 * a link to its docs.
 */
export const RateConstantFormula = ({ type }: { type: ReactionTypeName }) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      columnGap: 3,
      rowGap: 0.5,
      color: "text.secondary",
      "& .katex": { fontSize: "0.9em" },
    }}
  >
    {rateFormulas[type].map((tex) => (
      <Formula key={tex} tex={tex} />
    ))}
    <Link
      href={reactionTypeDocs[type]}
      target="_blank"
      rel="noopener noreferrer"
      variant="caption"
      sx={{ display: "inline-flex", alignItems: "center", columnGap: 0.5 }}
    >
      Documentation
      <OpenInNewIcon fontSize="inherit" />
    </Link>
  </Box>
);

type ReactionTypeInfoProps = {
  type: ReactionTypeName;
  rateUnits: RateUnits;
  /** Ea or C, whichever the user enters */
  activationParameter: ActivationParameter;
  /** A selected reaction of this type. Its units use its own order. */
  reaction?: Reaction;
  species: Array<Species>;
};

/**
 * Shows the rate constant formula of a reaction type, the unit of each
 * parameter, and a link to the docs of the type.
 */
export const ReactionTypeInfo = ({
  type,
  rateUnits,
  activationParameter,
  reaction,
  species,
}: ReactionTypeInfoProps) => {
  const offsets = (
    rateUnitParameters as Partial<
      Record<ReactionTypeName, Record<string, number>>
    >
  )[type];

  return (
    <Box
      role="region"
      aria-label={`${reactionTypeToString(type)} rate constant`}
      sx={{
        padding: 2,
        maxWidth: "36em",
        display: "flex",
        flexDirection: "column",
        rowGap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: 1,
          color: "text.primary",
          "& .katex": { fontSize: "1.05em" },
        }}
      >
        {rateFormulas[type].map((tex) => (
          <Formula key={tex} tex={tex} />
        ))}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "max-content 1fr",
          columnGap: 3,
          rowGap: 0.5,
        }}
      >
        {Object.entries(reactionAttributeOptions[type])
          .filter(([key]) => showsAttribute(key, activationParameter))
          .map(([key, attribute]) => {
            const offset = offsets?.[key];
            let unit: ReactNode = attribute.units ? (
              <UnitText units={attribute.units} />
            ) : (
              "unitless"
            );
            if (offset !== undefined) {
              const order = reaction
                ? parameterOrder(type, key, reaction.reactants)
                : null;
              unit =
                order === null ? (
                  <GenericRateUnit rateUnits={rateUnits} offset={offset} />
                ) : (
                  <UnitText units={rateUnitLabel(rateUnits, order)} />
                );
            }
            return (
              <Fragment key={key}>
                <Typography variant="body2" color="textPrimary">
                  {attribute.name || key}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {unit}
                </Typography>
              </Fragment>
            );
          })}
      </Box>
      {"Ea" in reactionAttributeOptions[type] && (
        <Typography variant="caption" color="textSecondary">
          C = −Ea / k<sub>B</sub>.
        </Typography>
      )}
      {offsets !== undefined && (
        <Typography variant="caption" color="textSecondary">
          {reaction ? (
            <>
              Units for <EquationText reaction={reaction} species={species} />{" "}
              (n = {reactionOrder(reaction.reactants)}).
            </>
          ) : (
            <>
              n is the sum of the reactant coefficients. Select a reaction to
              see its units.
            </>
          )}
        </Typography>
      )}
      <Link
        href={reactionTypeDocs[type]}
        target="_blank"
        rel="noopener noreferrer"
        variant="body2"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          columnGap: 0.5,
          alignSelf: "flex-start",
        }}
      >
        Documentation
        <OpenInNewIcon fontSize="inherit" />
      </Link>
    </Box>
  );
};
