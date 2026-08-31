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
import { Family } from "../../types/chemistryModels";
import { useAuth } from "../AuthContext";
import { generateID } from "../../helpers/localFamilies";
import { modalStyle } from "./modalStyle";
import { UUID } from "crypto";

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
    const frontendId: UUID = generateID();
    const family: Family = {
      id: frontendId,
      name: familyName.current,
      description: familyDescription.current,
      owner: user,
      species: [],
      reactions: [],
      phases: [
        {
          id: generateID(),
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
