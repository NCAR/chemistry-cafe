import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Modal,
  ModalProps,
  Paper,
  Select,
  Snackbar,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import React, {
  MouseEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ArrheniusReaction,
  defaultSpeciesProperties,
  Family,
  Mechanism,
  Reaction,
  Species,
  SpeciesProperty,
} from "../types/chemistryModels";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCustomTheme } from "./CustomThemeContext";
import { UnitComponent } from "./UnitComponent";

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

    const family: Family = {
      id: Date.now().toString(),
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
            error={nameError}
            id="family-name"
            label="Name"
            required={true}
            onChange={(event) => {
              familyName.current = event.target.value;
              setNameError(false);
            }}
          />
          <TextField
            sx={{
              width: "100%",
            }}
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
  onCreation: (mechanism: Mechanism) => void;
} & ModalProps;

export const MechanismCreationModal: React.FC<MechanismCreationModalProps> = (
  props,
) => {
  return <Modal {...props}></Modal>;
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
  const { theme } = useCustomTheme();
  const [modifiedSpecies, setModifiedSpecies] = useState<Species | undefined>();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("None");

  useLayoutEffect(() => {
    setModifiedSpecies(species);
  }, [species]);

  const handleUpdateSpecies = () => {
    if (!modifiedSpecies?.name) {
      setAlertMessage("Name must not be empty");
      setShowAlert(true);
      return;
    }

    if (modifiedSpecies) {
      onUpdate(modifiedSpecies);
    }
    onClose();
  };

  const changeSpeciesProperties = (properties: any) => {
    setModifiedSpecies({
      ...modifiedSpecies,
      ...properties,
    });
  }

  const handleAlertClose = () => {
    setShowAlert(false);
    setAlertMessage("None")
  }

  return (
    <div>
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle} role="menu">
          {species ? (
            <>
              <Typography color={theme.palette.text.primary} variant="h5">Edit Species</Typography>
              <TextField
                sx={{
                  width: "100%",
                }}
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
                defaultValue={species.description}
                maxRows={4}
                id="species-description"
                label="Description"
                onChange={(event) => {
                  changeSpeciesProperties({
                    description: event.target.value,
                  });
                }}
              />
              {
                defaultSpeciesProperties.map((element: SpeciesProperty) => {
                  const property = modifiedSpecies?.properties[element.serializedKey ?? element.name] ?? element
                  if (typeof property.value == "number") {
                    return (
                      <TextField
                        key={`${species.id}-${property.name}`}
                        id={`${species.id}-${property.name}`}
                        onWheel={(event) =>
                          event.target instanceof HTMLElement && event.target.blur()
                        }
                        sx={{
                          width: "100%",

                          // Removes up and down arrows for number
                          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                            display: "none",
                          },
                          "& input[type=number]": {
                            MozAppearance: "textfield",
                          },
                        }}
                        defaultValue={property.value}
                        label={property.name}
                        type="number"
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="start">
                                {property.units && <UnitComponent
                                  units={property.units}
                                />}
                              </InputAdornment>
                            ),
                          },
                        }}
                        onChange={(event) => {
                          const num = Number.parseFloat(event.target.value);
                          if (Number.isFinite(num)) {
                            let properties: {
                              [key: string]: SpeciesProperty;
                            } = {
                              ...modifiedSpecies?.properties,
                            }

                            properties[property.serializedKey ?? property.name] = {
                              ...property,
                              value: num,
                            };

                            changeSpeciesProperties({
                              properties: properties,
                            });
                          }
                        }}
                      />);
                  }
                  else if (typeof property.value == "string") {
                    return (
                      <TextField
                        key={`${species.id}-${property.name}`}
                        label={property.name}
                        value="Currently Unsupported"
                        disabled
                      />
                    );
                  }
                  else {
                    return null;
                  }
                })
              }
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

type SelectSpeciesButtonProps = {
  onSelect: (species: Species) => void;
  "aria-label": string;
  species: Array<Species>;
};

