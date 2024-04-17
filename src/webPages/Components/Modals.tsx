import React, { useEffect, useRef, useState } from 'react';

import { getFamily, getProductsFromReactionReactantList, getPropertyTypesFromValidation, getPropertyiesFromParent, getReactantsFromReactionReactantList, getReactionsFromTagMechanism, getSpeciesFromTagMechanism } from '../../API/API_GetMethods';
import { FamilyMechList, PropertyList, PropertyType, PropertyVersion, ReactantProductList, Reaction, Species, TagMechanismReactionList, TagMechanismSpeciesList } from '../../API/API_Interfaces';
import { createSpecies, createReaction, createTagMechanismSpeciesList, createTagMechanismReactionList, createFamily, createFamilyMechList, createTagMechanism, createPropertyList, createPropertyVersion, createReactantProduct } from '../../API/API_CreateMethods';

import { Modal, Box, TextField, Button, Typography, TableContainer, Table, TableBody, TableRow, TableCell, Paper, IconButton, Select, MenuItem, TableHead } from '@mui/material';
import { updatePropertyList, updateReactantProductList } from '../../API/API_UpdateMethods';
import { Add } from '@mui/icons-material';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

interface CreatePublishModalProps {
    open: boolean;
    onClose: () => void;
}

interface CreateShareModalProps {
    open: boolean;
    onClose: () => void;
}

interface CreateDOIModalProps {
    open: boolean;
    onClose: () => void;
}

