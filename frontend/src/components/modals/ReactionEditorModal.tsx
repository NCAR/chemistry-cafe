import {
  Alert,
  Autocomplete,
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Modal,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { ReactNode, useLayoutEffect, useState } from "react";
import {
  Family,
  Product,
  Reactant,
  Reaction,
  ReactionTypeName,
  ReactionAttribute,
  reactionAttributeOptions,
  ReactionConfiguration,
  reactionConfigurations,
  ReactionSpeciesCount,
  supportedReactionTypes,
} from "../../types/chemistryModels";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { SelectSpeciesButton } from "../SelectSpeciesButton";
import { reactionTypeToString } from "../../helpers/stringify";
import { modalStyle } from "./modalStyle";
import { UUID } from "crypto";
import { useUserPreferences } from "../UserPreferencesContext";
import {
  fromDisplayValue,
  parameterOrder,
  rateUnitLabel,
  rateUnitsFor,
  roundDisplayValue,
  toDisplayValue,
} from "../../helpers/rateUnits";
import { UnitText } from "../RateUnitText";
import {
  formatEquation,
  formatSide,
  parseEquation,
  parseSide,
} from "../../helpers/equationParser";

// Hides the up and down arrows of a number field.
const numberFieldSx = {
  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
    display: "none",
  },
  "& input[type=number]": {
    MozAppearance: "textfield",
  },
};

// A scroll over a number field changes the page, not the value.
const blurOnWheel = (event: React.WheelEvent) =>
  event.target instanceof HTMLElement && event.target.blur();

type SpeciesEntry = {
  speciesId: UUID;
  coefficient: number;
  branch?: string;
};

type SpeciesRowsProps = {
  title: string;
  entries: Array<SpeciesEntry>;
  family: Family;
  /** A text field for the species, under the title */
  field?: ReactNode;
  /** Species that the add button does not offer, for example from another branch */
  unavailable?: Array<string>;
  addLabel: string;
  removeLabel: string;
  newEntry: (speciesId: UUID) => SpeciesEntry;
  onChange: (entries: Array<SpeciesEntry>) => void;
  /**
   * Changes when the equation field replaces the entries, so that the
   * coefficient fields show the new values.
   */
  version: number;
};

/**
 * Edits a list of reactants or products. Each species is one compact row with
 * its name, its coefficient, and a remove button.
 */
const SpeciesRows = ({
  title,
  entries,
  family,
  field,
  unavailable,
  addLabel,
  removeLabel,
  newEntry,
  onChange,
  version,
}: SpeciesRowsProps) => (
  <Box>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Typography color="textPrimary" variant="subtitle2">
        {title}
      </Typography>
      <SelectSpeciesButton
        aria-label={addLabel}
        onSelect={(species) => onChange([...entries, newEntry(species.id)])}
        species={family.species.filter(
          (species) =>
            !entries.some((e) => e.speciesId === species.id) &&
            !unavailable?.includes(species.id),
        )}
      />
    </Box>
    {field}
    {entries.length === 0 && (
      <Typography color="textSecondary" variant="body2">
        None
      </Typography>
    )}
    {entries.map((entry, index) => {
      const species = family.species.find((e) => e.id === entry.speciesId);
      const replace = (changed: SpeciesEntry) =>
        onChange(
          entries.map((e) => (e.speciesId === entry.speciesId ? changed : e)),
        );
      return (
        <Box
          key={`${title}-${entry.speciesId}-${index}-${version}`}
          sx={{
            display: "flex",
            alignItems: "center",
            columnGap: 1,
            paddingY: 0.5,
          }}
        >
          <Typography color="textPrimary" sx={{ flex: 1, minWidth: 0 }} noWrap>
            {species?.name || "<No Name>"}
          </Typography>
          <TextField
            size="small"
            label="Coefficient"
            type="number"
            defaultValue={entry.coefficient}
            error={entry.coefficient <= 0}
            // Wide enough for a value such as 0.00000652.
            sx={{ ...numberFieldSx, width: "9.5em" }}
            onWheel={blurOnWheel}
            onChange={(event) => {
              const coefficient = Number.parseFloat(event.target.value);
              if (Number.isFinite(coefficient)) {
                replace({ ...entry, coefficient });
              }
            }}
          />
          <IconButton
            size="small"
            aria-label={removeLabel}
            color="error"
            onClick={() =>
              onChange(entries.filter((e) => e.speciesId !== entry.speciesId))
            }
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      );
    })}
  </Box>
);

