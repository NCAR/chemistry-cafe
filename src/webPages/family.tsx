import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import ButtonSystemGrid from '.././buttonSystem/ButtonSystemGrid';
import { getFamilies, getTagMechanism, getTagMechanisms, getTagMechanismsFromFamily } from '../API/API_GetMethods';
import { createFamily, createFamilyMechList, createTagMechanism } from '../API/API_CreateMethods';
import { downloadOA } from '../API/API_DeleteMethods';
import { useFamilyUuid, useTagMechanismUuid } from '../buttonSystem/GlobalVariables';
import { Family, FamilyMechList, TagMechanism } from '../API/API_Interfaces';
import { StyledHeader, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import NavDropDown from './NavDropDown/NavDropDown';

import InsertLinkSharpIcon from '@mui/icons-material/InsertLinkSharp';
import IosShareSharpIcon from '@mui/icons-material/IosShareSharp';
import TaskSharpIcon from '@mui/icons-material/TaskSharp';
import DensitySmallSharpIcon from '@mui/icons-material/DensitySmallSharp';
import CalculateSharpIcon from '@mui/icons-material/CalculateSharp';
import ScienceSharpIcon from '@mui/icons-material/ScienceSharp';
import HistoryEduSharpIcon from '@mui/icons-material/HistoryEduSharp';

import "./family.css";


const FamilyPage = () => {    
    const navigate = useNavigate();
    
    const createFamRef = useRef("");
    const createTagMechanismRef = useRef("");

    const { familyUuid, handleFamilyClick } = useFamilyUuid();
    const { tagMechanismUuid, handleTagMechanismClick } = useTagMechanismUuid();
    
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

    const [selectedTagMechanism, setSelectedTagMechanism] = useState('');
    const [tagMechanismOptions, setTagMechanismOptions] = useState<TagMechanism[]>([]);

    const handleTagMechanismChange = (event: SelectChangeEvent<string>) => {
        setSelectedTagMechanism(event.target.value);
    };

    const [createTagMechanismOpen, setCreateTagMechanismOpen] = React.useState(false);
    const handleCreateTagMechanismOpen = () => setCreateTagMechanismOpen(true);
    const handleCreateTagMechanismClose = () => setCreateTagMechanismOpen(false);

    const handleCreateTagMechanismClick = () => {
        createTagMechanism(createTagMechanismRef.current);
        setCreateTagMechanismOpen(false);
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
                tag_mechanism_uuid: selectedTagMechanism,
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
    const [familyOptions, setFamilyOptions] = useState<Family[]>([]);

    const handleFamilyChange = (event: SelectChangeEvent<string>) => {
        setSelectedFamily(event.target.value);
    };

    const handleDeleteFamClick = () => {
        console.log("Delete not rdy yet!");
    }

    const [tagOpen, setTagOpen] = React.useState(false);
    const handleTagOpen = () => setTagOpen(true);
    const handleTagClose = () => setTagOpen(false);
    const handleSpeciesClick = () => navigate('/SpeciesPage');
    const handleReactionClick = () => navigate('/ReactionsPage');
    const handleHistoryClick = () => console.log('History Not implemented');

    const handleDownlaodClick = async () => {
        const link = document.createElement("a");
        const body = await downloadOA(tagMechanismUuid as string);

        const blob = new Blob([body], { type: 'application/json' });

        const blobUrl = window.URL.createObjectURL(blob);

        link.download = 'openAtmos.json';
        link.href = blobUrl;

        link.click();

        window.URL.revokeObjectURL(blobUrl);
    };

    const [listName, setListName] = useState<string | null>(null);
    useEffect(() => {
        const fetchData = async () => {
            let newName = "Options for ";
            if(tagMechanismUuid){
                try {
                    const tagMechanism = await getTagMechanism(tagMechanismUuid as string);
                    newName += tagMechanism.tag;
                    setListName(newName);
                } catch (error) {
                    console.error(error);
                    setListName(null);
                }
            }
        };

        fetchData();
    }, [tagMechanismUuid]);

    const masterHandleTagMechanismClick = (uuid: string) => {
        handleTagMechanismClick(uuid);
        handleTagOpen();
    }  

    useEffect(() => {
        const fetchTagMechanisms = async () => {
            try {
                const tagMechanisms = await getTagMechanisms();
                setTagMechanismOptions(tagMechanisms);
            } catch (error) {
                console.error(error);
            }
        };

        fetchTagMechanisms();
    }, [addMToFOpen]);

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

    const [openDrawer, setOpenDrawer] = React.useState(false);
    const toggleDrawer = (newOpenDrawer: boolean) => () => {
      setOpenDrawer(newOpenDrawer);
    };

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
                    <Button onClick={toggleDrawer(true)}>
                        <DensitySmallSharpIcon sx={{fontSize: 50}}></DensitySmallSharpIcon>
                    </Button> 
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
                            <Button onClick = {handleCreateTagMechanismOpen}>
                                Create Tag Mechanism
                            </Button>
                            <Button onClick = {handleAddMtoFOpen}>
                                Add Tag Mechanism to Family
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
                    <ButtonSystemGrid buttonArray={[getTagMechanismsFromFamily(familyUuid as string)]} uuid={tagMechanismUuid as string} handleClick={masterHandleTagMechanismClick} category={'TagMechanismsFromFamily'} height={'60vh'} cols={1} />
                    <p></p>
                </StyledDetailBox>


                <div>
                    <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
                        <NavDropDown />
                    </Drawer>
                </div>
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
                            Enter name for Family below.
                            <TextField id="textField" label="Name" onChange={ e => createFamRef.current = e.target.value}>

                            </TextField>
                            <Button onClick={handleCreateFamClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                    <Modal
                        open={createTagMechanismOpen}
                        onClose={handleCreateTagMechanismClose}
                    >
                        <Box sx={style}>
                            Enter name for Tag Mechanism below.
                            <TextField id="textField" label="Name" onChange={ e => createTagMechanismRef.current = e.target.value}>

                            </TextField>
                            <Button onClick={handleCreateTagMechanismClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                    <Modal
                        open={addMToFOpen}
                        onClose={handleAddMtoFClose}
                    >
                        <Box sx={style}>
                            Pick existing Tag Mechanism
                            <Select
                                value={selectedTagMechanism}
                                onChange={handleTagMechanismChange}
                                label="TagMechanism"
                                style={{ minWidth: 200 }}
                            >
                                {tagMechanismOptions.map((tagMechanism: TagMechanism) => (
                                    <MenuItem key={tagMechanism.uuid} value={tagMechanism.uuid}>
                                        {tagMechanism.tag}
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
                    <Modal
                        open={tagOpen}
                        onClose={handleTagClose}
                    >
                        <Box sx={style}>
                            <List subheader={
                                <ListSubheader>
                                    {listName}
                                </ListSubheader>
                            }>
                                <ListItem>
                                    <ListItemButton onClick={handleReactionClick}>
                                        <ListItemIcon>
                                            <CalculateSharpIcon ></CalculateSharpIcon>
                                        </ListItemIcon>
                                        <ListItemText primary="Reactions">   
                                        </ListItemText>
                                    </ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton onClick={handleSpeciesClick}>
                                        <ListItemIcon>
                                            <ScienceSharpIcon></ScienceSharpIcon>
                                        </ListItemIcon>
                                        <ListItemText primary="Species">   
                                        </ListItemText>
                                    </ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton onClick={handleHistoryClick}>
                                        <ListItemIcon>
                                            <HistoryEduSharpIcon></HistoryEduSharpIcon>
                                        </ListItemIcon>
                                        <ListItemText primary="History">   
                                        </ListItemText>
                                    </ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton onClick={handleDownlaodClick}>
                                        <ListItemIcon>
                                            <HistoryEduSharpIcon></HistoryEduSharpIcon>
                                        </ListItemIcon>
                                        <ListItemText primary="Downlaod">   
                                        </ListItemText>
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Box>
                    </Modal>
                </div>
            </section>
        );
}

export default FamilyPage;