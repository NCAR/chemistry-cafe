import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import ButtonSystemGrid from '../buttonSystem/ButtonSystemGrid';
import { createReaction, createTagMechanismReactionList, createPropertyList, createPropertyType, createPropertyVersion, createReactantProduct } from '../API/API_CreateMethods';
import { Species, PropertyList, PropertyType, PropertyVersion, TagMechanismReactionList, ReactantProductList} from "../API/API_Interfaces";
import { getReaction, getReactantsFromReactionReactantList, getProductsFromReactionReactantList, getReactionsFromTagMechanism, getSpeciesFromTagMechanism, getPropertyiesFromParent } from '../API/API_GetMethods';
import { useReactionUuid, useTagMechanismUuid, useMechanismUuid } from '../buttonSystem/GlobalVariables';
import { StyledHeader, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import RenderProperties from './RenderPropeties/RenderProperties';
import RenderReactantProducts from './RenderReactantsProducts/RenderReactantsProducts';

import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { TextField, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import InsertLinkSharpIcon from '@mui/icons-material/InsertLinkSharp';
import IosShareSharpIcon from '@mui/icons-material/IosShareSharp';
import TaskSharpIcon from '@mui/icons-material/TaskSharp';

import "./family.css";

const ReactionsPage = () => {
    const location = useLocation();
    
    const createReactionRef = useRef("");

    const createPropertyNameRef = useRef("");
    const createPropertyUnitsRef = useRef("");
    const createPropertyValidationRef = useRef("");
    const [propertyType, setPropertyType] = useState<string>('');

    const handlePropertyTypeChange = (event: SelectChangeEvent<string>) => {
        setPropertyType(event.target.value);
    };

    const createPropertyVersionValueRef = useRef("");

    const createReactantQuantityRef = useRef("");
    const [selectedSpecies, setSelectedSpecies] = useState('');
    const [speciesOptions, setSpeciesOptions] = useState<Species[]>([]);

    const handleSpeciesChange = (event: SelectChangeEvent<string>) => {
        setSelectedSpecies(event.target.value);
    };

    const createProductQuantityRef = useRef("");

    const [publishOpen, setPublishOpen] = React.useState(false);
    const [shareOpen, setShareOpen] = React.useState(false);
    const [doiOpen, setDOIOpen] = React.useState(false);
    const handlePublishOpen = () => setPublishOpen(true);
    const handlePublishClose = () => setPublishOpen(false);
    const handleShareOpen = () => setShareOpen(true);
    const handleShareClose = () => setShareOpen(false);
    const handleDOIOpen = () => setDOIOpen(true);
    const handleDOIClose = () => setDOIOpen(false);

    const { mechanismUuid } = useMechanismUuid();
    const { tagMechanismUuid } = useTagMechanismUuid();
    const { reactionUuid, setReactionUuid, reactantListUuid, setReactantListUuid, productListUuid, setProductListUuid, handleReactionClick } = useReactionUuid();

    const [createReactionOpen, setCreateReactionOpen] = React.useState(false);
    const handleCreateReactionOpen = () => setCreateReactionOpen(true);
    const handleCreateReactionClose = () => setCreateReactionOpen(false);

    const [createPropertyOpen, setCreatePropertyOpen] = React.useState(false);
    const handleCreatePropertyOpen = () => setCreatePropertyOpen(true);
    const handleCreatePropertyClose = () => { setCreatePropertyOpen(false); setPropertyType('')}

    const [createReactantOpen, setCreateReactantOpen] = React.useState(false);
    const handleCreateReactantOpen = () => setCreateReactantOpen(true);
    const handleCreateReactantClose = () => { setCreateReactantOpen(false); setSelectedSpecies('')};

    const [createProductOpen, setCreateProductOpen] = React.useState(false);
    const handleCreateProductOpen = () => setCreateProductOpen(true);
    const handleCreateProductClose = () => { setCreateProductOpen(false); setSelectedSpecies('')};

    useEffect(() => {
        setReactionUuid('');
        setReactantListUuid('');
        setProductListUuid('');
    }, [location]);

    const handleCreateReactionClick = async () => {
        try {
            const reaction_uuid = await createReaction(createReactionRef.current);
    
            const tagMechanismReactionListData: TagMechanismReactionList = {
                uuid: '', // Auto creates
                reaction_uuid: reaction_uuid,
                tag_mechanism_uuid: tagMechanismUuid as string,
                version: '',
                isDel: false, //Auto sets false
            };
    
            await createTagMechanismReactionList(tagMechanismReactionListData);
    
            setCreateReactionOpen(false);
        } catch (error) {
            console.error(error);
        }
    }

    const handleCreatePropertyClick = async () => {
        try {
            const propertyList: PropertyList = {
                uuid: '', // Auto creates
                parent_uuid: reactionUuid as string,
                version: '1.0',
                isDel: false, //Auto sets false
            };
            
            const propertyList_uuid = await createPropertyList(propertyList);
    
            const propertyType: PropertyType = {
                uuid: '', // Auto creates
                name: createPropertyNameRef.current,
                units: createPropertyUnitsRef.current,
                validation: createPropertyValidationRef.current,
                isDel: false, //Auto sets false
            };
    
            const propertyType_uuid = await createPropertyType(propertyType);

            let float_value: number | null = null;
            let double_value: number | null = null;
            let int_value: number | null = null;
            let string_value: string | null = null;

            if (createPropertyValidationRef.current == 'float') {
                float_value = parseFloat(createPropertyVersionValueRef.current);
            } else if (createPropertyValidationRef.current == 'double') {
                double_value = parseFloat(createPropertyVersionValueRef.current);
            } else if (createPropertyValidationRef.current == 'int') {
                int_value = parseInt(createPropertyVersionValueRef.current);
            } else if (createPropertyValidationRef.current == 'string') {
                string_value = createPropertyVersionValueRef.current;
            }

            const propertyVersion: PropertyVersion = {
                property_list_uuid: propertyList_uuid,
                parent_uuid: reactionUuid as string,
                version: '1.0',
                property_list_isDel: false,
                property_version_uuid: '',
                parent_property_uuid: propertyList_uuid,
                frozen_version: '1.0',
                mechanism_uuid: mechanismUuid as string,
                property_type: propertyType_uuid,
                float_value: float_value,
                double_value: double_value,
                int_value: int_value,
                string_value: string_value,
                action: 'add',
                user_uuid: 'f2a9b0bd-db88-4436-a9dc-eddf1c7257ad',
                datetime: new Date().toISOString(),
                property_version_isDel: false,
                property_type_uuid: propertyType_uuid,
                name: createPropertyNameRef.current,
                units: createPropertyUnitsRef.current,
                validation: createPropertyValidationRef.current,
                property_type_isDel: false,
            };

            createPropertyVersion(propertyVersion);
    
            setCreatePropertyOpen(false);
        } catch (error) {
            console.error(error);
        }
    }

    const handleCreateReactantClick = async () => {
        try {
            const reactantProductList: ReactantProductList = {
                reactant_product_uuid: reactantListUuid as string, 
                reaction_uuid: reactionUuid as string,
                species_uuid: selectedSpecies,
                quantity: parseInt(createReactantQuantityRef.current),
                type: '', //Doesn't matter
            };
            
            await createReactantProduct(reactantProductList);
            setCreateReactantOpen(false);
        } catch (error) {
            console.error(error);
        }
    }

    const handleCreateProductClick = async () => {
        try {
            const reactantProductList: ReactantProductList = {
                reactant_product_uuid: productListUuid as string, 
                reaction_uuid: reactionUuid as string,
                species_uuid: selectedSpecies,
                quantity: parseInt(createProductQuantityRef.current),
                type: '', //Doesn't matter
            };
            
            await createReactantProduct(reactantProductList);
            setCreateProductOpen(false);
        } catch (error) {
            console.error(error);
        }
    }

    const masterhandleReactionClick = (uuid: string, reactant_list_uuid?: string, product_list_uuid?: string) => {
        handleReactionClick(uuid, reactant_list_uuid as string, product_list_uuid as string);
    }  
    
    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                const species = await getSpeciesFromTagMechanism(tagMechanismUuid as string);
                setSpeciesOptions(species);
            } catch (error) {
                console.error(error);
            }
        };

        fetchSpecies();
    }, [tagMechanismUuid]);

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
    
        return (
            <section className="layout">
                <div className="L1">
                    <StyledHeader>
                        TagMechanism/{tagMechanismUuid}/Reactions/{reactionUuid}
                    </StyledHeader>
                </div>

                <div className="L2" style={{padding: "20px"}}>
                    <p></p>
                    <Box>
                        <ButtonGroup orientation='vertical' variant='contained'>
                            <Button onClick = {handleCreateReactionOpen}>
                                Add Reaction
                            </Button>
                            <Button onClick = {handleCreatePropertyOpen}>
                                Add Property to Reaction
                            </Button>
                        </ButtonGroup>
                        <ButtonGroup></ButtonGroup>
                    </Box>
                    <p></p>
                </div>

                <div className='M1'>
                    <div style={{height: "40%"}}></div>
                    <BottomNavigation 
                        showLabels
                    >
                        <BottomNavigationAction label="Publish" icon={<TaskSharpIcon/>} onClick={handlePublishOpen}></BottomNavigationAction>
                        <BottomNavigationAction label="Share" icon={<IosShareSharpIcon/>} onClick={handleShareOpen}></BottomNavigationAction>
                        <BottomNavigationAction label="Get DOI" icon={<InsertLinkSharpIcon/>} onClick={handleDOIOpen}></BottomNavigationAction>
                    </BottomNavigation>
                </div>

                <div className="L3">
                    <ButtonSystemGrid buttonArray={[getReactionsFromTagMechanism(tagMechanismUuid as string)]} handleClick={masterhandleReactionClick} category={'ReactionsFromTagMechanism'} height={'60vh'} cols={1}/>
                </div>

                <StyledDetailBox>
                    <p></p>
                        <RenderReactantProducts reactantProducts={[getReactantsFromReactionReactantList(reactantListUuid as string)]} reactants_or_products='Reactants' handleClick={handleCreateReactantOpen}/>
                        <RenderReactantProducts reactantProducts={[getProductsFromReactionReactantList(productListUuid as string)]} reactants_or_products='Products' handleClick={handleCreateProductOpen}/>
                        <RenderProperties properties={[getPropertyiesFromParent(reactionUuid as string)]} />
                    <p></p>
                </StyledDetailBox>

                
                <div>
                    <Modal
                        open={publishOpen}
                        onClose={handlePublishClose}
                    >
                        <Box sx={style}>
                            Published!
                        </Box>
                    </Modal>
                    <Modal
                        open={shareOpen}
                        onClose={handleShareClose}
                    >
                        <Box sx={style}>
                            Shared!
                        </Box>
                    </Modal>
                    <Modal
                        open={doiOpen}
                        onClose={handleDOIClose}
                    >
                        <Box sx={style}>
                            DOI!
                        </Box>
                    </Modal>
                    <Modal
                        open={createReactionOpen}
                        onClose={handleCreateReactionClose}
                    >
                        <Box sx={style}>
                            Enter type for new Reaction below.
                            <TextField id="textField" label="Name" onChange={ e => createReactionRef.current = e.target.value}>

                            </TextField>
                            <Button onClick={handleCreateReactionClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                    <Modal
                        open={createReactantOpen}
                        onClose={handleCreateReactantClose}
                    >
                        <Box sx={style}>
                            <div>
                                Enter Species.
                                <Select
                                    value={selectedSpecies}
                                    onChange={handleSpeciesChange}
                                    label="Species"
                                    style={{ minWidth: 200 }}
                                >
                                    {speciesOptions.map((species: Species) => (
                                        <MenuItem key={species.uuid} value={species.uuid}>
                                            {species.type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <p></p>
                            Enter quantity for reactant below.
                            <TextField id="quantity" label="Quantity" onChange={(e) => createReactantQuantityRef.current = e.target.value} />
                            <Button onClick={handleCreateReactantClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                    <Modal
                        open={createProductOpen}
                        onClose={handleCreateProductClose}
                    >
                        <Box sx={style}>
                            <div>
                                Enter Species.
                                <Select
                                    value={selectedSpecies}
                                    onChange={handleSpeciesChange}
                                    label="Species"
                                    style={{ minWidth: 200 }}
                                >
                                    {speciesOptions.map((species: Species) => (
                                        <MenuItem key={species.uuid} value={species.uuid}>
                                            {species.type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <p></p>
                            Enter quantity for product below.
                            <TextField id="quantity" label="Quantity" onChange={(e) => createProductQuantityRef.current = e.target.value} />
                            <Button onClick={handleCreateProductClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                    <Modal
                        open={createPropertyOpen}
                        onClose={handleCreatePropertyClose}
                    >
                        <Box sx={style}>
                            Enter name for new Property Name below.
                            <TextField id="textField" label="PropertyName" onChange={ e => createPropertyNameRef.current = e.target.value}/>
                            <p></p>
                            Enter units for new Property's Units below.
                            <TextField id="textField" label="PropertyUnits" onChange={ e => createPropertyUnitsRef.current = e.target.value}/>
                            <p></p>
                            Select type for new value's type below.
                            <Select
                                labelId="propertyTypeLabel"
                                id="propertyType"
                                value={propertyType}
                                onChange={handlePropertyTypeChange}
                                label="PropertyType"
                            >
                                <MenuItem value="string">Text</MenuItem>
                                <MenuItem value="int">Integer Number</MenuItem>
                                <MenuItem value="double">Decimal Number</MenuItem>
                                <MenuItem value="float">Scientific Number</MenuItem>
                            </Select>
                            <p></p>
                            Enter value for new Property value below.
                            <TextField id="textField" label="PropertyValue" onChange={ e => createPropertyVersionValueRef.current = e.target.value}/>
                            <Button onClick={handleCreatePropertyClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                </div>
            </section>
        );
}

export default ReactionsPage;