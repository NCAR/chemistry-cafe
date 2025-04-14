import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
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
  arrheniusAttributeOptions,
  firstOrderLossAttributeOptions,
  troeAttributeOptions,
  photolysisAttributeOptions,
  emmissionAttributeOptions,
} from "../types/chemistryModels";
import DeleteIcon from "@mui/icons-material/Delete";
import { UnitComponent } from "./UnitComponent";
import { SelectSpeciesButton } from "./SelectSpeciesButton";

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
  onCreation: (family: Family) => void;
};

export const FamilyCreationModal: React.FC<FamilyCreationModalProps> = ({
  open,
  onClose,
  onCreation,
}) => {
  const familyName = useRef<string>("");
  const familyDescription = useRef<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [nameError, setNameError] = useState<boolean>(false);

  const handleFamilyCreation = () => {
    if (familyName.current.length === 0) {
      setShowAlert(true);
      setNameError(true);
      return;
    }
    const frontendId: string = `${Date.now()}-${Math.floor(Math.random() * 10000000000)}`;
    const family: Family = {
      id: frontendId,
      name: familyName.current,
      description: familyDescription.current,
      mechanisms: [],
      species: [],
      reactions: [],
      isModified: false,
      isDeleted: false,
      isInDatabase: false,
    };
    onCreation(family);
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
          <Typography variant="h5">
            Enter Details for the Family below.
          </Typography>
          <TextField
            sx={{
              width: "100%",
            }}
            color="primary"
            error={nameError}
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
  onCreation: (mechanism: Mechanism) => void;
};

export const MechanismCreationModal: React.FC<MechanismCreationModalProps> = ({
  open,
  onClose,
  onCreation,
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

    const frontendId: string = `${Date.now()}-${Math.floor(Math.random() * 10000000000)}`;
    const mechanism: Mechanism = {
      id: frontendId,
      name: mechanismName.current,
      description: mechanismDescription.current,
      phases: [],
      familyId: "",
      speciesIds: [],
      reactionIds: [],
    };

    onCreation(mechanism);
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
            Enter Details for the Mechanism below.
          </Typography>
          <TextField
            sx={{
              width: "100%",
            }}
            color="primary"
            error={nameError}
            id="mechanism-name"
            label="Name"
            required={true}
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
              aria-label="Create Family"
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
              {speciesAttributeOptions.map((element: SpeciesAttribute) => {
                const attribute =
                  modifiedSpecies?.attributes[
                    element.serializedKey ?? element.name
                  ] ?? element;
                if (typeof attribute.value == "number") {
                  return (
                    <TextField
                      color="primary"
                      key={`${species.id}-${attribute.name}`}
                      id={`${species.id}-${attribute.name}`}
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
                      defaultValue={attribute.value}
                      label={attribute.name}
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
                        if (Number.isFinite(num)) {
                          let modifiedAttributes: {
                            [key: string]: SpeciesAttribute;
                          } = {
                            ...modifiedSpecies?.attributes,
                          };

                          modifiedAttributes[
                            attribute.serializedKey ?? attribute.name
                          ] = {
                            ...attribute,
                            value: num,
                          };

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
                      key={`${species.id}-${attribute.name}`}
                      label={attribute.name}
                      value="Currently Unsupported"
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

type ReactionsEditorModalProps = {
  open: boolean;
  onClose: () => void;
  onUpdate: (reaction: Reaction) => void;
  reaction?: Reaction;
  family: Family;
};

export const ReactionsEditorModal: React.FC<ReactionsEditorModalProps> = ({
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
    switch (type) {
      case "FIRST_ORDER_LOSS":
        return firstOrderLossAttributeOptions;
      case "TROE":
        return troeAttributeOptions;
      case "PHOTOLYSIS":
        return photolysisAttributeOptions;
      case "EMMISSION":
        return emmissionAttributeOptions;
      case "ARRHENIUS":
        return arrheniusAttributeOptions;
      case "NONE":
      default:
        return [];
    }
  };

  useLayoutEffect(() => {
    setModifiedReaction(reaction);
    const attributes = getReactionAttributes(reaction?.type);
    setDefaultAttributes(attributes);
  }, [reaction]);

  const handleUpdateReaction = () => {
    if (!modifiedReaction?.name) {
      setShowAlert(true);
      return;
    }

    if (!modifiedReaction) {
      return;
    }

    onUpdate(modifiedReaction);
    onClose();
  };

  const handleAlertClose = () => setShowAlert(false);

  return (
    <div>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            ...modalStyle,
            width: "60%",
            maxHeight: "80%",
            overflowY: "scroll",
          }}
          role="menu"
        >
          <Typography color="textPrimary" variant="h4">
            Enter Reaction Details (WIP)
          </Typography>
          <TextField
            sx={{
              width: "100%",
            }}
            color="primary"
            id="family-name"
            label="Name"
            required={true}
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
            multiline
            minRows={2}
            maxRows={4}
            onChange={(event) => {
              changeReactionProperties({
                description: event.target.value,
              });
            }}
          />

          <Typography color="textPrimary" variant="h6">
            Reaction Type
          </Typography>
          <Select
            labelId="reaction-type-label"
            id="reaction-type"
            aria-label="Reaction Type"
            defaultValue={reaction?.type ?? "NONE"}
            color="primary"
            onChange={(event) => {
              const attributes = getReactionAttributes(
                event.target.value as ReactionTypeName,
              );
              let reactionAttributes: {
                [key: string]: ReactionAttribute;
              } = {};
              for (const attribute of attributes) {
                reactionAttributes[attribute.serializedKey ?? attribute.name] =
                  attribute;
              }
              changeReactionProperties({
                type: event.target.value as ReactionTypeName,
                attributes: reactionAttributes,
              });
              setDefaultAttributes(attributes);
            }}
          >
            <MenuItem value="NONE">None</MenuItem>
            <MenuItem value="TROE">Troe</MenuItem>
            <MenuItem value="PHOTOLYSIS">Photolysis</MenuItem>
            <MenuItem value="FIRST_ORDER_LOSS">First Order Loss</MenuItem>
            <MenuItem value="EMMISSION">Emmission</MenuItem>
            <MenuItem value="ARRHENIUS">Arrhenius</MenuItem>
          </Select>
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
                    reactants: [...modifiedReaction.reactants, reactantEntry],
                  });
                }
              }}
              species={family.species.filter((species) => {
                if (!modifiedReaction) {
                  return true;
                }
                for (const reactant of modifiedReaction?.reactants) {
                  if (reactant.speciesId === species.id) {
                    return false;
                  }
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
                    minWidth: "30%",
                  }}
                  elevation={1}
                >
                  <Typography color="textPrimary">{species?.name}</Typography>
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel id="Quantity">Quantity</InputLabel>
                    <Select
                      labelId={`${reactant.speciesId}-select-label`}
                      id={`${reactant.speciesId}-select`}
                      label="Quantity"
                      defaultValue={reactant.coefficient}
                      onChange={(event) => {
                        if (!modifiedReaction) {
                          return;
                        }
                        const coefficient = event.target.value as number;
                        changeReactionProperties({
                          reactants: modifiedReaction.reactants.map(
                            (element) => {
                              if (element.speciesId === reactant.speciesId) {
                                return {
                                  ...reactant,
                                  coefficient,
                                };
                              }
                              return element;
                            },
                          ),
                        });
                      }}
                    >
                      {
                        /** Fills with menu with numbers 1-10 */
                        Array(10)
                          .fill(0)
                          .map((_, i) => {
                            return (
                              <MenuItem
                                key={`${reactant.speciesId}-coefficient-selection-${i}`}
                                value={i + 1}
                              >
                                {i + 1}
                              </MenuItem>
                            );
                          })
                      }
                    </Select>
                  </FormControl>
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
                for (const product of modifiedReaction?.products) {
                  if (product.speciesId === species.id) {
                    return false;
                  }
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
                    minWidth: "30%",
                  }}
                  elevation={1}
                >
                  <Typography color="textPrimary">{species?.name}</Typography>
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel id="Quantity">Quantity</InputLabel>
                    <Select
                      labelId={`${product.speciesId}-select-label`}
                      id={`${product.speciesId}-select`}
                      label="Quantity"
                      defaultValue={product.coefficient}
                      onChange={(event) => {
                        if (!modifiedReaction) {
                          return;
                        }
                        const coefficient = event.target.value as number;
                        changeReactionProperties({
                          products: modifiedReaction.products.map((element) => {
                            if (element.speciesId === product.speciesId) {
                              return {
                                ...product,
                                coefficient,
                              };
                            }
                            return element;
                          }),
                        });
                      }}
                    >
                      {
                        /** Fills with menu with numbers 1-10 */
                        Array(10)
                          .fill(0)
                          .map((_, i) => {
                            return (
                              <MenuItem
                                key={`${product.speciesId}-coefficient-selection-${i}`}
                                value={i + 1}
                              >
                                {i + 1}
                              </MenuItem>
                            );
                          })
                      }
                    </Select>
                  </FormControl>
                </Paper>
                <IconButton
                  aria-label="Remove Species From Products"
                  onClick={() => {
                    changeReactionProperties({
                      products: modifiedReaction.products.filter(
                        (element) => element.speciesId !== product.speciesId,
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
                  key={`${reaction?.id}-${attribute.name}`}
                  id={`${reaction?.id}-${attribute.name}`}
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
                  defaultValue={attribute.value}
                  label={attribute.name}
                  type="number"
                  onChange={(event) => {
                    const num = Number.parseFloat(event.target.value);
                    if (Number.isFinite(num)) {
                      let modifiedAttributes: {
                        [key: string]: ReactionAttribute;
                      } = {
                        ...modifiedReaction?.attributes,
                      };

                      modifiedAttributes[
                        attribute.serializedKey ?? attribute.name
                      ] = {
                        ...attribute,
                        value: num,
                      };

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
          Name must not be empty!
        </Alert>
      </Snackbar>
    </div>
  );
};
