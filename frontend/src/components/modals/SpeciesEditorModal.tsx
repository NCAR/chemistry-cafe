import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Modal,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { speciesExclusiveConflict } from "../../helpers/editorHelpers";
import React, { useLayoutEffect, useState } from "react";
import { Species } from "../../types/chemistryModels";
import UnitComponent from "../UnitComponent";
import { modalStyle } from "./modalStyle";

type SpeciesEditorModalProps = {
  open: boolean;
  onClose: () => void;
  onUpdate: (species: Species) => void;
  species?: Species;
};

const stringDisplayValues = [
  {
    'name': 'Name',
    'key': 'name',
    'id': 'name',
  },
  {
    'name': 'Description',
    'key': 'description',
    'id': 'description',
  }
]

const numericDisplayValues = [
  {
    'name': 'Absolute tolerance',
    'key': 'absoluteTolerance',
    'id': 'absolute-tolerance',
    'units': 'mol m-3',
  },
  {
    'name': 'Constant concentration',
    'key': 'constantConcentration',
    'id': 'constant-concentration',
    'units': 'mol m-3',
  },
  {
    'name': 'Constant mixing ratio',
    'key': 'constantMixingRatio',
    'id': 'constant-mixing-ratio',
    'units': 'mol mol-1',
  },
  {
    'name': 'Molecular weight',
    'key': 'molecularWeight',
    'id': 'molecular-weight',
    'units': 'kg mol-1',
  }
]

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

  const getDisplayValue = (key: keyof Species) => {
    const currentValue = modifiedSpecies?.[key] ?? species?.[key];
    return currentValue == null ? "" : String(currentValue);
  };

  const handleUpdateSpecies = () => {
    if (!modifiedSpecies?.name) {
      setAlertMessage("Name must not be empty!");
      setShowAlert(true);
      return;
    }

    if (speciesExclusiveConflict(modifiedSpecies)) {
      setAlertMessage(
        "A species may set only one of: constant concentration, constant mixing ratio, or third body.",
      );
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
                Edit Species Properties
              </Typography>
              {
                stringDisplayValues.map((item) => (
                  <TextField
                    color="primary"
                    key={`${species.id}-${item.id}`}
                    id={`${species.id}-${item.id}`}
                    required={item.key === "name"}
                    sx={{
                      width: "100%",
                    }}
                    value={getDisplayValue(item.key as keyof Species)}
                    label={item.name}
                    type="text"
                    onChange={(event) => {
                      changeSpeciesProperties({
                        [item.key]: event.target.value,
                      });
                    }}
                  />
                ))
              }
              {
                numericDisplayValues.map((item) => (
                  <TextField
                    color="primary"
                    key={`${species.id}-${item.id}`}
                    id={`${species.id}-${item.id}`}
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
                    value={getDisplayValue(item.key as keyof Species)}
                    label={item.name}
                    type="number"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="start">
                            <UnitComponent units={item.units} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    onChange={(event) => {
                      const num = parseFloat(event.target.value);
                      changeSpeciesProperties({
                        [item.key]: event.target.value.length === 0 ? undefined : num,
                      });
                    }}
                  />
                ))
              }
              <FormControlLabel
                control={
                  <Checkbox
                    checked={modifiedSpecies?.isThirdBody ?? false}
                    onChange={(event) =>
                      changeSpeciesProperties({
                        isThirdBody: event.target.checked,
                      })
                    }
                  />
                }
                label="Third body (M)"
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
