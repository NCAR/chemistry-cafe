import {
  Alert,
  Autocomplete,
  Box,
  Button,
  IconButton,
  MenuItem,
  Modal,
  Paper,
  Select,
  Snackbar,
  TextField,
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
import DeleteIcon from "@mui/icons-material/Delete";
import { SelectSpeciesButton } from "../SelectSpeciesButton";
import { reactionTypeToString } from "../../helpers/stringify";
import { modalStyle } from "./modalStyle";
import { UUID } from "crypto";

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
        updatedReactionProperties.reactants = [];
        break;
      case ReactionSpeciesCount.ONE:
        updatedReactionProperties.reactants =
          modifiedReaction?.reactants.slice(0, 1) ?? [];
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
                  aria-labelledby="input-species-label"
                  defaultValue={reaction?.reactants.at(0)?.speciesId ?? "None"}
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
                            speciesId: speciesId as UUID,
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
                id="output-species-label"
                color="textPrimary"
                variant="h6"
              >
                Reaction Output Species:
              </Typography>
              <Select
                aria-labelledby="output-species-label"
                defaultValue={reaction?.products.at(0)?.speciesId ?? "None"}
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
                          speciesId: speciesId as UUID,
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