const SelectSpeciesButton: React.FC<SelectSpeciesButtonProps> = ({
  "aria-label": ariaLabel,
  onSelect,
  species,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleMenuClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton
        aria-label={ariaLabel}
        color="primary"
        onClick={handleMenuOpen}
      >
        <AddIcon />
      </IconButton>
      <Menu open={open} anchorEl={anchorEl} onClose={handleMenuClose}>
        {species.length == 0 ? (
          <MenuItem disabled>
            <Typography>No Species Found</Typography>
          </MenuItem>
        ) : (
          species.map((reactant, index) => {
            return (
              <MenuItem
                key={`selection-${reactant.id}-${index}`}
                onClick={() => {
                  onSelect(reactant);
                  handleMenuClose();
                }}
              >
                <Typography>{reactant.name || "<No Name>"}</Typography>
              </MenuItem>
            );
          })
        )}
      </Menu>
    </>
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
  const { theme } = useCustomTheme();
  const [modifiedReaction, setModifiedReaction] = useState<
    ArrheniusReaction | undefined
  >(reaction as ArrheniusReaction);

  const changeReactionProperties = (properties: any) => {
    setModifiedReaction({
      ...modifiedReaction,
      ...properties,
    });
  };

  useLayoutEffect(() => {
    setModifiedReaction(reaction as ArrheniusReaction);
  }, [reaction]);

  const handleUpdateReaction = () => {
    if (!modifiedReaction) {
      return;
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
            overflowY: "scroll",
          }}
          role="menu"
        >
          <Typography color={theme.palette.text.primary} variant="h4">
            Enter Reaction Details (WIP)
          </Typography>
          <TextField
            sx={{
              width: "100%",
            }}
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

          <Typography color={theme.palette.text.primary} variant="h6">
            Reaction Type (Arrhenius is only available at the moment)
          </Typography>
          <Select
            disabled
            labelId="reaction-type-label"
            id="reaction-type"
            label="Reaction Type"
            value={"ARRHENIUS"}
            onChange={(event) => {
              changeReactionProperties({
                type: event.target.value,
              });
            }}
          >
            <MenuItem value="NONE">N/A</MenuItem>
            <MenuItem value="ARRHENIUS">Arrhenius</MenuItem>
          </Select>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Typography color={theme.palette.text.primary} variant="h6">
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
                <Typography>{species?.name}</Typography>
                <Paper
                  sx={{
                    padding: "0.2em",
                  }}
                  elevation={2}
                >
                  <Typography>Quantity: {reactant.coefficient}</Typography>
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
            <Typography color={theme.palette.text.primary} variant="h6">Products</Typography>
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
              (e) => e.id == product.speciesId,
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
                <Typography>{species?.name || "<Empty>"}</Typography>
                <Paper
                  sx={{
                    padding: "0.2em",
                  }}
                  elevation={2}
                >
                  <Typography>Yield: {product.coefficient}</Typography>
                </Paper>
                <IconButton
                  aria-label="Remove Species From Products"
                  onClick={() => {
                    changeReactionProperties({
                      products: modifiedReaction.products.filter(
                        (e) => e.speciesId !== product.speciesId,
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
          <Typography color={theme.palette.text.primary} variant="h6">Reaction Attributes</Typography>
          <TextField
            onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
            sx={{
              width: "100%",
            }}
            type="number"
            defaultValue={modifiedReaction?.A ?? 0}
            id="arrhenius-reaction-a-value"
            label="A"
            onChange={(event) => {
              const num = Number.parseFloat(event.target.value);
              if (Number.isFinite(num)) {
                changeReactionProperties({
                  A: num,
                });
              }
            }}
          />
          <TextField
            onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
            sx={{
              width: "100%",
            }}
            type="number"
            defaultValue={modifiedReaction?.B ?? 0}
            id="arrhenius-reaction-b-value"
            label="B"
            onChange={(event) => {
              const num = Number.parseFloat(event.target.value);
              if (Number.isFinite(num)) {
                changeReactionProperties({
                  B: num,
                });
              }
            }}
          />
          <TextField
            onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
            sx={{
              width: "100%",
            }}
            type="number"
            defaultValue={modifiedReaction?.C ?? 0}
            id="arrhenius-reaction-c-value"
            label="C"
            onChange={(event) => {
              const num = Number.parseFloat(event.target.value);
              if (Number.isFinite(num)) {
                changeReactionProperties({
                  C: num,
                });
              }
            }}
          />
          <TextField
            onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
            sx={{
              width: "100%",
            }}
            type="number"
            defaultValue={modifiedReaction?.D ?? 0}
            id="arrhenius-reaction-d-value"
            label="D"
            onChange={(event) => {
              const num = Number.parseFloat(event.target.value);
              if (Number.isFinite(num)) {
                changeReactionProperties({
                  D: num,
                });
              }
            }}
          />
          <TextField
            onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
            sx={{
              width: "100%",
            }}
            type="number"
            defaultValue={modifiedReaction?.E ?? 0}
            id="arrhenius-reaction-e-value"
            label="E"
            onChange={(event) => {
              const num = Number.parseFloat(event.target.value);
              if (Number.isFinite(num)) {
                changeReactionProperties({
                  E: num,
                });
              }
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
    </div>
  );
};
