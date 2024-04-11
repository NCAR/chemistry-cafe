import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import ButtonSystemGrid from '.././buttonSystem/ButtonSystemGrid';
import { getFamilies, getMechanisms, getMechanismsFromFamily } from '../API/API_GetMethods';
import { createFamily, createFamilyMechList, createMechanism } from '../API/API_CreateMethods';
import { useFamilyUuid, useMechanismUuid } from '../buttonSystem/GlobalVariables';
import { Family, FamilyMechList, Mechanism } from '../API/API_Interfaces';
import { StyledHeader, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import InsertLinkSharpIcon from '@mui/icons-material/InsertLinkSharp';
import IosShareSharpIcon from '@mui/icons-material/IosShareSharp';
import TaskSharpIcon from '@mui/icons-material/TaskSharp';

import "./family.css";


const FamilyPage = () => {    
    const createFamRef = useRef("");
    const createMechanismRef = useRef("");

    const { familyUuid, handleFamilyClick } = useFamilyUuid();
    const { mechanismUuid, handleFamilyMechanismClick } = useMechanismUuid();
    
    const [publishOpen, setPublishOpen] = React.useState(false);
    const [shareOpen, setShareOpen] = React.useState(false);
    const [doiOpen, setDOIOpen] = React.useState(false);
    const handlePublishOpen = () => setPublishOpen(true);
    const handlePublishClose = () => setPublishOpen(false);
    const handleShareOpen = () => setShareOpen(true);
    const handleShareClose = () => setShareOpen(false);
    const handleDOIOpen = () => setDOIOpen(true);
    const handleDOIClose = () => setDOIOpen(false);

    const [createFamOpen, setCreateFamOpen] = React.useState(false);
    const handleCreateFamOpen = () => setCreateFamOpen(true);
    const handleCreateFamClose = () => setCreateFamOpen(false);

    const [selectedMechanism, setSelectedMechanism] = useState('');
    const [mechanismOptions, setMechanismOptions] = useState<Mechanism[]>([]);

    const handleMechanismChange = (event: SelectChangeEvent<string>) => {
        setSelectedMechanism(event.target.value);
    };

    const [createMechanismOpen, setCreateMechanismOpen] = React.useState(false);
    const handleCreateMechanismOpen = () => setCreateMechanismOpen(true);
    const handleCreateMechanismClose = () => setCreateMechanismOpen(false);

    const handleCreateMechanismClick = () => {
        createMechanism(createMechanismRef.current);
        setCreateMechanismOpen(false);
    }


    const [addMToFOpen, setAddMtoFOpen] = React.useState(false);
    const handleAddMtoFOpen = () => setAddMtoFOpen(true);
    const handleAddMtoFClose = () => setAddMtoFOpen(false);

    const handleCreateFamClick = () => {
        createFamily(createFamRef.current);
        setCreateFamOpen(false);
    }
    const handleCreateMtoFClick = async () => {
        try {
            const familyMechList: FamilyMechList = {
                uuid: '', 
                family_uuid: familyUuid as string,
                mechanism_uuid: selectedMechanism,
                version: '1.0',
                isDel: false, //Doesn't matter
            };
            
            await createFamilyMechList(familyMechList);
            setAddMtoFOpen(false);
        } catch (error) {
            console.error(error);
        }
    }

    const [delFamOpen, setDelFamOpen] = React.useState(false);
    const handleDelFamOpen = () => setDelFamOpen(true);
    const handleDelFamClose = () => setDelFamOpen(false);

    const [selectedFamily, setSelectedFamily] = useState('');
    const [familyOptions, setFamilyOptions] = useState<Mechanism[]>([]);

    const handleFamilyChange = (event: SelectChangeEvent<string>) => {
        setSelectedFamily(event.target.value);
    };

    const handleDeleteFamClick = () => {
        console.log("Delete not rdy yet!");
    }

    useEffect(() => {
        const fetchMechanisms = async () => {
            try {
                const mechanisms = await getMechanisms();
                setMechanismOptions(mechanisms);
            } catch (error) {
                console.error(error);
            }
        };

        fetchMechanisms();
    }, [familyUuid]);

    useEffect(() => {
        const fetchFamilies = async () => {
            try {
                const families = await getFamilies();
                setFamilyOptions(families);
            } catch (error) {
                console.error(error);
            }
        };

        fetchFamilies();
    }, []);

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
                        Family/{familyUuid}
                    </StyledHeader>
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
                
                <div className="L2" style={{padding: "20px"}}>
                    <p></p>
                    <Box>
                        <ButtonGroup orientation='vertical' variant='contained'>
                            <Button onClick = {handleCreateFamOpen}>
                                Create Family
                            </Button>
                            <Button onClick = {handleCreateMechanismOpen}>
                                Create Mechanism
                            </Button>
                            <Button onClick = {handleAddMtoFOpen}>
                                Add Mechanism to Family
                            </Button>
                            <Button onClick = {handleDelFamOpen}>
                                Delete Family
                            </Button>
                        </ButtonGroup>
                        <ButtonGroup></ButtonGroup>
                    </Box>
                    <p></p>
                </div>

                <div className="L3">
                    <ButtonSystemGrid buttonArray={[getFamilies()]} uuid={familyUuid as string} handleClick={handleFamilyClick} category={'Families'} height={'40vh'} cols={1}/>
                </div>

                <StyledDetailBox>
                    <p></p>
                    <ButtonSystemGrid buttonArray={[getMechanismsFromFamily(familyUuid as string)]} uuid={mechanismUuid as string} handleClick={handleFamilyMechanismClick} category={'MechanismsFromFamily'} height={'60vh'} cols={1} />
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
                        open={createFamOpen}
                        onClose={handleCreateFamClose}
                    >
                        <Box sx={style}>
                            Enter name for new Family below.
                            <TextField id="textField" label="Name" onChange={ e => createFamRef.current = e.target.value}>

                            </TextField>
                            <Button onClick={handleCreateFamClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                    <Modal
                        open={createMechanismOpen}
                        onClose={handleCreateMechanismClose}
                    >
                        <Box sx={style}>
                            Enter name for new Mechanism below.
                            <TextField id="textField" label="Name" onChange={ e => createMechanismRef.current = e.target.value}>

                            </TextField>
                            <Button onClick={handleCreateMechanismClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                    <Modal
                        open={addMToFOpen}
                        onClose={handleAddMtoFClose}
                    >
                        <Box sx={style}>
                            Pick existing Mechanism
                            <Select
                                value={selectedMechanism}
                                onChange={handleMechanismChange}
                                label="Mechanism"
                                style={{ minWidth: 200 }}
                            >
                                {mechanismOptions.map((mechanism: Mechanism) => (
                                    <MenuItem key={mechanism.uuid} value={mechanism.uuid}>
                                        {mechanism.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Button onClick={handleCreateMtoFClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                    <Modal
                        open={delFamOpen}
                        onClose={handleDelFamClose}
                    >
                        <Box sx={style}>
                            Select Family to delete.
                            <Select
                                value={selectedFamily}
                                onChange={handleFamilyChange}
                                label="Family"
                                style={{ minWidth: 200 }}
                            >
                                {familyOptions.map((family: Family) => (
                                    <MenuItem key={family.uuid} value={family.uuid}>
                                        {family.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Button onClick={handleDeleteFamClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                </div>
            </section>
        );
}

export default FamilyPage;