interface CreateFamilyModalProps {
    open: boolean;
    onClose: () => void;
    setCreatedFamilyBool: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateTagMechanismModalProps {
    open: boolean;
    onClose: () => void;
    selectedFamily: string | null;
    setCreatedTagMechanismBool: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateSpeciesModalProps {
    open: boolean;
    onClose: () => void;
    selectedTagMechanism: string | null;
    setSpeciesCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateReactionModalProps {
    open: boolean;
    onClose: () => void;
    selectedTagMechanism: string | null;
    setReactionCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SpeciesPropertiesModalProps {
    open: boolean;
    onClose: () => void;
    selectedTagMechanism: string | null;
    selectedSpecies: Species | null;
}

interface ReactionPropertiesModalProps {
    open: boolean;
    onClose: () => void;
    selectedTagMechanism: string | null;
    selectedReaction: Reaction | null;
    setReactionUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateReactantModalProps {
    open: boolean;
    onClose: () => void;
    selectedTagMechanism: string | null;
    selectedReaction: Reaction | null;
    setCreatedReactantBool: React.Dispatch<React.SetStateAction<boolean>>;
    setReactionUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateProductModalProps {
    open: boolean;
    onClose: () => void;
    selectedTagMechanism: string | null;
    selectedReaction: Reaction | null;
    setCreatedProductBool: React.Dispatch<React.SetStateAction<boolean>>;
    setReactionUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CreatePublishModal: React.FC<CreatePublishModalProps> = ({ open, onClose }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box sx={style}>
                Published!
            </Box>
        </Modal>
    );
}

export const CreateShareModal: React.FC<CreateShareModalProps> = ({ open, onClose }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box sx={style}>
                Shared!
            </Box>
        </Modal>
    );
}

export const CreateDOIModal: React.FC<CreateDOIModalProps> = ({ open, onClose }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box sx={style}>
                DOI!
            </Box>
        </Modal>
    );
}

export const CreateFamilyModal: React.FC<CreateFamilyModalProps> = ({ open, onClose, setCreatedFamilyBool}) => {
    const createFamilyRef = useRef("");

    const handleCreateFamilyClick = async () => {
        try {
            await createFamily(createFamilyRef.current);
            createFamilyRef.current = '';
            onClose();
            setCreatedFamilyBool(true);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <Modal
                open={open}
                onClose={onClose}
            >
                <Box sx={style}>
                    Enter Name for Family below.
                    <TextField id="textField" label="Name" onChange={ e => createFamilyRef.current = e.target.value}/>
                    
                    <Button onClick={handleCreateFamilyClick}>
                        Submit
                    </Button>
                </Box>
            </Modal>
        </div>
    );
}

export const CreateTagMechanismModal: React.FC<CreateTagMechanismModalProps> = ({ open, onClose, selectedFamily, setCreatedTagMechanismBool }) => {
    const [speciesList, setSpeciesList] = useState<Species[]>([]);
    const [selectedSpeciesList, setSelectedSpeciesList] = useState<string[]>([]);

    const [reactionList, setReactionList] = useState<Reaction[]>([]);
    const [selectedReactionList, setSelectedReactionList] = useState<string[]>([]);

    const createTagMechanismRef = useRef("");

    useEffect(() => {
        const fetchSpeciesReactions = async () => {
            try {
                if (selectedFamily) {
                    const family = await getFamily(selectedFamily);
                    
                    const species = await getSpeciesFromTagMechanism(family.super_tag_mechanism_uuid);
                    setSpeciesList(species);

                    const reactions = await getReactionsFromTagMechanism(family.super_tag_mechanism_uuid);
                    setReactionList(reactions);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchSpeciesReactions();
    }, [open, selectedFamily]);

    const handleCreateTagMechanismClick = async () => {
        try {
            const tagMechanism = await createTagMechanism(createTagMechanismRef.current);

            const familyMechList: FamilyMechList = {
                uuid: '', // Auto creates in API
                family_uuid: selectedFamily as string,
                tag_mechanism_uuid: tagMechanism,
                version: '1.0',
                isDel: false, // Auto creates in API
            };

            await createFamilyMechList(familyMechList);

            selectedSpeciesList.forEach(async species_uuid => {
                const tagMechanismSpeciesListData: TagMechanismSpeciesList = {
                    uuid: '', // Auto creates
                    species_uuid: species_uuid,
                    tag_mechanism_uuid: tagMechanism as string,
                    version: '',
                    isDel: false, //Auto sets false
                };

                await createTagMechanismSpeciesList(tagMechanismSpeciesListData);
            });

            selectedReactionList.forEach(async reaction_uuid => {
                const tagMechanismReactionListData: TagMechanismReactionList = {
                    uuid: '', // Auto creates
                    reaction_uuid: reaction_uuid,
                    tag_mechanism_uuid: tagMechanism as string,
                    version: '',
                    isDel: false, //Auto sets false
                };

                await createTagMechanismReactionList(tagMechanismReactionListData);
            });

            createTagMechanismRef.current = '';
            setSelectedSpeciesList([]);
            setSelectedReactionList([]);

            onClose();
            setCreatedTagMechanismBool(true);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <Modal
                open={open}
                onClose={onClose}
            >
                <Box sx={style}>
                    Enter Tag for Tag Mechanism
                    <TextField id="textField" label="Tag" onChange={(e) => createTagMechanismRef.current = e.target.value} />
                    <p />
                    Select species (Multiple Selection)
                    <Select
                        label="Species"
                        multiple 
                        value={selectedSpeciesList}
                        onChange={(e) => setSelectedSpeciesList(e.target.value as string[])} // Casting to string array
                        style={{ minWidth: 200 }}
                    >
                        {speciesList.map((species) => (
                            <MenuItem key={species.uuid} value={species.uuid}>
                                {species.type}
                            </MenuItem>
                        ))}
                    </Select>
                    <p/>
                    Select reactions (Multiple Selection)
                    <Select
                        label="Reactions"
                        multiple 
                        value={selectedReactionList}
                        onChange={(e) => setSelectedReactionList(e.target.value as string[])} // Casting to string array
                        style={{ minWidth: 200 }}
                    >
                        {reactionList.map((reaction) => (
                            <MenuItem key={reaction.uuid} value={reaction.uuid}>
                                {reaction.reaction_string}
                            </MenuItem>
                        ))}
                    </Select>
                    <p/>
                    <Button onClick={handleCreateTagMechanismClick}>
                        Submit
                    </Button>
                </Box>
            </Modal>
        </div>
    );
}

export const CreateSpeciesModal: React.FC<CreateSpeciesModalProps> = ({ open, onClose, selectedTagMechanism, setSpeciesCreated }) => {
    const createSpeciesRef = useRef("");

    const handleCreateSpeciesClick = async () => {
        try {
            const species_uuid = await createSpecies(createSpeciesRef.current);
    
            const tagMechanismSpeciesListData: TagMechanismSpeciesList = {
                uuid: '', // Auto creates
                species_uuid: species_uuid,
                tag_mechanism_uuid: selectedTagMechanism as string,
                version: '',
                isDel: false, //Auto sets false
            };
    
            await createTagMechanismSpeciesList(tagMechanismSpeciesListData);
    
            createSpeciesRef.current = '';
            onClose();
            setSpeciesCreated(true);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Modal 
            open={open} 
            onClose={onClose}
        >
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
                Enter Name for Species below.
                <TextField id="textField" label="Name" onChange={e => createSpeciesRef.current = e.target.value} />
                <Button onClick={handleCreateSpeciesClick}>Submit</Button>
            </Box>
        </Modal>
    );
}

export const CreateReactionModal: React.FC<CreateReactionModalProps> = ({ open, onClose, selectedTagMechanism, setReactionCreated }) => {
    const [selectedReaction, setSelectedReaction] = useState<string>("");
    const createReactionRef = useRef<string>("");

    const handleCreateReactionClick = async () => {
        try {
            const reaction_uuid = await createReaction(selectedReaction);

            const tagMechanismReactionListData: TagMechanismReactionList = {
                uuid: '', // Auto creates
                reaction_uuid: reaction_uuid,
                tag_mechanism_uuid: selectedTagMechanism as string,
                version: '',
                isDel: false, //Auto sets false
            };

            await createTagMechanismReactionList(tagMechanismReactionListData);

            setSelectedReaction(''); // Resetting the selected reaction state
            setReactionCreated(true);
            onClose();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
                Pick a Reaction Type
                <Select
                    labelId="reaction-type-select-label"
                    id="reaction-type-select"
                    value={selectedReaction}
                    onChange={(e) => setSelectedReaction(e.target.value as string)}
                >
                    <MenuItem value="Arrhenius">Arrhenius</MenuItem>
                    <MenuItem value="Ternary Chemical Activation">Ternary Chemical Activation</MenuItem>
                    <MenuItem value="Troe (Fall-Off)">Troe (Fall-Off)</MenuItem>
                    <MenuItem value="Tunneling">Tunneling</MenuItem>
                </Select>
                <p/>
                <Button onClick={handleCreateReactionClick}>Submit</Button>
            </Box>
        </Modal>
    );
}



export const SpeciesPropertiesModal: React.FC<SpeciesPropertiesModalProps> = ({ open, onClose, selectedTagMechanism, selectedSpecies }) => {
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
    const [speciesProperties, setSpeciesProperties] = useState<PropertyVersion[]>([]);
    const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const propertyTypesData = await getPropertyTypesFromValidation('Species');
                const speciesPropertiesData = await getPropertyiesFromParent(selectedSpecies?.uuid as string);
                setPropertyTypes(propertyTypesData);
                setSpeciesProperties(speciesPropertiesData);

                const initialValues: { [key: string]: string } = {};
                speciesPropertiesData.forEach(property => {
                    let value: string;
                    if (property.int_value !== null) {
                        value = property.int_value.toString();
                    } else if (property.double_value !== null) {
                        value = property.double_value.toString();
                    } else {
                        value = property.string_value || '';
                    }
                    initialValues[property.property_type_uuid] = value;
                });
                setFieldValues(initialValues);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        
        if (selectedSpecies) {
            fetchData();
        }
    }, [selectedSpecies, onClose]);

    const handleSpeciesClick = async () => {
        for (const [propertyTypeUuid, value] of Object.entries(fieldValues)) {
            const existingProperty = speciesProperties.find(property => property.property_type_uuid === propertyTypeUuid);
            if (existingProperty && existingProperty.string_value !== value) {
                try {
                    // Update existing PropertyList version
                    const version = existingProperty.version;
                    const newVersion = "v" + (parseInt(version.substring(1)) + 1);
    
                    const propertyList: PropertyList = {
                        uuid: existingProperty.property_list_uuid,
                        parent_uuid: existingProperty.parent_uuid,
                        version: newVersion,
                        isDel: existingProperty.property_list_isDel,
                    };
                    await updatePropertyList(propertyList);
    
                    // Create new PropertyVersion with updated value
                    const newPropertyVersion: PropertyVersion = {
                        ...existingProperty,
                        frozen_version: newVersion,
                        string_value: null,
                        float_value: null,
                        double_value: null,
                        int_value: null,
                        datetime: new Date().toISOString(),
                    };
    
                    if (!isNaN(parseFloat(value))) {
                        // Check if the value is numeric
                        const parsedValue = parseFloat(value);
                        if (!Number.isInteger(parsedValue) && parsedValue !== Infinity && parsedValue !== -Infinity) {
                            // Check if parsedValue is not an integer and not Infinity
                            newPropertyVersion.double_value = parsedValue;
                        } else {
                            newPropertyVersion.int_value = parsedValue;
                        }
                    } else {
                        newPropertyVersion.string_value = value;
                    }
    
                    await createPropertyVersion(newPropertyVersion);
                } catch (error) {
                    console.error("Error updating existing property:", error);
                }
            } else if (!existingProperty) {
                try {
                    const propertyTypeObject = propertyTypes.find(propertyType => propertyType.uuid === propertyTypeUuid);
                    if (!propertyTypeObject) {
                        console.error("Property type not found");
                        return;
                    }           
    
                    // Create new PropertyList
                    const propertyList: PropertyList = {
                        uuid: '', // API auto creates
                        parent_uuid: selectedSpecies?.uuid as string,
                        version: 'v1',
                        isDel: false, // API auto sets false
                    };
                    const propertyList_uuid = await createPropertyList(propertyList);
    
                    // Create new PropertyVersion
                    const newPropertyVersion: PropertyVersion = {
                        property_list_uuid: propertyList_uuid, //Not required when createPropertyVersion
                        parent_uuid: selectedSpecies?.uuid as string, //Not required when createPropertyVersion
                        version: 'v1', //Not required when createPropertyVersion
                        property_list_isDel: false, //Not required when createPropertyVersion
                        property_version_uuid: '', //Not required when createPropertyVersion
                        parent_property_uuid: propertyList_uuid,
                        frozen_version: 'v1',
                        tag_mechanism_uuid: selectedTagMechanism as string,
                        property_type: propertyTypeUuid,
                        float_value: null,
                        double_value: null,
                        int_value: null,
                        string_value: null,
                        action: 'add',
                        user_uuid: 'f2a9b0bd-db88-4436-a9dc-eddf1c7257ad', // Test user from the database
                        datetime: new Date().toISOString(),
                        property_version_isDel: false, //Not required when createPropertyVersion
                        property_type_uuid: '', //Not required when createPropertyVersion
                        name: '', //Not required when createPropertyVersion
                        units: '', //Not required when createPropertyVersion
                        validation: '', //Not required when createPropertyVersion
                        property_type_isDel: false, //Not required when createPropertyVersion
                    };
    
                    if (!isNaN(parseFloat(value))) {
                        // Check if the value is numeric
                        const parsedValue = parseFloat(value);
                        if (!Number.isInteger(parsedValue) && parsedValue !== Infinity && parsedValue !== -Infinity) {
                            // Check if parsedValue is not an integer and not Infinity
                            newPropertyVersion.double_value = parsedValue;
                        } else {
                            newPropertyVersion.int_value = parsedValue;
                        }
                    } else {
                        newPropertyVersion.string_value = value;
                    }
    
                    await createPropertyVersion(newPropertyVersion);
                } catch (error) {
                    console.error("Error creating new property:", error);
                }
            }
        }
        onClose();
    }
    
    const handleFieldChange = (propertyTypeUuid: string, value: string) => {
        setFieldValues(prevState => ({
            ...prevState,
            [propertyTypeUuid]: value
        }));
    };

    return (
        <Modal 
            open={open} 
            onClose={onClose}
        >
            <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                bgcolor: 'background.paper', 
                border: '2px solid #000', 
                boxShadow: 24, 
                p: 4, 
                width: 600,
                maxHeight: '80vh', // Set maximum height to 80% of viewport height
                overflowY: 'auto' // Enable vertical scrolling if content overflows
            }}>
                <h1>Properties of Species: "{selectedSpecies?.type}"</h1>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Box sx={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', pb: '0.5rem', fontWeight: 'bold' }}>
                        <Typography sx={{ flex: 1 }}>Name</Typography>
                        <Typography sx={{ flex: 1 }}>Value</Typography>
                        <Typography sx={{ flex: 1 }}>Units</Typography>
                    </Box>
                    {propertyTypes.map(propertyType => {
                        return (
                            <Box key={propertyType.uuid} sx={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', pb: '0.5rem' }}>
                                <Typography sx={{ flex: 1 }}>{propertyType.name}</Typography>
                                <TextField
                                    sx={{ flex: 1 }}
                                    multiline
                                    value={fieldValues[propertyType.uuid] || ''}
                                    onChange={(e) => handleFieldChange(propertyType.uuid, e.target.value)}
                                />
                                <Typography sx={{ flex: 1 }}>{propertyType.units}</Typography>
                            </Box>
                        );
                    })}
                </Box>
                <Button sx={{ mt: '2rem' }} onClick={handleSpeciesClick}>Submit</Button>
            </Box>
        </Modal>
    );
}

export const ReactionPropertiesModal: React.FC<ReactionPropertiesModalProps> = ({ open, onClose, selectedTagMechanism, selectedReaction, setReactionUpdated }) => {
    const [createdReactantBool, setCreatedReactantBool] = useState<boolean>(false);
    const [createReactantOpen, setCreateReactantOpen] = React.useState(false);
    const handleCreateReactantOpen = () => setCreateReactantOpen(true);
    const handleCreateReactantClose = () => setCreateReactantOpen(false);

    const [createdProductBool, setCreatedProductBool] = useState<boolean>(false);
    const [createProductOpen, setCreateProductOpen] = React.useState(false);
    const handleCreateProductOpen = () => setCreateProductOpen(true);
    const handleCreateProductClose = () => setCreateProductOpen(false);
    
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
    const [reactionProperties, setReactionProperties] = useState<PropertyVersion[]>([]);
    const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>({});
    const [reactants, setReactants] = useState<ReactantProductList[]>([]);
    const [products, setProducts] = useState<ReactantProductList[]>([]);
    const [updatedReactionString, setUpdatedReactionString] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const propertyTypesData = await getPropertyTypesFromValidation(selectedReaction?.type as string);
                const reactionPropertiesData = await getPropertyiesFromParent(selectedReaction?.uuid as string);
                const reactantsData = await getReactantsFromReactionReactantList(selectedReaction?.reactant_list_uuid as string);
                const productsData = await getProductsFromReactionReactantList(selectedReaction?.product_list_uuid as string);

                setPropertyTypes(propertyTypesData);
                setReactionProperties(reactionPropertiesData);
                setReactants(reactantsData);
                setProducts(productsData);

                const initialValues: { [key: string]: string } = {};
                reactionPropertiesData.forEach(property => {
                    let value: string;
                    if (property.int_value !== null) {
                        value = property.int_value.toString();
                    } else if (property.double_value !== null) {
                        value = property.double_value.toString();
                    } else {
                        value = property.string_value || '';
                    }
                    initialValues[property.property_type_uuid] = value;
                });
                setFieldValues(initialValues);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        
        if (selectedReaction) {
            fetchData();
        }
        setCreatedReactantBool(false);
        setCreatedProductBool(false);
    }, [selectedReaction, onClose, createdReactantBool == true, createdProductBool == true]);

    useEffect(() => {
        updateReactionString();
    }, [products, reactants]);

    const updateReactionString = () => {
        let tempString = "";
    
        if (reactants.length > 0) {
            reactants.forEach((reactant, index) => {
                tempString += `${reactant.quantity}${reactant.type}`;
                if (index < reactants.length - 1) {
                    tempString += " + ";
                }
            });
        } else {
            tempString += "<none>";
        }
    
        tempString += " -> ";
    
        if (products.length > 0) {
            products.forEach((product, index) => {
                tempString += `${product.quantity}${product.type}`;
                if (index < products.length - 1) {
                    tempString += " + ";
                }
            });
        } else {
            tempString += "<none>";
        }
    
        setUpdatedReactionString(tempString);
    };
    
    const handleReactantQuantityChange = (index: number, value: string) => {
        setReactants(prevReactants => {
            const newReactants = [...prevReactants];
            newReactants[index].quantity = Number(value);
            return newReactants;
        });
        updateReactionString();
    };

    const handleProductQuantityChange = (index: number, value: string) => {
        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            newProducts[index].quantity = Number(value);
            return newProducts;
        });
        updateReactionString();
    };

    const handleFieldChange = (propertyTypeUuid: string, value: string) => {
        setFieldValues(prevState => ({
            ...prevState,
            [propertyTypeUuid]: value
        }));
    };

    const handleReactionClick = async () => {
        try {
            // Update reactants
            for (const reactant of reactants) {
                await updateReactantProductList(reactant);
            }

            // Update products
            for (const product of products) {
                await updateReactantProductList(product);
            }

            for (const [propertyTypeUuid, value] of Object.entries(fieldValues)) {
                const existingProperty = reactionProperties.find(property => property.property_type_uuid === propertyTypeUuid);
                if (existingProperty && existingProperty.string_value !== value) {
                    // Update existing PropertyList version
                    const version = existingProperty.version;
                    const newVersion = "v" + (parseInt(version.substring(1)) + 1);

                    const propertyList: PropertyList = {
                        uuid: existingProperty.property_list_uuid,
                        parent_uuid: existingProperty.parent_uuid,
                        version: newVersion,
                        isDel: existingProperty.property_list_isDel,
                    };
                    await updatePropertyList(propertyList);

                    // Create new PropertyVersion with updated value
                    const newPropertyVersion: PropertyVersion = {
                        ...existingProperty,
                        frozen_version: newVersion,
                        string_value: null,
                        float_value: null,
                        double_value: null,
                        int_value: null,
                        datetime: new Date().toISOString(),
                    };

                    if (!isNaN(parseFloat(value))) {
                        // Check if the value is numeric
                        const parsedValue = parseFloat(value);
                        if (!Number.isInteger(parsedValue) && parsedValue !== Infinity && parsedValue !== -Infinity) {
                            // Check if parsedValue is not an integer and not Infinity
                            newPropertyVersion.double_value = parsedValue;
                        } else {
                            newPropertyVersion.int_value = parsedValue;
                        }
                    } else {
                        newPropertyVersion.string_value = value;
                    }

                    await createPropertyVersion(newPropertyVersion);
                } else if (!existingProperty) {
                    const propertyTypeObject = propertyTypes.find(propertyType => propertyType.uuid === propertyTypeUuid);
                    if (!propertyTypeObject) {
                        console.error("Property type not found");
                        return;
                    }           

                    // Create new PropertyList
                    const propertyList: PropertyList = {
                        uuid: '', // API auto creates
                        parent_uuid: selectedReaction?.uuid as string,
                        version: 'v1',
                        isDel: false, // API auto sets false
                    };
                    const propertyList_uuid = await createPropertyList(propertyList);

                    // Create new PropertyVersion
                    const newPropertyVersion: PropertyVersion = {
                        property_list_uuid: propertyList_uuid, //Not required when createPropertyVersion
                        parent_uuid: selectedReaction?.uuid as string, //Not required when createPropertyVersion
                        version: 'v1', //Not required when createPropertyVersion
                        property_list_isDel: false, //Not required when createPropertyVersion
                        property_version_uuid: '', //Not required when createPropertyVersion
                        parent_property_uuid: propertyList_uuid,
                        frozen_version: 'v1',
                        tag_mechanism_uuid: selectedTagMechanism as string,
                        property_type: propertyTypeUuid,
                        float_value: null,
                        double_value: null,
                        int_value: null,
                        string_value: null,
                        action: 'add',
                        user_uuid: 'f2a9b0bd-db88-4436-a9dc-eddf1c7257ad', // Test user from the database
                        datetime: new Date().toISOString(),
                        property_version_isDel: false, //Not required when createPropertyVersion
                        property_type_uuid: '', //Not required when createPropertyVersion
                        name: '', //Not required when createPropertyVersion
                        units: '', //Not required when createPropertyVersion
                        validation: '', //Not required when createPropertyVersion
                        property_type_isDel: false, //Not required when createPropertyVersion
                    };

                    if (!isNaN(parseFloat(value))) {
                        // Check if the value is numeric
                        const parsedValue = parseFloat(value);
                        if (!Number.isInteger(parsedValue) && parsedValue !== Infinity && parsedValue !== -Infinity) {
                            // Check if parsedValue is not an integer and not Infinity
                            newPropertyVersion.double_value = parsedValue;
                        } else {
                            newPropertyVersion.int_value = parsedValue;
                        }
                    } else {
                        newPropertyVersion.string_value = value;
                    }

                    await createPropertyVersion(newPropertyVersion);
                }
            }
            setReactionUpdated(true);
            onClose();
        } catch (error) {
            console.error("Error updating data:", error);
        }
    }

    return (
        <div>
            <Modal 
                open={open} 
                onClose={onClose}
            >
                <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    bgcolor: 'background.paper', 
                    border: '2px solid #000', 
                    boxShadow: 24, 
                    p: 4, 
                    width: 600,
                    maxHeight: '80vh', // Set maximum height to 80% of viewport height
                    overflowY: 'auto' // Enable vertical scrolling if content overflows
                }}>
                    <h2> "{selectedReaction?.type}"</h2>
                    <h3 style={{ textAlign: 'center', margin: '0' }}>{updatedReactionString}</h3>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" gutterBottom>Reactants</Typography>
                            <IconButton 
                                onClick={handleCreateReactantOpen} 
                                aria-label="create reactant" 
                                style={{ color: 'blue', margin: '5px' }}
                            >
                                <Add sx={{ fontSize: 32, fontWeight: 'bold' }} />
                            </IconButton>
                        </div>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><Typography variant="body1" fontWeight="bold">Species</Typography></TableCell>
                                        <TableCell align="right"><Typography variant="body1" fontWeight="bold">Quantity</Typography></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reactants.map((reactant, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Typography variant="body1">{reactant.type}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    variant="outlined"
                                                    size="small"
                                                    type="number"
                                                    value={reactant.quantity}
                                                    onChange={(e) => handleReactantQuantityChange(index, e.target.value)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <div style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" gutterBottom>Products</Typography>
                                <IconButton 
                                    onClick={handleCreateProductOpen} 
                                    aria-label="create product" 
                                    style={{ color: 'blue', margin: '5px' }}
                                >
                                    <Add sx={{ fontSize: 32, fontWeight: 'bold' }} />
                                </IconButton>
                            </div>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><Typography variant="body1" fontWeight="bold">Species</Typography></TableCell>
                                            <TableCell align="right"><Typography variant="body1" fontWeight="bold">Quantity</Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {products.map((product, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Typography variant="body1">{product.type}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        type="number"
                                                        value={product.quantity}
                                                        onChange={(e) => handleProductQuantityChange(index, e.target.value)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </div>
                    <h1 style={{marginTop: '20px'}}>Properties</h1>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Box sx={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', pb: '0.5rem', fontWeight: 'bold' }}>
                            <Typography sx={{ flex: 1 }}>Name</Typography>
                            <Typography sx={{ flex: 1 }}>Value</Typography>
                            <Typography sx={{ flex: 1 }}>Units</Typography>
                        </Box>
                        {propertyTypes.map(propertyType => {
                            return (
                                <Box key={propertyType.uuid} sx={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', pb: '0.5rem' }}>
                                    <Typography sx={{ flex: 1 }}>{propertyType.name}</Typography>
                                    <TextField
                                        sx={{ flex: 1 }}
                                        multiline
                                        value={fieldValues[propertyType.uuid] || ''}
                                        onChange={(e) => handleFieldChange(propertyType.uuid, e.target.value)}
                                    />
                                    <Typography sx={{ flex: 1 }}>{propertyType.units}</Typography>
                                </Box>
                            );
                        })}
                    </Box>
                    <Button sx={{ mt: '2rem' }} onClick={handleReactionClick}>Submit</Button>
                </Box>
            </Modal>
            <CreateReactantModal 
                open={createReactantOpen} 
                onClose={handleCreateReactantClose} 
                selectedTagMechanism={selectedTagMechanism} 
                selectedReaction={selectedReaction} 
                setCreatedReactantBool={setCreatedReactantBool}
                setReactionUpdated={setReactionUpdated}
            />
            <CreateProductModal 
                open={createProductOpen} 
                onClose={handleCreateProductClose} 
                selectedTagMechanism={selectedTagMechanism}
                selectedReaction={selectedReaction}
                setCreatedProductBool={setCreatedProductBool}
                setReactionUpdated={setReactionUpdated}
            />
        </div>
    );
}

const CreateReactantModal: React.FC<CreateReactantModalProps> = ({ open, onClose, selectedTagMechanism, selectedReaction, setCreatedReactantBool, setReactionUpdated }) => {
    const [speciesList, setSpeciesList] = useState<Species[]>([]);
    const [selectedSpecies, setSelectedSpecies] = useState('');
    const createReactantQuantityRef = useRef("");

    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                if (selectedTagMechanism) {
                    const species = await getSpeciesFromTagMechanism(selectedTagMechanism);
                    setSpeciesList(species);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchSpecies();
    }, [open]);

    useEffect(() => {
        setSelectedSpecies('');
    }, [onClose]);

    const handleCreateReactantClick = async () => {
        try {
            const reactantProductList: ReactantProductList = {
                reactant_product_uuid: selectedReaction?.reactant_list_uuid as string,
                reaction_uuid: selectedReaction?.uuid as string,
                species_uuid: selectedSpecies,
                quantity: parseInt(createReactantQuantityRef.current),
                type: selectedReaction?.type as string,
            };

            await createReactantProduct(reactantProductList);

            createReactantQuantityRef.current = '';
            setSelectedSpecies('');
            onClose();
            setCreatedReactantBool(true);
            setReactionUpdated(true);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <Modal open={open} onClose={onClose}>
                <Box sx={style}>
                    Select a species from the list below.
                    <Select
                        label="Species"
                        value={selectedSpecies}
                        onChange={(e) => setSelectedSpecies(e.target.value as string)}
                    >
                        {speciesList.map((species) => (
                            <MenuItem key={species.uuid} value={species.uuid}>
                                {species.type}
                            </MenuItem>
                        ))}
                    </Select>
                    <p/>
                    Input a quantity for species
                    <TextField id="textField" label="Name" onChange={ e => createReactantQuantityRef.current = e.target.value}/>
                    <p/>
                    <Button onClick={handleCreateReactantClick}>
                        Submit
                    </Button>
                </Box>
            </Modal>
        </div>
    );
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ open, onClose, selectedTagMechanism, selectedReaction, setCreatedProductBool, setReactionUpdated }) => {
    const [speciesList, setSpeciesList] = useState<Species[]>([]);
    const [selectedSpecies, setSelectedSpecies] = useState('');
    const createProductQuantityRef = useRef("");

    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                if (selectedTagMechanism) {
                    const species = await getSpeciesFromTagMechanism(selectedTagMechanism);
                    setSpeciesList(species);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchSpecies();
    }, [open]);

    useEffect(() => {
        setSelectedSpecies('');
    }, [onClose]);

    const handleCreateProductClick = async () => {
        try {
            const reactantProductList: ReactantProductList = {
                reactant_product_uuid: selectedReaction?.product_list_uuid as string,
                reaction_uuid: selectedReaction?.uuid as string,
                species_uuid: selectedSpecies,
                quantity: parseInt(createProductQuantityRef.current),
                type: selectedReaction?.type as string,
            };

            await createReactantProduct(reactantProductList);

            createProductQuantityRef.current = '';
            setSelectedSpecies('');
            onClose();
            setCreatedProductBool(true);
            setReactionUpdated(true);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <Modal open={open} onClose={onClose}>
                <Box sx={style}>
                    Select a species from the list below.
                    <Select
                        label="Species"
                        value={selectedSpecies}
                        onChange={(e) => setSelectedSpecies(e.target.value as string)}
                    >
                        {speciesList.map((species) => (
                            <MenuItem key={species.uuid} value={species.uuid}>
                                {species.type}
                            </MenuItem>
                        ))}
                    </Select>
                    <p/>
                    Input a quantity for species
                    <TextField id="textField" label="Name" onChange={ e => createProductQuantityRef.current = e.target.value}/>
                    <p/>
                    <Button onClick={handleCreateProductClick}>
                        Submit
                    </Button>
                </Box>
            </Modal>
        </div>
    );
}