type SingleSpeciesSelectProps = {
  label: string;
  speciesId?: UUID;
  family: Family;
  onChange: (speciesId?: UUID) => void;
};

/** Selects the one species of a reaction type with one reactant or product. */
const SingleSpeciesSelect = ({
  label,
  speciesId,
  family,
  onChange,
}: SingleSpeciesSelectProps) => (
  <TextField
    select
    size="small"
    fullWidth
    label={label}
    value={speciesId ?? "None"}
    onChange={(event) =>
      onChange(
        event.target.value === "None"
          ? undefined
          : (event.target.value as UUID),
      )
    }
  >
    <MenuItem value="None">None</MenuItem>
    {family.species.map((species) => (
      <MenuItem key={`${label}-${species.id}`} value={species.id}>
        {species.name || "<No Name>"}
      </MenuItem>
    ))}
  </TextField>
);

type ReactionEditorModalProps = {
  open: boolean;
  onClose: () => void;
  onUpdate: (reaction: Reaction) => void;
  reaction?: Reaction;
  family: Family;
};

export const ReactionEditorModal: React.FC<ReactionEditorModalProps> = ({
  open,
  onClose,
  onUpdate,
  reaction,
  family,
}) => {
  const [modifiedReaction, setModifiedReaction] = useState<
    Reaction | undefined
  >(reaction);

  const [defaultAttributes, setDefaultAttributes] = useState<
    Record<string, ReactionAttribute>
  >({});

  const [currentConfiguration, setCurrentConfiguration] =
    useState<ReactionConfiguration>(reactionConfigurations.NONE);

  const { preferences } = useUserPreferences();
  const rateUnits = rateUnitsFor(preferences.rateUnits, modifiedReaction?.type);

  // The text of each species field while the user changes it. The key is
  // "equation", "reactants", or a product branch such as "alkoxy". A field
  // without a key shows the species of the rows.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [draftErrors, setDraftErrors] = useState<Record<string, Array<string>>>(
    {},
  );
  const [speciesVersion, setSpeciesVersion] = useState<number>(0);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const changeReactionProperties = (properties: Partial<Reaction>) => {
    setModifiedReaction({
      ...modifiedReaction!,
      ...properties,
    });
  };

  const getReactionAttributes = (
    type?: ReactionTypeName,
  ): Record<string, ReactionAttribute> => {
    if (!type) {
      return reactionAttributeOptions.NONE;
    }
    return reactionAttributeOptions[type];
  };

  const getReactionConfiguration = (
    type?: ReactionTypeName,
  ): ReactionConfiguration => {
    if (!type) {
      return reactionConfigurations.NONE;
    }
    return reactionConfigurations[type];
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  useLayoutEffect(() => {
    setModifiedReaction(reaction);
    setDrafts({});
    setDraftErrors({});
    const attributes = getReactionAttributes(reaction?.type);
    setDefaultAttributes(attributes);
    const configuration = getReactionConfiguration(reaction?.type);
    setCurrentConfiguration(configuration);
  }, [reaction]);

  useLayoutEffect(() => {
    const updatedReactionProperties: Partial<Reaction> = {};

    // Converts previous reactant selection to current count
    switch (currentConfiguration.reactantCount) {
      case ReactionSpeciesCount.NONE:
        updatedReactionProperties.reactants = [];
        break;
      case ReactionSpeciesCount.ONE:
        // A reaction with one reactant always has a coefficient of 1.
        updatedReactionProperties.reactants = (
          modifiedReaction?.reactants.slice(0, 1) ?? []
        ).map((reactant) => ({ ...reactant, coefficient: 1 }));
        break;
      case ReactionSpeciesCount.MANY:
        updatedReactionProperties.reactants = modifiedReaction?.reactants ?? [];
        break;
    }

    // Converts previous product selection to current count
    switch (currentConfiguration.productCount) {
      case ReactionSpeciesCount.NONE:
        updatedReactionProperties.products = [];
        break;
      case ReactionSpeciesCount.ONE:
        updatedReactionProperties.products =
          modifiedReaction?.products.slice(0, 1) ?? [];
        break;
      case ReactionSpeciesCount.MANY:
        updatedReactionProperties.products = modifiedReaction?.products ?? [];
        break;
    }

    // Clears the gas phase / gas phase species selection when the current
    // reaction type no longer uses it, so a stale reference isn't carried
    // silently into a type that doesn't support it.
    updatedReactionProperties.gasPhaseId = currentConfiguration.hasGasPhase
      ? modifiedReaction?.gasPhaseId
      : undefined;
    updatedReactionProperties.gasPhaseSpeciesId =
      currentConfiguration.hasGasPhaseSpecies
        ? modifiedReaction?.gasPhaseSpeciesId
        : undefined;

    changeReactionProperties(updatedReactionProperties);
  }, [defaultAttributes, currentConfiguration]);

  // The product branches that the editor shows as separate lists, for
  // example the alkoxy and nitrate products of a branched reaction. A type
  // with one branch gives that branch to all of its products.
  const productBranches =
    (currentConfiguration.branches?.length ?? 0) > 1
      ? currentConfiguration.branches!
      : [];
  // A product with a missing or unknown branch is in the first branch, so
  // that it shows in a list.
  const branchOf = (product: Product) =>
    product.branch && productBranches.includes(product.branch)
      ? product.branch
      : productBranches[0];
  const withDefaultBranch = <Entry extends object>(entry: Entry) => {
    const branch = currentConfiguration.branches?.[0];
    return branch === undefined ? entry : { ...entry, branch };
  };

  /**
   * Reads the species fields that the user changed into reactants and
   * products. It also checks the number of species that the reaction type
   * allows. The errors have the key of their field.
   */
  const readDrafts = (pending: Record<string, string>) => {
    const errors: Record<string, Array<string>> = {};
    let newReactants: Array<Reactant> = modifiedReaction?.reactants ?? [];
    let newProducts: Array<Product> = modifiedReaction?.products ?? [];

    const checkCount = (
      key: string,
      count: ReactionSpeciesCount,
      entries: Array<{ coefficient: number }>,
      side: string,
    ) => {
      if (count === ReactionSpeciesCount.NONE && entries.length > 0) {
        errors[key].push(`This reaction type has no ${side}s`);
      }
      if (
        count === ReactionSpeciesCount.ONE &&
        (entries.length > 1 || entries.some((e) => e.coefficient !== 1))
      ) {
        errors[key].push(
          `This reaction type has one ${side}, with a coefficient of 1`,
        );
      }
    };

    if ("equation" in pending) {
      const parsed = parseEquation(pending.equation, family.species);
      errors.equation = [...parsed.errors];
      newReactants = parsed.reactants;
      newProducts = parsed.products.map(withDefaultBranch);
      checkCount(
        "equation",
        currentConfiguration.reactantCount,
        newReactants,
        "reactant",
      );
      checkCount(
        "equation",
        currentConfiguration.productCount,
        newProducts,
        "product",
      );
    }
    if ("reactants" in pending) {
      const parsed = parseSide(pending.reactants, family.species);
      errors.reactants = parsed.errors;
      newReactants = parsed.entries;
    }
    for (const branch of productBranches) {
      if (branch in pending) {
        const parsed = parseSide(pending[branch], family.species);
        errors[branch] = parsed.errors;
        newProducts = [
          ...newProducts.filter((product) => branchOf(product) !== branch),
          ...parsed.entries.map((entry) => ({ ...entry, branch })),
        ];
      }
    }

    // The database keeps one product row for each species, so a species can
    // be in only one branch.
    for (const branch of productBranches) {
      if (!(branch in pending)) {
        continue;
      }
      for (const product of newProducts) {
        const otherBranch = branchOf(product);
        const repeated = newProducts.some(
          (p) => p.speciesId === product.speciesId && branchOf(p) === branch,
        );
        if (otherBranch !== branch && repeated) {
          const name = family.species.find(
            (s) => s.id === product.speciesId,
          )?.name;
          errors[branch].push(
            `${name} is already in the ${otherBranch} products`,
          );
        }
      }
    }

    const hasErrors = Object.values(errors).some((list) => list.length > 0);
    return {
      reactants: newReactants,
      products: newProducts,
      errors,
      hasErrors,
    };
  };

  // Applies the species fields to the rows. With errors, the rows do not
  // change, and the fields keep the text of the user.
  const applyDrafts = () => {
    if (Object.keys(drafts).length === 0) {
      return;
    }
    const result = readDrafts(drafts);
    setDraftErrors(result.errors);
    if (result.hasErrors) {
      return;
    }
    changeReactionProperties({
      reactants: result.reactants,
      products: result.products,
    });
    setDrafts({});
    setSpeciesVersion((version) => version + 1);
  };

  const handleUpdateReaction = () => {
    if (!modifiedReaction) {
      setErrorMessage("Reaction is undefined");
      setShowAlert(true);
      return;
    }

    // Species fields that the user did not apply yet are part of the save.
    let reactionToSave = modifiedReaction;
    if (Object.keys(drafts).length > 0) {
      const result = readDrafts(drafts);
      if (result.hasErrors) {
        setDraftErrors(result.errors);
        setErrorMessage(
          "Correct the species fields before you save the reaction",
        );
        setShowAlert(true);
        return;
      }
      reactionToSave = {
        ...modifiedReaction,
        reactants: result.reactants,
        products: result.products,
      };
    }

    // Save the branch that the lists show, so that the export keeps each
    // product in its branch.
    if (productBranches.length > 0) {
      reactionToSave = {
        ...reactionToSave,
        products: reactionToSave.products.map((product) => ({
          ...product,
          branch: branchOf(product),
        })),
      };
    }

    for (const reactant of reactionToSave.reactants) {
      if (reactant.coefficient <= 0) {
        setErrorMessage(
          "Coefficient for reactants must be a finite positive number",
        );
        setShowAlert(true);
        return;
      }
    }

    for (const product of reactionToSave.products) {
      if (product.coefficient <= 0) {
        setErrorMessage(
          "Coefficient for products must be a finite positive number",
        );
        setShowAlert(true);
        return;
      }
    }

    if (
      currentConfiguration.hasGasPhaseSpecies &&
      !reactionToSave.gasPhaseSpeciesId
    ) {
      setErrorMessage("This reaction type requires a gas phase species");
      setShowAlert(true);
      return;
    }

    onUpdate(reactionToSave);
    onClose();
  };

  const reactants = modifiedReaction?.reactants ?? [];
  const products = modifiedReaction?.products ?? [];
  const hasSpecies =
    currentConfiguration.reactantCount !== ReactionSpeciesCount.NONE ||
    currentConfiguration.productCount !== ReactionSpeciesCount.NONE;

  // The shared props of a species field. It shows the species of the rows,
  // or the text of the user while the user changes it. Enter or a blur
  // applies the text.
  const speciesFieldProps = (key: string, formatted: string) => {
    const errors = draftErrors[key] ?? [];
    return {
      value: drafts[key] ?? formatted,
      error: errors.length > 0,
      helperText: errors.length > 0 ? errors.join(". ") : undefined,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        setDrafts((current) => ({ ...current, [key]: event.target.value })),
      onBlur: applyDrafts,
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault();
          applyDrafts();
        }
      },
    };
  };

  // Gives the field of one reaction parameter. A parameter with a
  // concentration unit shows its value in the display units of the user. The
  // reaction keeps the SI value.
  const renderParameter = (key: string, attribute: ReactionAttribute) => {
    const order = parameterOrder(modifiedReaction?.type, key, reactants);
    const storedValue = modifiedReaction?.attributes[key]?.value;
    const isNumber = typeof storedValue === "number";
    const shownValue = isNumber
      ? roundDisplayValue(
          toDisplayValue(storedValue, rateUnits, order),
        ).toString()
      : (storedValue?.toString() ?? "");
    const unitLabel =
      order === null ? attribute.units : rateUnitLabel(rateUnits, order);
    // A first-order value is the same in both units, so it needs no hint.
    const storedAsHint =
      isNumber && order !== null && order !== 1 && rateUnits !== "SI"
        ? `Stored as ${roundDisplayValue(storedValue)} ${rateUnitLabel("SI", order)}`
        : undefined;

    return (
      <TextField
        size="small"
        // The type, order, and units are in the key, because a change of one
        // of them changes the shown value but not the stored value.
        key={`${reaction?.id}-${key}-${modifiedReaction?.type}-${order}-${rateUnits}`}
        id={`${reaction?.id}-${key}`}
        label={attribute.name || key}
        type="number"
        defaultValue={shownValue}
        sx={numberFieldSx}
        onWheel={blurOnWheel}
        InputProps={{
          endAdornment: (unitLabel || storedAsHint) && (
            <InputAdornment position="end" sx={{ fontSize: "0.8rem" }}>
              {unitLabel && <UnitText units={unitLabel} />}
              {storedAsHint && (
                <Tooltip title={storedAsHint}>
                  <InfoOutlinedIcon
                    fontSize="inherit"
                    color="action"
                    sx={{ marginLeft: 0.5 }}
                  />
                </Tooltip>
              )}
            </InputAdornment>
          ),
        }}
        onChange={(event) => {
          const num = Number.parseFloat(event.target.value);
          if (!Number.isFinite(num) && event.target.value.length !== 0) {
            return;
          }
          const modifiedAttributes: Record<string, ReactionAttribute> = {
            ...modifiedReaction?.attributes,
          };
          if (event.target.value.length === 0) {
            delete modifiedAttributes[key];
          } else {
            modifiedAttributes[key] = {
              ...attribute,
              value: fromDisplayValue(num, rateUnits, order),
            };
          }
          changeReactionProperties({ attributes: modifiedAttributes });
        }}
      />
    );
  };

  const renderTaylorCoefficients = (
    key: string,
    attribute: ReactionAttribute,
  ) => {
    const coefficients = Array.isArray(modifiedReaction?.attributes[key]?.value)
      ? (modifiedReaction!.attributes[key].value as Array<number>)
      : [];
    const updateCoefficients = (newCoefficients: Array<number>) => {
      if (!modifiedReaction) {
        return;
      }
      changeReactionProperties({
        attributes: {
          ...modifiedReaction.attributes,
          [key]: { ...attribute, value: newCoefficients },
        },
      });
    };

    return (
      <Box key={`${reaction?.id}-${key}`} sx={{ gridColumn: "1 / -1" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography color="textPrimary" variant="body2">
            Taylor Coefficients
          </Typography>
          <IconButton
            aria-label="Add Coefficient"
            color="primary"
            size="small"
            onClick={() => updateCoefficients([...coefficients, 0])}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {coefficients.length === 0 && (
            <Typography color="textSecondary" variant="body2">
              None
            </Typography>
          )}
          {coefficients.map((coefficient, index) => (
            <TextField
              key={`${reaction?.id}-taylor-coefficient-${index}`}
              size="small"
              label={`Coefficient ${index + 1}`}
              type="number"
              value={coefficient}
              sx={{ ...numberFieldSx, width: "9em" }}
              onWheel={blurOnWheel}
              onChange={(event) => {
                const num = Number.parseFloat(event.target.value);
                if (Number.isFinite(num)) {
                  const updated = [...coefficients];
                  updated[index] = num;
                  updateCoefficients(updated);
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={`Remove Taylor Coefficient ${index + 1}`}
                      color="error"
                      size="small"
                      edge="end"
                      onClick={() =>
                        updateCoefficients(
                          coefficients.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <div>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            ...modalStyle,
            width: "min(900px, 95vw)",
            minWidth: 0,
            maxHeight: "90%",
            rowGap: 1.5,
          }}
          role="menu"
        >
          <Typography color="textPrimary" variant="h6">
            Reaction Details
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            <TextField
              size="small"
              sx={{ flex: "1 1 16em" }}
              id="reaction-name"
              label="Name"
              defaultValue={reaction?.name ?? ""}
              onChange={(event) => {
                changeReactionProperties({
                  name: event.target.value,
                });
              }}
            />
            <Autocomplete
              size="small"
              sx={{ flex: "1 1 14em" }}
              id="reaction-type"
              defaultValue={reaction?.type ?? "NONE"}
              getOptionLabel={(option) => reactionTypeToString(option)}
              options={[...supportedReactionTypes].sort()}
              renderInput={(params) => (
                <TextField {...params} label="Reaction Type" />
              )}
              onChange={(_: any, newValue: string | null) => {
                const reactionType = newValue as ReactionTypeName;
                const attributes = getReactionAttributes(reactionType);

                changeReactionProperties({
                  type: reactionType as ReactionTypeName,
                  attributes,
                });

                setDefaultAttributes(attributes);

                const configuration = getReactionConfiguration(reactionType);
                setCurrentConfiguration(configuration);
              }}
            />
          </Box>
          <TextField
            size="small"
            fullWidth
            id="reaction-description"
            label="Description"
            defaultValue={reaction?.description ?? ""}
            multiline
            maxRows={4}
            onChange={(event) => {
              changeReactionProperties({
                description: event.target.value,
              });
            }}
          />
          {(currentConfiguration.hasGasPhase ||
            currentConfiguration.hasGasPhaseSpecies) && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {currentConfiguration.hasGasPhase && (
                <TextField
                  select
                  size="small"
                  label="Gas Phase"
                  sx={{ flex: "1 1 14em" }}
                  value={modifiedReaction?.gasPhaseId ?? "None"}
                  onChange={(event) => {
                    const phaseId = event.target.value;
                    changeReactionProperties({
                      gasPhaseId:
                        phaseId === "None" ? undefined : (phaseId as UUID),
                    });
                  }}
                >
                  <MenuItem value="None">None</MenuItem>
                  {family.phases.map((phase) => (
                    <MenuItem
                      key={`${phase.id}-gas-phase-menuitem`}
                      value={phase.id}
                    >
                      {phase.name || "<No Name>"}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {currentConfiguration.hasGasPhaseSpecies && (
                <Box sx={{ flex: "1 1 14em" }}>
                  <SingleSpeciesSelect
                    label="Gas Phase Species"
                    speciesId={modifiedReaction?.gasPhaseSpeciesId}
                    family={family}
                    onChange={(speciesId) =>
                      changeReactionProperties({
                        gasPhaseSpeciesId: speciesId,
                      })
                    }
                  />
                </Box>
              )}
            </Box>
          )}
          {hasSpecies && productBranches.length === 0 && (
            <TextField
              size="small"
              fullWidth
              label="Equation"
              placeholder="2 NO2 + OH -> HNO3"
              {...speciesFieldProps(
                "equation",
                formatEquation(reactants, products, family.species),
              )}
            />
          )}
          {productBranches.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                columnGap: 3,
                rowGap: 1.5,
              }}
            >
              <Box sx={{ gridColumn: "1 / -1" }}>
                <SpeciesRows
                  title="Reactants"
                  entries={reactants}
                  family={family}
                  field={
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="NO + RO2"
                      inputProps={{ "aria-label": "Reactants" }}
                      {...speciesFieldProps(
                        "reactants",
                        formatSide(reactants, family.species),
                      )}
                    />
                  }
                  addLabel="select-reaction-species"
                  removeLabel="Remove Species From Reactants"
                  newEntry={(speciesId) => ({ speciesId, coefficient: 1 })}
                  onChange={(entries) =>
                    changeReactionProperties({ reactants: entries })
                  }
                  version={speciesVersion}
                />
              </Box>
              {productBranches.map((branch) => {
                const title = `${branch.charAt(0).toUpperCase()}${branch.slice(1)} products`;
                const entries = products.filter(
                  (product) => branchOf(product) === branch,
                );
                return (
                  <SpeciesRows
                    key={branch}
                    title={title}
                    entries={entries}
                    family={family}
                    field={
                      <TextField
                        size="small"
                        fullWidth
                        inputProps={{ "aria-label": title }}
                        {...speciesFieldProps(
                          branch,
                          formatSide(entries, family.species),
                        )}
                      />
                    }
                    unavailable={products
                      .filter((product) => branchOf(product) !== branch)
                      .map((product) => product.speciesId)}
                    addLabel={`Add ${branch} product`}
                    removeLabel={`Remove Species From ${title}`}
                    newEntry={(speciesId) => ({
                      speciesId,
                      coefficient: 1,
                      branch,
                    })}
                    onChange={(changed) =>
                      changeReactionProperties({
                        products: [
                          ...products.filter(
                            (product) => branchOf(product) !== branch,
                          ),
                          ...changed.map((entry) => ({ ...entry, branch })),
                        ],
                      })
                    }
                    version={speciesVersion}
                  />
                );
              })}
            </Box>
          )}
          {hasSpecies && productBranches.length === 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                columnGap: 3,
                rowGap: 1.5,
              }}
            >
              <Box>
                {currentConfiguration.reactantCount ===
                  ReactionSpeciesCount.ONE && (
                  <SingleSpeciesSelect
                    label="Reactant"
                    speciesId={reactants.at(0)?.speciesId}
                    family={family}
                    onChange={(speciesId) =>
                      changeReactionProperties({
                        reactants: speciesId
                          ? [{ speciesId, coefficient: 1 }]
                          : [],
                      })
                    }
                  />
                )}
                {currentConfiguration.reactantCount ===
                  ReactionSpeciesCount.MANY && (
                  <SpeciesRows
                    title="Reactants"
                    entries={reactants}
                    family={family}
                    addLabel="select-reaction-species"
                    removeLabel="Remove Species From Reactants"
                    newEntry={(speciesId) => ({ speciesId, coefficient: 1 })}
                    onChange={(entries) =>
                      changeReactionProperties({ reactants: entries })
                    }
                    version={speciesVersion}
                  />
                )}
              </Box>
              <Box>
                {currentConfiguration.productCount ===
                  ReactionSpeciesCount.ONE && (
                  <SingleSpeciesSelect
                    label="Product"
                    speciesId={products.at(0)?.speciesId}
                    family={family}
                    onChange={(speciesId) =>
                      changeReactionProperties({
                        products: speciesId
                          ? [{ speciesId, coefficient: 1 }]
                          : [],
                      })
                    }
                  />
                )}
                {currentConfiguration.productCount ===
                  ReactionSpeciesCount.MANY && (
                  <SpeciesRows
                    title="Products"
                    entries={products}
                    family={family}
                    addLabel="Select Reaction Species"
                    removeLabel="Remove Species From Products"
                    newEntry={(speciesId) =>
                      withDefaultBranch({ speciesId, coefficient: 1 })
                    }
                    onChange={(entries) =>
                      changeReactionProperties({ products: entries })
                    }
                    version={speciesVersion}
                  />
                )}
              </Box>
            </Box>
          )}
          <Typography color="textPrimary" variant="subtitle2">
            Parameters
          </Typography>
          {Object.keys(defaultAttributes).length === 0 ? (
            <Typography color="textSecondary" variant="body2">
              None
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(15em, 1fr))",
                columnGap: 1.5,
                rowGap: 2,
              }}
            >
              {Object.entries(defaultAttributes).map(([key, attribute]) =>
                key === "taylorCoefficients"
                  ? renderTaylorCoefficients(key, attribute)
                  : renderParameter(key, attribute),
              )}
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              columnGap: 1,
              paddingTop: 1,
            }}
          >
            <Button
              aria-label="Cancel Edit"
              variant="outlined"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              aria-label="Save changes to reaction."
              data-testid="save-reaction-changes"
              color="primary"
              variant="contained"
              onClick={handleUpdateReaction}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={showAlert}
        autoHideDuration={5000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleAlertClose}
          severity="warning"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};
