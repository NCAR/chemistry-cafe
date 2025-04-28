import {
  Alert,
  Autocomplete,
  Box,
  Button,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  MenuItem,
  Modal,
  Paper,
  Select,
  Snackbar,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import React, { useLayoutEffect, useRef, useState } from "react";
import {
  speciesAttributeOptions,
  Family,
  Mechanism,
  Reaction,
  ReactionTypeName,
  Species,
  SpeciesAttribute,
  ReactionAttribute,
  reactionAttributeOptions,
  ReactionConfiguration,
  reactionConfigurations,
  ReactionSpeciesCount,
  supportedReactionTypes,
} from "../types/chemistryModels";
import DeleteIcon from "@mui/icons-material/Delete";
import UnitComponent from "./UnitComponent";
import WarningIcon from "@mui/icons-material/Warning";
import { SelectSpeciesButton } from "./SelectSpeciesButton";
import { useAuth } from "./AuthContext";
import { generateFrontendID } from "../helpers/localFamilies";
import CAMPFileUpload from "./CAMPFileUpload";
import { reactionTypeToString } from "../helpers/stringify";

const modalStyle: SxProps<Theme> = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  minWidth: "50%",
  maxHeight: "85%",
  overflowY: "auto",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  rowGap: "0.7em",
};

type FamilyCreationModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (family: Family) => void;
};

export const FamilyCreationModal: React.FC<FamilyCreationModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const familyName = useRef<string>("");
  const familyDescription = useRef<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [nameError, setNameError] = useState<boolean>(false);
  const { user } = useAuth();

  const handleFamilyCreation = () => {
    if (familyName.current.length === 0) {
      setShowAlert(true);
      setNameError(true);
      return;
    }
    const frontendId: string = generateFrontendID();
    const family: Family = {
      id: frontendId,
      name: familyName.current,
      description: familyDescription.current,
      owner: user,
      species: [],
      reactions: [],
      phases: [
        {
          id: generateFrontendID(),
          name: "gas",
          description: null,
          speciesIds: [],
        },
      ],
      mechanisms: [],
      isModified: false,
      isDeleted: false,
      isInDatabase: false,
    };
    onSubmit(family);
    familyName.current = "";
    familyDescription.current = "";
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box role="menu" sx={modalStyle}>
          <Typography color="textPrimary" variant="h5">
            Enter Details for the Family below:
          </Typography>
          <TextField
            sx={{
              width: "100%",
            }}
            color="primary"
            error={nameError}
            role="textbox"
            id="family-name"
            label="Name"
            required
            onChange={(event) => {
              familyName.current = event.target.value;
              setNameError(false);
            }}
          />
          <TextField
            sx={{
              width: "100%",
            }}
            color="primary"
            id="family-description"
            data-testid="family-description-input"
            label="Description"
            multiline
            minRows={2}
            maxRows={4}
            onChange={(event) => {
              familyDescription.current = event.target.value;
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              columnGap: "1em",
            }}
          >
            <Button
              sx={{
                flex: 1,
              }}
              aria-label="Create Family"
              color="primary"
              variant="contained"
              onClick={handleFamilyCreation}
            >
              Create
            </Button>
            <Button
              sx={{
                flex: 1,
              }}
              aria-label="Cancel Family Creation"
              variant="outlined"
              onClick={onClose}
            >
              Cancel
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
          Name must not be empty!
        </Alert>
      </Snackbar>
    </>
  );
};

type MechanismCreationModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (mechanism: Mechanism) => void;
};

