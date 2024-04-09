import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonSystemGrid from '../buttonSystem/ButtonSystemGrid';
import { getMechanisms, getTagMechanism, getTagMechanismsFromMechanism } from '../API/API_GetMethods';
import { useMechanismUuid, useTagMechanismUuid} from '../buttonSystem/GlobalVariables';
import { StyledHeader, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import Button from "@mui/material/Button";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import { ButtonGroup, ListSubheader, TextField } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';

import CalculateSharpIcon from '@mui/icons-material/CalculateSharp';
import ScienceSharpIcon from '@mui/icons-material/ScienceSharp';
import HistoryEduSharpIcon from '@mui/icons-material/HistoryEduSharp';
import InsertLinkSharpIcon from '@mui/icons-material/InsertLinkSharp';
import IosShareSharpIcon from '@mui/icons-material/IosShareSharp';
import TaskSharpIcon from '@mui/icons-material/TaskSharp';

import "./mechanisms.css";
import { createMechanism } from '../API/API_CreateMethods';
import { useRef } from 'react';
import { downloadOA } from '../API/API_DeleteMethods';


const MechanismPage = () => {
    const navigate = useNavigate();

    const createMechanismRef = useRef("");

    const [publishOpen, setPublishOpen] = React.useState(false);
    const [shareOpen, setShareOpen] = React.useState(false);
    const [doiOpen, setDOIOpen] = React.useState(false);
    const handlePublishOpen = () => setPublishOpen(true);
    const handlePublishClose = () => setPublishOpen(false);
    const handleShareOpen = () => setShareOpen(true);
    const handleShareClose = () => setShareOpen(false);
    const handleDOIOpen = () => setDOIOpen(true);
    const handleDOIClose = () => setDOIOpen(false);

    const [tagOpen, setTagOpen] = React.useState(false);
    const handleTagOpen = () => setTagOpen(true);
    const handleTagClose = () => setTagOpen(false);
    const handleSpeciesClick = () => navigate('/SpeciesPage');
    const handleReactionClick = () => navigate('/SpeciesPage');
    const handleHistoryClick = () => navigate('/SpeciesPage');

    const { mechanismUuid, handleMechanismsClick } = useMechanismUuid();
    const { tagMechanismUuid, handleTagMechanismClick } = useTagMechanismUuid();

    const [createMechanismOpen, setCreateMechanismOpen] = React.useState(false);
    const handleCreateMechanismOpen = () => setCreateMechanismOpen(true);
    const handleCreateMechanismClose = () => setCreateMechanismOpen(false);

    const handleCreateMechanismClick = () => {
        createMechanism(createMechanismRef.current);
        setCreateMechanismOpen(false);
    }

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
    
    var listName = "Options for ";
    if(tagMechanismUuid){
        listName += getTagMechanism(tagMechanismUuid as string);
    }

    const masterHandleTagMechanismClick = () => {
        if(tagMechanismUuid){
            handleTagMechanismClick(tagMechanismUuid);
        }
        handleTagOpen();
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
                        Mechanisms
                    </StyledHeader>
                </div>

                <div className="L2" style={{padding: "20px"}}>
                    <p></p>
                    <Box>
                        <ButtonGroup orientation='vertical' variant='contained'>
                            <Button onClick = {handleCreateMechanismOpen}>
                                Create Mechanism
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
                    <ButtonSystemGrid buttonArray={[getMechanisms()]} handleClick={handleMechanismsClick} category={'Mechanisms'} height={'60vh'} cols={1}/>
                </div>

                <StyledDetailBox>
                    <p></p>
                    <ButtonSystemGrid buttonArray={[getTagMechanismsFromMechanism(mechanismUuid as string)]} handleClick={masterHandleTagMechanismClick} category={'TagMechanismsFromMechanism'} height={'80vh'} cols={1} />
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

export default MechanismPage;