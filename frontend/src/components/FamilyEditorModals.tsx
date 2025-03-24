import { Alert, Box, Button, InputAdornment, InputLabel, MenuItem, Modal, ModalProps, Select, Snackbar, TextField, Typography } from "@mui/material";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrheniusReaction, Family, Mechanism, Reaction, ReactionTypeName, Species } from "../types/chemistryModels";
import { UUID } from "crypto";

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
    rowGap: "0.7em"
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
                    <Typography variant="h5">Enter Details for the Family below.</Typography>
                    <TextField
                        sx={{
                            width: "100%"
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
                            width: "100%"
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


type SpeciesEditorModalProps = {
    open: boolean;
    onClose: () => void;
    onUpdate: (species: Species) => void;
    species?: Species;
}

export const SpeciesEditorModal: React.FC<SpeciesEditorModalProps> = ({
    open,
    onClose,
    onUpdate,
    species,
}) => {
    const [speciesName, setSpeciesName] = useState<string | undefined>(species?.name);
    const [speciesDescription, setSpeciesDescription] = useState<string | undefined | null>(species?.description);
    const [absoluteTolerance, setAbsoluteTolerance] = useState<number>(0);
    const [fixedConcentration, setFixedConcentration] = useState<number>(0);
    const [molecularWeight, setMolecularWeight] = useState<number>(0);
    const [diffusionCoefficient, setDiffusionCoefficient] = useState<number>(0);

    useLayoutEffect(() => {
        if (species) {
            Object.keys(species.properties).forEach((propertyName) => {
                switch (propertyName) {
                    case "absoluteTolerance":
                        setAbsoluteTolerance(species.properties.absoluteTolerance?.value ?? 0);
                        break;
                    case "fixedConcentration":
                        setFixedConcentration(species.properties.fixedConcentration?.value ?? 0);
                        break;
                    case "molecularWeight":
                        setMolecularWeight(species.properties.molecularWeight?.value ?? 0);
                        break;
                    case "diffusionCoefficient":
                        setDiffusionCoefficient(species.properties.diffusionCoefficient?.value ?? 0);
                        break;
                }
            });
        }
    }, [species]);

    const handleUpdateSpecies = () => {
        const updatedSpecies: Species = {
            id: Date.now().toString(),
            ...species,
            name: speciesName ?? "",
            description: speciesDescription ?? "",
            properties: {
                absoluteTolerance: {
                    value: absoluteTolerance,
                    units: ""
                },
                fixedConcentration: {
                    value: fixedConcentration,
                    units: ""
                },
                diffusionCoefficient: {
                    value: diffusionCoefficient,
                    units: "m2 s-1"
                },
                molecularWeight: {
                    value: molecularWeight,
                    units: "kg mol-1"
                }
            },
        };
        onUpdate(updatedSpecies);
    }

    return (
        <div>
            <Modal
                open={open}
                onClose={onClose}
            >
                <Box sx={modalStyle} role="menu">
                    {species ? (
                        <>
                            <Typography variant="h5">Edit Species</Typography>
                            <TextField
                                sx={{
                                    width: "100%"
                                }}
                                defaultValue={species.name}
                                id="species-name"
                                label="Name"
                                onChange={(event) => {
                                    setSpeciesName(event.target.value);
                                }}
                            />
                            <TextField
                                sx={{
                                    width: "100%"
                                }}
                                defaultValue={species.description}
                                maxRows={4}
                                id="species-description"
                                label="Description"
                                onChange={(event) => {
                                    setSpeciesDescription(event.target.value);
                                }}
                            />
                            <TextField
                                onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
                                sx={{
                                    width: "100%"
                                }}
                                defaultValue={absoluteTolerance}
                                type="number"
                                id="species-tolerance"
                                label="Absolute Tolerance"
                                onChange={(event) => {
                                    const num = Number.parseFloat(event.target.value);
                                    if (Number.isFinite(num)) {
                                        setAbsoluteTolerance(num);
                                    }
                                }}
                            />
                            <TextField
                                onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
                                sx={{
                                    width: "100%"
                                }}
                                defaultValue={fixedConcentration}
                                type="number"
                                id="species-concentration"
                                label="Fixed Concentration"
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="start">M</InputAdornment>
                                    }
                                }}
                                onChange={(event) => {
                                    const num = Number.parseFloat(event.target.value);
                                    if (Number.isFinite(num)) {
                                        setFixedConcentration(num);
                                    }
                                }}
                            />
                            <TextField
                                onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
                                sx={{
                                    width: "100%"
                                }}
                                defaultValue={molecularWeight}
                                type="number"
                                id="species-weight"
                                label="Molecular Weight"
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="start">kg mol<sup>-1</sup></InputAdornment>
                                    }
                                }}
                                onChange={(event) => {
                                    const num = Number.parseFloat(event.target.value);
                                    if (Number.isFinite(num)) {
                                        setFixedConcentration(num);
                                    }
                                }}
                            />
                            <TextField
                                onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
                                sx={{
                                    width: "100%"
                                }}
                                defaultValue={diffusionCoefficient}
                                type="number"
                                id="species-diffusion-coefficient"
                                label="Diffusion Coefficient"
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="start">m<sup>2</sup> s<sup>-1</sup></InputAdornment>
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
                                        flex: 1
                                    }}
                                    aria-label="Create Family"
                                    color="primary"
                                    variant="contained"
                                    onClick={handleUpdateSpecies}
                                >
                                    Submit
                                </Button>
                                <Button
                                    sx={{
                                        flex: 1
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
                            <Button variant="contained" color="warning" onClick={onClose}>Exit</Button>
                        </>
                    )}
                </Box>
            </Modal>
        </div>
    );

}

