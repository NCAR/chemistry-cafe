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
import React, { useLayoutEffect, useState } from "react";
import {
  Family,
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
  RateConstantFormula,
  reactionTypeDocs,
} from "../familyEditor/ReactionTypeInfo";

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
  branches?: Array<string>;
  addLabel: string;
  removeLabel: string;
  newEntry: (speciesId: UUID) => SpeciesEntry;
  onChange: (entries: Array<SpeciesEntry>) => void;
};

/**
 * Edits a list of reactants or products. Each species is one compact row with
 * its name, its branch (if the reaction type has branches), its coefficient,
 * and a remove button.
 */
const SpeciesRows = ({
  title,
  entries,
  family,
  branches,
  addLabel,
  removeLabel,
  newEntry,
  onChange,
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
          (species) => !entries.some((e) => e.speciesId === species.id),
        )}
      />
    </Box>
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
          key={`${title}-${entry.speciesId}-${index}`}
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
          {branches && branches.length > 0 && (
            <TextField
              select
              size="small"
              label="Branch"
              sx={{ width: "8em" }}
              value={entry.branch ?? branches[0]}
              onChange={(event) =>
                replace({ ...entry, branch: event.target.value })
              }
            >
              {branches.map((branch) => (
                <MenuItem key={branch} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            size="small"
            label="Coefficient"
            type="number"
            defaultValue={entry.coefficient}
            error={entry.coefficient <= 0}
            sx={{ ...numberFieldSx, width: "6.5em" }}
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

  const handleUpdateReaction = () => {
    if (!modifiedReaction) {
      setErrorMessage("Reaction is undefined");
      setShowAlert(true);
      return;
    }

    for (const reactant of modifiedReaction.reactants) {
      if (reactant.coefficient <= 0) {
        setErrorMessage(
          "Coefficient for reactants must be a finite positive number",
        );
        setShowAlert(true);
        return;
      }
    }

    for (const product of modifiedReaction.products) {
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
      !modifiedReaction.gasPhaseSpeciesId
    ) {
      setErrorMessage("This reaction type requires a gas phase species");
      setShowAlert(true);
      return;
    }

    onUpdate(modifiedReaction);
    onClose();
  };

  const reactants = modifiedReaction?.reactants ?? [];
  const products = modifiedReaction?.products ?? [];
  const hasSpecies =
    currentConfiguration.reactantCount !== ReactionSpeciesCount.NONE ||
    currentConfiguration.productCount !== ReactionSpeciesCount.NONE;

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
          {hasSpecies && (
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
                    branches={currentConfiguration.branches}
                    addLabel="Select Reaction Species"
                    removeLabel="Remove Species From Products"
                    newEntry={(speciesId) => ({
                      speciesId,
                      coefficient: 1,
                      branch: currentConfiguration.branches?.[0],
                    })}
                    onChange={(entries) =>
                      changeReactionProperties({ products: entries })
                    }
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
          {modifiedReaction?.type &&
            modifiedReaction.type in reactionTypeDocs && (
              <RateConstantFormula type={modifiedReaction.type} />
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
