import { useLayoutEffect, useState } from "react";
import { Family, Mechanism } from "../types/chemistryModels";
import { Box, Button, List, ListItem, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { SelectSpeciesButton } from "./SelectSpeciesButton";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { SelectReactionButton } from "./SelectReactionButton";

export type MechanismEditorProps = {
    family: Family;
    mechanism: Mechanism;
    updateMechanism: (mechanism: Mechanism) => void;
    navigateBack: () => void;
}

export const MechanismEditor: React.FC<MechanismEditorProps> = ({ family, mechanism, updateMechanism, navigateBack }) => {
    enum TabValue {
        Info,
        Species,
        Reactions,
        Phases,
        InitialConditions,
    }

    const [changesSaved, setChangesSaved] = useState<boolean>(true);
    const [selectedTab, setSelectedTab] = useState<TabValue>(TabValue.Info);
    const [modifiedMechanism, setModifiedMechanism] = useState<Mechanism>(mechanism);

    useLayoutEffect(() => {
        setModifiedMechanism(mechanism);
        setChangesSaved(true);
    }, [mechanism])

    const changeMechanismProperties = (properties: Partial<Mechanism>) => {
        setModifiedMechanism({
            ...modifiedMechanism,
            ...properties,
            isModified: true,
        });
        setChangesSaved(false);
    }

    const handleSave = () => {
        updateMechanism(modifiedMechanism);
        setModifiedMechanism({
            ...modifiedMechanism,
            isModified: false,
        });
    }

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
            }}
            component="section"
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    columnGap: "1em",
                }}
            >
                <Button color="primary" aria-label="Back to mechanism list" startIcon={<ArrowBackIcon />} onClick={navigateBack}>
                    Back
                </Button>
                <Button color="success" aria-label="Back to mechanism list" startIcon={<SaveIcon />} onClick={handleSave} disabled={changesSaved} variant="contained">
                    Save Changes
                </Button>
            </Box>
            <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
                <Tab value={TabValue.Info} label={"Info"}></Tab>
                <Tab value={TabValue.Species} label={"Species"}></Tab>
                <Tab value={TabValue.Reactions} label={"Reactions"}></Tab>
                <Tab value={TabValue.Phases} label={"Phases"} disabled></Tab>
                <Tab value={TabValue.InitialConditions} label={"Initial Conditions"} disabled></Tab>
            </Tabs>
            {
                selectedTab === TabValue.Info &&
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        rowGap: "1em",
                    }}
                >
                    <Typography color="textPrimary" variant="h5">{mechanism.name || "<No Name>"} Info</Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            rowGap: "0.8em",
                            maxWidth: "50%",
                        }}
                    >
                        <TextField
                            id="edit-mechanism-name"
                            label="Name"
                            defaultValue={mechanism.name}
                            onChange={(event) => {
                                changeMechanismProperties({
                                    name: event.target.value,
                                })
                            }}
                        />
                        <TextField
                            id="edit-mechanism-description"
                            label="Description"
                            defaultValue={mechanism.description}
                            multiline
                            minRows={3}
                            maxRows={6}
                            onChange={(event) => {
                                changeMechanismProperties({
                                    description: event.target.value,
                                })
                            }}
                        />
                    </Box>
                </Box>
            }
            {
                selectedTab === TabValue.Species &&
                <div>
                    <Typography color="textPrimary" variant="h5">{mechanism.name || "<No Name>"} Species</Typography>
                    <SelectSpeciesButton
                        aria-label="select-mechanism-species"
                        text="Add Species"
                        onSelect={(species) => {
                            changeMechanismProperties({
                                speciesIds: [species.id, ...modifiedMechanism.speciesIds],
                            });
                        }}
                        species={family.species.filter((species) => {
                            for (const speciesId of modifiedMechanism?.speciesIds) {
                                if (speciesId === species.id) {
                                    return false;
                                }
                            }
                            return true;
                        })}
                    />
                    <List>
                        {modifiedMechanism.speciesIds.map((id) => {
                            const species = family.species.find((element) => element.id === id);
                            return (
                                <ListItem
                                    key={`${id}-species-list-item`}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        columnGap: "1rem"
                                    }}
                                >
                                    <Typography>{species?.name || "<No name>"}</Typography>
                                    {
                                        species?.description &&
                                        <Tooltip title={species?.description}>
                                            <InfoOutlinedIcon />
                                        </Tooltip>
                                    }
                                </ListItem>
                            )
                        })}
                    </List>
                </div>
            }
            {
                selectedTab === TabValue.Reactions &&
                <div>
                    <Typography color="textPrimary" variant="h5">{mechanism.name || "<No Name>"} Reactions</Typography>
                    <SelectReactionButton
                        aria-label="select-mechanism-reactions"
                        text="Add Reaction"
                        onSelect={(reaction) => {
                            changeMechanismProperties({
                                reactionIds: [reaction.id, ...modifiedMechanism.reactionIds],
                            });
                        }}
                        reactions={family.reactions.filter((reactions) => {
                            for (const speciesId of modifiedMechanism?.reactionIds) {
                                if (speciesId === reactions.id) {
                                    return false;
                                }
                            }
                            return true;
                        })}
                    />
                    <List>
                        {modifiedMechanism.reactionIds.map((id) => {
                            const reactions = family.reactions.find((element) => element.id === id);
                            return (
                                <ListItem
                                    key={`${id}-reaction-list-item`}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        columnGap: "1rem"
                                    }}
                                >
                                    <Typography>{reactions?.name || "<No name>"}</Typography>
                                    {
                                        reactions?.description &&
                                        <Tooltip title={reactions?.description}>
                                            <InfoOutlinedIcon />
                                        </Tooltip>
                                    }
                                </ListItem>
                            )
                        })}
                    </List>
                </div>
            }
        </Box>
    );
}