export const MechanismCreationModal: React.FC<MechanismCreationModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const mechanismName = useRef<string>("");
  const mechanismDescription = useRef<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [nameError, setNameError] = useState<boolean>(false);

  const handleMechanismCreation = () => {
    if (mechanismName.current.length === 0) {
      setShowAlert(true);
      setNameError(true);
      return;
    }

    const frontendId: string = generateFrontendID();
    const mechanism: Mechanism = {
      id: frontendId,
      name: mechanismName.current,
      description: mechanismDescription.current,
      familyId: "",
      speciesIds: [],
      reactionIds: [],
      phaseIds: [],
    };

    onSubmit(mechanism);
    mechanismName.current = "";
    mechanismDescription.current = "";
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };
  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box role="menu" sx={modalStyle}>
          <Typography color="textPrimary" variant="h5">
            Enter Details for the Mechanism below:
          </Typography>
          <TextField
            sx={{
              width: "100%",
            }}
            color="primary"
            error={nameError}
            role="textbox"
            id="mechanism-name"
            label="Name"
            required
            onChange={(event) => {
              mechanismName.current = event.target.value;
              setNameError(false);
            }}
          />
          <TextField
            sx={{
              width: "100%",
            }}
            color="primary"
            id="mechanism-description"
            label="Description"
            multiline
            minRows={2}
            maxRows={4}
            onChange={(event) => {
              mechanismDescription.current = event.target.value;
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              columnGap: "1em",
            }}
          >
            <Button
              sx={{
                flex: 1,
              }}
              aria-label="Create Mechanism"
              data-testid="create-new-mechanism-button"
              color="primary"
              variant="contained"
              onClick={handleMechanismCreation}
            >
              Create
            </Button>
            <Button
              sx={{
                flex: 1,
              }}
              aria-label="Cancel Family Creation"
              variant="outlined"
              onClick={onClose}
            >
              Cancel
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
          Name must not be empty!
        </Alert>
      </Snackbar>
    </>
  );
};

type SpeciesEditorModalProps = {
  open: boolean;
  onClose: () => void;
  onUpdate: (species: Species) => void;
  species?: Species;
};

