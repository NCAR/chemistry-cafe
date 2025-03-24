import { Alert, Box, Button, FormControl, Modal, ModalProps, Snackbar, TextField, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import { Family, Mechanism } from "../types/chemistryModels";

const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    minWidth: "40%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    rowGap: "0.3rem"
}

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

    const handleFamilyCreation = () => {

        if (familyName.current.length === 0) {
            setShowAlert(true);
            return;
        }

        const family: Family = {
            name: familyName.current,
            description: familyDescription.current,
            mechanisms: [],
            species: [],
            reactions: [],
            isModified: false,
            isDeleted: false,
        }
        onCreation(family);
        familyName.current = "";
        familyDescription.current = "";
    }

    const handleAlertClose = () => {
        setShowAlert(false);
    }

    return (
        <div>
            <Modal
                open={open}
                onClose={onClose}
            >
                <Box role="menu" sx={modalStyle}>
                    <Typography variant="h6">Enter Details for the Family below.</Typography>
                    <FormControl variant="standard">
                        <TextField
                            sx={{
                                width: "100%"
                            }}
                            id="family-name"
                            label="Name"
                            required={true}
                            onChange={(event) => { familyName.current = event.target.value; }}
                        />
                    </FormControl>
                    <FormControl>
                        <TextField
                            sx={{
                                width: "100%"
                            }}
                            id="family-description"
                            label="Description"
                            multiline
                            minRows={2}
                            maxRows={4}
                            onChange={(event) => { familyDescription.current = event.target.value; }}
                        />
                    </FormControl>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            columnGap: "1em",
                        }}
                    >
                        <Button
                            sx={{
                                flex: 1
                            }}
                            aria-label="Create Family"
                            color="primary"
                            variant="contained"
                            onClick={handleFamilyCreation}>
                            Submit
                        </Button>
                        <Button
                            sx={{
                                flex: 1
                            }}
                            aria-label="Create Family"
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

type MechanismCreationModalProps = {
    onCreation: (mechanism: Mechanism) => void,
} & ModalProps;

export const MechanismCreationModal: React.FC<MechanismCreationModalProps> = (props) => {
    return (
        <Modal {...props}>

        </Modal>
    );
}