type ReactionsEditorModalProps = {
    open: boolean;
    onClose: () => void;
    onUpdate: (reaction: Reaction) => void;
    reaction?: Reaction;
    family: Family;
}

export const ReactionsEditorModal: React.FC<ReactionsEditorModalProps> = ({
    open,
    onClose,
    onUpdate,
    reaction,
    family,
}) => {
    const [modifiedReaction, setModifiedReaction] = useState<ArrheniusReaction | undefined>(reaction as ArrheniusReaction);

    const changeReactionProperties = (properties: any) => {
        setModifiedReaction({
            ...modifiedReaction,
            ...properties,
        })
    }

    useEffect(() => console.log(modifiedReaction), [modifiedReaction]);

    const handleUpdateReaction = () => {
        // onUpdate(modifiedReaction);
    }

    return (
        <div>
            <Modal
                open={open}
                onClose={onClose}
            >
                <Box
                    sx={{
                        ...modalStyle,
                        width: "70%",
                    }}
                    role="menu"
                >
                    <InputLabel id="reaction-type-label">Reaction Type (Arrhenius is only available at the moment)</InputLabel>
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
                    <Typography variant="h5">Reactants</Typography>
                    {modifiedReaction?.reactants.map((reactant) => {
                        const species = family.species.find(e => e.id == reactant.speciesId);
                        return (
                            <Box>
                                <Typography>{species?.name}</Typography>
                                <Typography>{reactant.coefficient}</Typography>
                            </Box>
                        );
                    })}
                    <Typography variant="h5">Products</Typography>
                    {modifiedReaction?.products.map((product) => {
                        const species = family.species.find(e => e.id == product.speciesId);
                        return (
                            <Box>
                                <Typography>{species?.name}</Typography>
                                <Typography>{product.coefficient}</Typography>
                            </Box>
                        );
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
                                flex: 1
                            }}
                            aria-label="Create Family"
                            color="primary"
                            variant="contained"
                            onClick={handleUpdateReaction}
                        >
                            Submit
                        </Button>
                        <Button
                            sx={{
                                flex: 1
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
}
