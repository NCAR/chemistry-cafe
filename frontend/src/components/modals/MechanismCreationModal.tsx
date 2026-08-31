import {
  Alert,
  Box,
  Button,
  Modal,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { Mechanism } from "../../types/chemistryModels";
import { generateID } from "../../helpers/localFamilies";
import { modalStyle } from "./modalStyle";
import { UUID } from "crypto";

type MechanismCreationModalProps = {
  open: boolean;
  familyId: UUID;
  onClose: () => void;
  onSubmit: (mechanism: Mechanism) => void;
};

export const MechanismCreationModal: React.FC<MechanismCreationModalProps> = ({
  open,
  familyId,
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

    const frontendId: UUID = generateID();
    const mechanism: Mechanism = {
      id: frontendId,
      name: mechanismName.current,
      description: mechanismDescription.current,
      familyId: familyId,
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
