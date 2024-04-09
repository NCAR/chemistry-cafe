import * as React from 'react';
import { useRef } from 'react';
import ButtonSystemGrid from '../buttonSystem/ButtonSystemGrid';
import { createSpecies, createTagMechanismSpeciesList, createPropertyList, createPropertyType, createPropertyVersion } from '../API/API_CreateMethods';
import { PropertyList, PropertyType, PropertyVersion, TagMechanismSpeciesList } from "../API/API_Interfaces";
import { getSpeciesFromTagMechanism, getPropertyiesFromParent } from '../API/API_GetMethods';
import { useSpeciesUuid, useTagMechanismUuid, useMechanismUuid } from '../buttonSystem/GlobalVariables';
import { StyledHeader, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import RenderProperties from './RenderPropeties/RenderProperties';

import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import InsertLinkSharpIcon from '@mui/icons-material/InsertLinkSharp';
import IosShareSharpIcon from '@mui/icons-material/IosShareSharp';
import TaskSharpIcon from '@mui/icons-material/TaskSharp';

import "./family.css";

const SpeciesPage = () => {
    const createSpeciesRef = useRef("");

    const createPropertyNameRef = useRef("");
    const createPropertyUnitsRef = useRef("");
    const createPropertyValidationRef = useRef("");
    const createPropertyVersionValueRef = useRef("");

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
    const { speciesUuid, handleSpeciesClick } = useSpeciesUuid();

    const [createSpeciesOpen, setCreateSpeciesOpen] = React.useState(false);
    const handleCreateSpeciesOpen = () => setCreateSpeciesOpen(true);
    const handleCreateSpeciesClose = () => setCreateSpeciesOpen(false);

    const [createPropertyOpen, setCreatePropertyOpen] = React.useState(false);
    const handleCreatePropertyOpen = () => setCreatePropertyOpen(true);
    const handleCreatePropertyClose = () => setCreatePropertyOpen(false);

    const handleCreateSpeciesClick = async () => {
        try {
            const species_uuid = await createSpecies(createSpeciesRef.current);
    
            const tagMechanismSpeciesListData: TagMechanismSpeciesList = {
                uuid: '', // Auto creates
                species_uuid: species_uuid,
                tag_mechanism_uuid: tagMechanismUuid as string,
                version: '',
                isDel: false, //Auto sets false
            };
    
            await createTagMechanismSpeciesList(tagMechanismSpeciesListData);
    
            setCreateSpeciesOpen(false);
        } catch (error) {
            console.error(error);
        }
    }

    const handleCreatePropertyClick = async () => {
        try {
            const propertyList: PropertyList = {
                uuid: '', // Auto creates
                parent_uuid: speciesUuid as string,
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
                parent_uuid: speciesUuid as string,
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
                user_uuid: 'f2a9b0bd-db88-4436-a9dc-eddf1c7257ad', // Test user from the database
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
                        TagMechanism/Species
                    </StyledHeader>
                </div>

                <div className="L2" style={{padding: "20px"}}>
                    <p></p>
                    <Box>
                        <ButtonGroup orientation='vertical' variant='contained'>
                            <Button onClick = {handleCreateSpeciesOpen}>
                                Add Species
                            </Button>
                            <Button onClick = {handleCreatePropertyOpen}>
                                Add Property to Species
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
                    <ButtonSystemGrid buttonArray={[getSpeciesFromTagMechanism(tagMechanismUuid as string)]} handleClick={handleSpeciesClick} category={'SpeciesFromTagMechanism'} height={'60vh'} cols={1}/>
                </div>

                <StyledDetailBox>
                    <p></p>
                        <RenderProperties properties={[getPropertyiesFromParent(speciesUuid as string)]} />
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
                        open={createSpeciesOpen}
                        onClose={handleCreateSpeciesClose}
                    >
                        <Box sx={style}>
                            Enter name for new Species below.
                            <TextField id="textField" label="Name" onChange={ e => createSpeciesRef.current = e.target.value}>

                            </TextField>
                            <Button onClick={handleCreateSpeciesClick}>
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
                            Enter type for new value's type below.
                            <TextField id="textField" label="PropertyType" onChange={ e => createPropertyValidationRef.current = e.target.value}/>
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

export default SpeciesPage;