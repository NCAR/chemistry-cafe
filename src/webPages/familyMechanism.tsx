import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import ButtonSystemGrid from '../buttonSystem/ButtonSystemGrid';
import { getMechanismsFromFamily, getTagMechanismsFromMechanism, getTagMechanism } from '../buttonSystem/API/API_GetMethods';
import { createMechanism } from '../buttonSystem/API/API_CreateMethods';
import { useFamilyUuid, useMechanismUuid, useTagMechanismUuid} from '../buttonSystem/GlobalVariables';
import { StyledHeader, StyledActionBar, StyledActionBarButton, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';

import Button from "@mui/material/Button";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import { ListSubheader } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';

import CalculateSharpIcon from '@mui/icons-material/CalculateSharp';
import ScienceSharpIcon from '@mui/icons-material/ScienceSharp';
import HistoryEduSharpIcon from '@mui/icons-material/HistoryEduSharp';
import InsertLinkSharpIcon from '@mui/icons-material/InsertLinkSharp';
import IosShareSharpIcon from '@mui/icons-material/IosShareSharp';
import TaskSharpIcon from '@mui/icons-material/TaskSharp';

import "./family.css";

const FamilyMechanismPage = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/');

    const createMechRef = useRef("");

    const [publishOpen, setPublishOpen] = React.useState(false);
    const [shareOpen, setShareOpen] = React.useState(false);
    const [doiOpen, setDOIOpen] = React.useState(false);
    const handlePublishOpen = () => setPublishOpen(true);
    const handlePublishClose = () => setPublishOpen(false);
    const handleShareOpen = () => setShareOpen(true);
    const handleShareClose = () => setShareOpen(false);
    const handleDOIOpen = () => setDOIOpen(true);
    const handleDOIClose = () => setDOIOpen(false);

    const [createMechOpen, setCreateMechOpen] = React.useState(false);
    const handleCreateMechOpen = () => setCreateMechOpen(true);
    const handleCreateMechClose = () => setCreateMechOpen(false);

    const [tagOpen, setTagOpen] = React.useState(false);
    const handleTagOpen = () => setTagOpen(true);
    const handleTagClose = () => setTagOpen(false);
    const handleSpeciesClick = () => navigate('/SpeciesPage');
    const handleReactionClick = () => navigate('/SpeciesPage');
    const handleHistoryClick = () => navigate('/SpeciesPage');

    const { familyUuid } = useFamilyUuid();
    const { mechanismUuid, handleMechanismsClick } = useMechanismUuid();
    const { tagMechanismUuid, handleTagMechanismClick } = useTagMechanismUuid();

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

    const handleCreateMechClick = () => {
        createMechanism(createMechRef.current);
        setCreateMechOpen(false);
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
                        Family/Mechanism
                    </StyledHeader>
                </div>

                <div className="L2">
                    <Button onClick={handleCreateMechOpen}>
                        Create Mechanism For This Family
                    </Button>
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
                    <ButtonSystemGrid buttonArray={[getMechanismsFromFamily(familyUuid as string)]} handleClick={handleMechanismsClick} category={'MechanismsFromFamily'} height={'60vh'} cols={1}/>
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
                        open={createMechOpen}
                        onClose={handleCreateMechClose}
                    >
                        <Box sx={style}>
                            Enter name for new Mechanism below.
                            <TextField id="textField" label="Name" onChange={ e => createMechRef.current = e.target.value}>

                            </TextField>
                            <Button onClick={handleCreateMechClick}>
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
                            </List>
                        </Box>
                    </Modal>
                </div>
            </section>
        );
}

export default FamilyMechanismPage;