export const SpeciesEditorModal: React.FC<SpeciesEditorModalProps> = ({
  open,
  onClose,
  onUpdate,
  species,
}) => {
  const [modifiedSpecies, setModifiedSpecies] = useState<Species | undefined>();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("None");

  useLayoutEffect(() => {
    setModifiedSpecies(species);
  }, [species]);

  const handleUpdateSpecies = () => {
    if (!modifiedSpecies?.name) {
      setAlertMessage("Name must not be empty!");
      setShowAlert(true);
      return;
    }

    if (modifiedSpecies) {
      onUpdate(modifiedSpecies);
    }
    onClose();
  };

  const changeSpeciesProperties = (properties: Partial<Species>) => {
    setModifiedSpecies({
      ...modifiedSpecies!,
      ...properties,
    });
  };

  const handleAlertClose = () => setShowAlert(false);

  return (
    <div>
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle} role="menu">
          {species ? (
            <>
              <Typography color="textPrimary" variant="h5">
                Edit Species
              </Typography>
              <Typography color="textPrimary" variant="h6">
                Basic Info
              </Typography>
              <TextField
                sx={{
                  width: "100%",
                }}
                color="primary"
                required={true}
                defaultValue={species.name}
                id="species-name"
                label="Name"
                onChange={(event) => {
                  changeSpeciesProperties({
                    name: event.target.value,
                  });
                }}
              />
              <TextField
                sx={{
                  width: "100%",
                }}
                color="primary"
                defaultValue={species.description}
                minRows={2}
                maxRows={4}
                id="species-description"
                label="Description"
                onChange={(event) => {
                  changeSpeciesProperties({
                    description: event.target.value,
                  });
                }}
              />
              <Typography color="textPrimary" variant="h6">
                Species Attributes
              </Typography>
              <Typography color="textSecondary" variant="subtitle1">
                Empty values will be ignored
              </Typography>
              {speciesAttributeOptions.map((element: SpeciesAttribute) => {
                const attribute =
                  modifiedSpecies?.attributes[element.serializationKey] ??
                  element;
                if (typeof attribute.value == "number") {
                  return (
                    <TextField
                      color="primary"
                      key={`${species.id}-${attribute.serializationKey}`}
                      id={`${species.id}-${attribute.serializationKey}`}
                      onWheel={(event) =>
                        event.target instanceof HTMLElement &&
                        event.target.blur()
                      }
                      sx={{
                        width: "100%",
                        // Removes up and down arrows for number
                        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                        {
                          display: "none",
                        },
                        "& input[type=number]": {
                          MozAppearance: "textfield",
                        },
                      }}
                      defaultValue={
                        species?.attributes[
                          attribute.serializationKey
                        ]?.value.toString() ?? ""
                      }
                      label={attribute.name || attribute.serializationKey}
                      type="number"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="start">
                              {attribute.units && (
                                <UnitComponent units={attribute.units} />
                              )}
                            </InputAdornment>
                          ),
                        },
                      }}
                      onChange={(event) => {
                        const num = Number.parseFloat(event.target.value);
                        if (
                          Number.isFinite(num) ||
                          event.target.value.length === 0
                        ) {
                          let modifiedAttributes: {
                            [key: string]: SpeciesAttribute;
                          } = {
                            ...modifiedSpecies?.attributes,
                          };

                          if (event.target.value.length === 0) {
                            delete modifiedAttributes[
                              attribute.serializationKey
                            ];
                          } else {
                            modifiedAttributes[attribute.serializationKey] = {
                              ...attribute,
                              value: num,
                            };
                          }

                          changeSpeciesProperties({
                            attributes: modifiedAttributes,
                          });
                        }
                      }}
                    />
                  );
                } else if (typeof attribute.value == "string") {
                  return (
                    <TextField
                      color="primary"
                      key={`${species.id}-${attribute.serializationKey}`}
                      defaultValue={
                        species?.attributes[
                          attribute.serializationKey
                        ]?.value.toString() ?? "Currently Unsupported"
                      }
                      label={attribute.name || attribute.serializationKey}
                      disabled
                    />
                  );
                } else {
                  return null;
                }
              })}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  columnGap: "1em",
                }}
              >
                <Button
                  sx={{
                    flex: 1,
                  }}
                  aria-label="Save changes to species."
                  data-testid="save-species-changes"
                  color="primary"
                  variant="contained"
                  onClick={handleUpdateSpecies}
                >
                  Save Changes
                </Button>
                <Button
                  sx={{
                    flex: 1,
                  }}
                  aria-label="Cancel Edit"
                  variant="outlined"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h5">Species not found</Typography>
              <Button variant="contained" color="warning" onClick={onClose}>
                Exit
              </Button>
            </>
          )}
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
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

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
    Array<ReactionAttribute>
  >([]);

  const [currentConfiguration, setCurrentConfiguration] =
    useState<ReactionConfiguration>(reactionConfigurations.NONE);

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
  ): Array<ReactionAttribute> => {
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
      case ReactionSpeciesCount.ONE:
        updatedReactionProperties.reactants = [];
        break;
      case ReactionSpeciesCount.MANY:
        updatedReactionProperties.reactants = modifiedReaction?.reactants ?? [];
        break;
    }

    if (modifiedReaction?.reactants.at(0)) {
      updatedReactionProperties.reactants = [
        {
          ...modifiedReaction.reactants.at(0)!,
          coefficient: 1,
        },
      ];
    }

    // Converts previous product selection to current count
    switch (currentConfiguration.productCount) {
      case ReactionSpeciesCount.NONE:
      case ReactionSpeciesCount.ONE:
        updatedReactionProperties.products = [];
        break;
      case ReactionSpeciesCount.MANY:
        updatedReactionProperties.products = modifiedReaction?.products ?? [];
        break;
    }

    if (modifiedReaction?.reactants.at(0)) {
      updatedReactionProperties.reactants = [
        {
          ...modifiedReaction.reactants.at(0)!,
          coefficient: 1,
        },
      ];
    }

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

    onUpdate(modifiedReaction);
    onClose();
  };

  return (
    <div>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            ...modalStyle,
            width: "60%",
            maxHeight: "80%",
          }}
          role="menu"
        >
          <Typography color="textPrimary" variant="h4">
            Enter Reaction Details
          </Typography>
          <TextField
            sx={{
              width: "100%",
            }}
            color="primary"
            id="reaction-name"
            label="Name"
            defaultValue={reaction?.name ?? ""}
            onChange={(event) => {
              changeReactionProperties({
                name: event.target.value,
              });
            }}
          />
          <TextField
            sx={{
              width: "100%",
            }}
            color="primary"
            id="family-description"
            label="Description"
            defaultValue={reaction?.description ?? ""}
            multiline
            minRows={2}
            maxRows={4}
            onChange={(event) => {
              changeReactionProperties({
                description: event.target.value,
              });
            }}
          />

          <Typography
            component="label"
            id="reaction-type-label"
            color="textPrimary"
            variant="h6"
          >
            Reaction Type
          </Typography>
          <Autocomplete
            aria-labelledby="reaction-type-label"
            id="reaction-type"
            aria-label="Choose Reaction Type"
            color="primary"
            defaultValue={reaction?.type ?? "NONE"}
            getOptionLabel={(option) => reactionTypeToString(option)}
            options={[...supportedReactionTypes].sort()}
            renderInput={(params) => <TextField {...params} />}
            onChange={(_: any, newValue: string | null) => {
              const reactionType = newValue as ReactionTypeName;
              const attributes = getReactionAttributes(reactionType);

              let reactionAttributes: {
                [key: string]: ReactionAttribute;
              } = {};

              for (const attribute of attributes) {
                reactionAttributes[attribute.serializationKey] = attribute;
              }

              changeReactionProperties({
                type: reactionType as ReactionTypeName,
                attributes: reactionAttributes,
              });

              setDefaultAttributes(attributes);

              const configuration = getReactionConfiguration(reactionType);
              setCurrentConfiguration(configuration);
            }}
          />
          {currentConfiguration.reactantCount == ReactionSpeciesCount.ONE && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                columnGap: "1em",
              }}
            >
              <Typography
                id="input-species-label"
                component="label"
                color="textPrimary"
                variant="h6"
              >
                Reaction Input Species:
              </Typography>
              <Paper>
                <Select
                  labelId="input-species-label"
                  aria-labelledby="input-species-label"
                  defaultValue={
                    modifiedReaction?.reactants.at(0)?.speciesId ?? "None"
                  }
                  onChange={(event) => {
                    const speciesId = event.target.value;
                    if (speciesId == "None") {
                      changeReactionProperties({
                        reactants: [],
                      });
                    } else {
                      changeReactionProperties({
                        reactants: [
                          {
                            speciesId: speciesId,
                            coefficient: 1.0,
                          },
                        ],
                      });
                    }
                  }}
                >
                  <MenuItem value="None">None</MenuItem>
                  {family.species.reduce(
                    (accumulator: React.JSX.Element[], species) => {
                      if (!species.isDeleted) {
                        accumulator.push(
                          <MenuItem
                            key={`${species.id}-input-species-menuitem`}
                            value={species.id}
                          >
                            {species.name || "<No Name>"}
                          </MenuItem>,
                        );
                      }
                      return accumulator;
                    },
                    [],
                  )}
                </Select>
              </Paper>
            </Box>
          )}
          {currentConfiguration.reactantCount == ReactionSpeciesCount.MANY && (
            <div>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography color="textPrimary" variant="h6">
                  Reactants
                </Typography>
                <SelectSpeciesButton
                  aria-label="select-reaction-species"
                  onSelect={(species) => {
                    const reactantEntry = {
                      speciesId: species.id,
                      coefficient: 1,
                    };
                    if (!modifiedReaction?.reactants) {
                      changeReactionProperties({
                        reactants: [reactantEntry],
                      });
                    } else {
                      changeReactionProperties({
                        reactants: [
                          ...modifiedReaction.reactants,
                          reactantEntry,
                        ],
                      });
                    }
                  }}
                  species={family.species.filter((species) => {
                    if (!modifiedReaction) {
                      return true;
                    }
                    if (
                      species.isDeleted ||
                      modifiedReaction.reactants.find(
                        (e) => e.speciesId == species.id,
                      )
                    ) {
                      return false;
                    }
                    return true;
                  })}
                />
              </Box>
              {modifiedReaction?.reactants.map((reactant, index) => {
                const species = family.species.find(
                  (e) => e.id == reactant.speciesId,
                );
                return (
                  <Box
                    key={`reactant-${reactant.speciesId}-${index}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      columnGap: "1em",
                    }}
                  >
                    <Paper
                      sx={{
                        padding: "0.2em",
                        display: "flex",
                        alignItems: "center",
                        columnGap: "2em",
                        width: "70%",
                      }}
                      elevation={1}
                    >
                      <Typography color="textPrimary">
                        {species?.name}
                      </Typography>
                      <TextField
                        color="primary"
                        label="Quantity"
                        defaultValue={reactant.coefficient}
                        error={reactant.coefficient <= 0}
                        type="number"
                        sx={{
                          flex: 1,
                          // Removes up and down arrows for number
                          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                          {
                            display: "none",
                          },
                          "& input[type=number]": {
                            MozAppearance: "textfield",
                          },
                        }}
                        onChange={(event) => {
                          if (!modifiedReaction) {
                            return;
                          }
                          const coefficient = Number.parseFloat(
                            event.target.value,
                          );
                          if (Number.isFinite(coefficient)) {
                            changeReactionProperties({
                              reactants: modifiedReaction.reactants.map(
                                (element) => {
                                  if (
                                    element.speciesId === reactant.speciesId
                                  ) {
                                    return {
                                      ...reactant,
                                      coefficient,
                                    };
                                  }
                                  return element;
                                },
                              ),
                            });
                          }
                        }}
                      />
                    </Paper>
                    <IconButton
                      aria-label="Remove Species From Reactants"
                      onClick={() => {
                        changeReactionProperties({
                          reactants: modifiedReaction.reactants.filter(
                            (e) => e.speciesId !== reactant.speciesId,
                          ),
                        });
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                );
              })}
            </div>
          )}
          {currentConfiguration.productCount == ReactionSpeciesCount.ONE && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                columnGap: "1em",
              }}
            >
              <Typography
                id="output-species-input-label"
                color="textPrimary"
                variant="h6"
              >
                Reaction Output Species:
              </Typography>
              <Select
                labelId="output-species-input-label"
                aria-labelledby="output-species-input-label"
                defaultValue={
                  modifiedReaction?.products.at(0)?.speciesId ?? "None"
                }
                onChange={(event) => {
                  const speciesId = event.target.value;
                  if (speciesId == "None") {
                    changeReactionProperties({
                      products: [],
                    });
                  } else {
                    changeReactionProperties({
                      products: [
                        {
                          speciesId: speciesId,
                          coefficient: 1.0,
                        },
                      ],
                    });
                  }
                }}
              >
                <MenuItem value="None">None</MenuItem>
                {family.species.reduce(
                  (accumulator: React.JSX.Element[], species) => {
                    if (!species.isDeleted) {
                      accumulator.push(
                        <MenuItem
                          key={`${species.id}-output-species-menuitem`}
                          value={species.id}
                        >
                          {species.name || "<No Name>"}
                        </MenuItem>,
                      );
                    }
                    return accumulator;
                  },
                  [],
                )}
              </Select>
            </Box>
          )}
          {currentConfiguration.productCount == ReactionSpeciesCount.MANY && (
            <div>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography color="textPrimary" variant="h6">
                  Products
                </Typography>
                <SelectSpeciesButton
                  aria-label="Select Reaction Species"
                  onSelect={(species) => {
                    const productEntry = {
                      speciesId: species.id,
                      coefficient: 1,
                    };
                    if (!modifiedReaction?.reactants) {
                      changeReactionProperties({
                        products: [productEntry],
                      });
                    } else {
                      changeReactionProperties({
                        products: [...modifiedReaction.products, productEntry],
                      });
                    }
                  }}
                  species={family.species.filter((species) => {
                    if (!modifiedReaction) {
                      return true;
                    }
                    if (
                      species.isDeleted ||
                      modifiedReaction.products.find(
                        (e) => e.speciesId == species.id,
                      )
                    ) {
                      return false;
                    }
                    return true;
                  })}
                />
              </Box>
              {modifiedReaction?.products.map((product, index) => {
                const species = family.species.find(
                  (element) => element.id == product.speciesId,
                );
                return (
                  <Box
                    key={`product-${product.speciesId}-${index}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      columnGap: "1em",
                    }}
                  >
                    <Paper
                      sx={{
                        padding: "0.2em",
                        display: "flex",
                        alignItems: "center",
                        columnGap: "2em",
                        width: "70%",
                      }}
                      elevation={1}
                    >
                      <Typography color="textPrimary">
                        {species?.name}
                      </Typography>
                      <TextField
                        color="primary"
                        label="Quantity"
                        defaultValue={product.coefficient}
                        error={product.coefficient <= 0}
                        type="number"
                        sx={{
                          flex: 1,
                          // Removes up and down arrows for number
                          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                          {
                            display: "none",
                          },
                          "& input[type=number]": {
                            MozAppearance: "textfield",
                          },
                        }}
                        onChange={(event) => {
                          if (!modifiedReaction) {
                            return;
                          }
                          const coefficient = Number.parseFloat(
                            event.target.value,
                          );
                          if (Number.isFinite(coefficient)) {
                            changeReactionProperties({
                              products: modifiedReaction.products.map(
                                (element) => {
                                  if (element.speciesId === product.speciesId) {
                                    return {
                                      ...product,
                                      coefficient,
                                    };
                                  }
                                  return element;
                                },
                              ),
                            });
                          }
                        }}
                      />
                    </Paper>
                    <IconButton
                      aria-label="Remove Species From Products"
                      onClick={() => {
                        changeReactionProperties({
                          products: modifiedReaction.products.filter(
                            (element) =>
                              element.speciesId !== product.speciesId,
                          ),
                        });
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                );
              })}
            </div>
          )}
          <Typography color="textPrimary" variant="h6">
            Reaction Attributes
          </Typography>
          {defaultAttributes.length === 0 ? (
            <Typography color="textSecondary" variant="subtitle1">
              None
            </Typography>
          ) : (
            defaultAttributes.map((attribute) => {
              return (
                <TextField
                  color="primary"
                  key={`${reaction?.id}-${attribute.serializationKey}`}
                  id={`${reaction?.id}-${attribute.serializationKey}`}
                  onWheel={(event) =>
                    event.target instanceof HTMLElement && event.target.blur()
                  }
                  sx={{
                    width: "100%",
                    // Removes up and down arrows for number
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                    {
                      display: "none",
                    },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                  }}
                  defaultValue={
                    reaction?.attributes[
                      attribute.serializationKey
                    ]?.value.toString() ?? ""
                  }
                  label={attribute.name || attribute.serializationKey}
                  type="number"
                  onChange={(event) => {
                    const num = Number.parseFloat(event.target.value);
                    if (
                      Number.isFinite(num) ||
                      event.target.value.length === 0
                    ) {
                      let modifiedAttributes: {
                        [key: string]: ReactionAttribute;
                      } = {
                        ...modifiedReaction?.attributes,
                      };

                      if (event.target.value.length === 0) {
                        delete modifiedAttributes[attribute.serializationKey];
                      } else {
                        modifiedAttributes[attribute.serializationKey] = {
                          ...attribute,
                          value: num,
                        };
                      }

                      changeReactionProperties({
                        attributes: modifiedAttributes,
                      });
                    }
                  }}
                />
              );
            })
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              columnGap: "1em",
            }}
          >
            <Button
              sx={{
                flex: 1,
              }}
              aria-label="Save changes to reaction."
              data-testid="save-reaction-changes"
              color="primary"
              variant="contained"
              onClick={handleUpdateReaction}
            >
              Save Changes
            </Button>
            <Button
              sx={{
                flex: 1,
              }}
              aria-label="Cancel Edit"
              variant="outlined"
              onClick={onClose}
            >
              Cancel
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

type ConfirmActionModalProps = {
  open: boolean;
  onClose: () => void;
  onAction: () => void;
  message: string;
  subtitle: string;
  confirmColor?: "primary" | "secondary" | "warning" | "error";
};

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  open,
  onClose,
  onAction,
  message,
  subtitle,
  confirmColor,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          ...modalStyle,
          width: "60%",
          maxHeight: "80%",
          overflowY: "auto",
        }}
        role="menu"
      >
        <Typography
          sx={{
            display: "flex",
            columnGap: "0.5em",
            alignItems: "center",
          }}
          color="textPrimary"
          variant="h5"
        >
          <WarningIcon color="warning" />
          Attention
        </Typography>
        <Typography color="textPrimary" variant="h6">
          {message}
        </Typography>
        <Typography color="textSecondary" variant="body1">
          {subtitle}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            columnGap: "1em",
          }}
        >
          <Button
            sx={{
              flex: 1,
            }}
            aria-label="Confirm Irreversable Action"
            data-testid="confirm-action"
            color={confirmColor ?? "primary"}
            variant="contained"
            onClick={onAction}
          >
            Confirm
          </Button>
          <Button
            sx={{
              flex: 1,
            }}
            aria-label="Cancel Irreversable Action"
            variant="outlined"
            color="primary"
            onClick={onClose}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

type ImportFamilyModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (family: Family) => any;
};

export const ImportFamilyModal: React.FC<ImportFamilyModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [family, setFamily] = useState<Family | null>(null);

  const onFileParse = (uploadedFamily: Family | null) => {
    setFamily(uploadedFamily);
    if (!uploadedFamily) {
      alert("Could not parse input file");
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setFamily(null);
        onClose();
      }}
    >
      <Box
        sx={{
          ...modalStyle,
          width: "60%",
          maxHeight: "80%",
          overflowY: "auto",
        }}
        role="menu"
        component="div"
      >
        <CAMPFileUpload onFileParse={onFileParse} />
        {family && (
          <Box>
            <Typography color="textPrimary">Configuration Info:</Typography>
            <List>
              <ListItem>
                <Typography color="textPrimary">Name: {family.name}</Typography>
              </ListItem>
              <ListItem>
                <Typography color="textPrimary">
                  Species Count: {family.species.length}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography color="textPrimary">
                  Reaction Count: {family.reactions.length}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography color="textPrimary">
                  Phase Count: {family.phases.length}
                </Typography>
              </ListItem>
            </List>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            columnGap: "1em",
          }}
        >
          <Button
            sx={{
              flex: 1,
            }}
            aria-label="Create imported Family"
            color="primary"
            variant="contained"
            disabled={!family}
            onClick={() => {
              if (!family) {
                alert("Cannnot create null family");
                return;
              }
              onSubmit(family);
              setFamily(null);
              onClose();
            }}
          >
            Create new Family
          </Button>
          <Button
            sx={{
              flex: 1,
            }}
            aria-label="Cancel Family Creation"
            variant="outlined"
            onClick={onClose}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
