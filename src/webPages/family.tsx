import React, { useState } from 'react';

import NavDropDown from './Components/NavDropDown';
import RenderFamilyTree from './Components/RenderFamilyTree';
import RenderSpeciesReactionTable from './Components/RenderSpeciesReactionTable';
import { CreateDOIModal, CreateFamilyModal, CreatePublishModal, CreateShareModal, CreateTagMechanismModal } from './Components/Modals';

import { StyledHeader, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';

import { Drawer } from '@mui/material';
import Button from "@mui/material/Button";
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import InsertLinkSharpIcon from '@mui/icons-material/InsertLinkSharp';
import IosShareSharpIcon from '@mui/icons-material/IosShareSharp';
import TaskSharpIcon from '@mui/icons-material/TaskSharp';
import DensitySmallSharpIcon from '@mui/icons-material/DensitySmallSharp';

import "./family.css";

const FamilyPage = () => {    
    const [openDrawer, setOpenDrawer] = React.useState(false);
    const toggleDrawer = (newOpenDrawer: boolean) => () => {
      setOpenDrawer(newOpenDrawer);
    };

    const [publishOpen, setPublishOpen] = React.useState(false);
    const [shareOpen, setShareOpen] = React.useState(false);
    const [doiOpen, setDOIOpen] = React.useState(false);
    const handlePublishOpen = () => setPublishOpen(true);
    const handlePublishClose = () => setPublishOpen(false);
    const handleShareOpen = () => setShareOpen(true);
    const handleShareClose = () => setShareOpen(false);
    const handleDOIOpen = () => setDOIOpen(true);
    const handleDOIClose = () => setDOIOpen(false);

    const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
    const [selectedTagMechanism, setSelectedTagMechanism] = useState<string | null>(null);

    const [createdFamilyBool, setCreatedFamilyBool] = useState<boolean>(false);
    const [createFamilyOpen, setCreateFamilyOpen] = React.useState(false);
    const handleCreateFamilyOpen = () => setCreateFamilyOpen(true);
    const handleCreateFamilyClose = () => setCreateFamilyOpen(false);

    const [createdTagMechanismBool, setCreatedTagMechanismBool] = useState<boolean>(false);
    const [createTagMechanismOpen, setCreateTagMechanismOpen] = React.useState(false);
    const handleCreateTagMechanismOpen = () => setCreateTagMechanismOpen(true);
    const handleCreateTagMechanismClose = () => setCreateTagMechanismOpen(false);

    return (
        <section className="layout">

            <div className="L1">
                <Button onClick={toggleDrawer(true)}>
                    <DensitySmallSharpIcon sx={{fontSize: 50}}></DensitySmallSharpIcon>
                </Button> 
                <StyledHeader>
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

            <div className="L2">
                <RenderFamilyTree 
                    selectedFamily={selectedFamily}
                    setSelectedFamily={setSelectedFamily} 
                    setSelectedTagMechanism={setSelectedTagMechanism} 
                    handleCreateFamilyOpen={handleCreateFamilyOpen} 
                    handleCreateTagMechanismOpen={handleCreateTagMechanismOpen}
                    createdFamilyBool={createdFamilyBool}
                    setCreatedFamilyBool={setCreatedFamilyBool}
                    createdTagMechanismBool={createdTagMechanismBool}
                    setCreatedTagMechanismBool={setCreatedTagMechanismBool}
                />
            </div>

            <StyledDetailBox>
                <RenderSpeciesReactionTable selectedTagMechanism={selectedTagMechanism} />
            </StyledDetailBox>


            <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
                <NavDropDown />
            </Drawer>

            <CreatePublishModal open={publishOpen} onClose={handlePublishClose}/>
            <CreateShareModal open={shareOpen} onClose={handleShareClose}/>
            <CreateDOIModal open={doiOpen} onClose={handleDOIClose}/>
            <CreateFamilyModal open={createFamilyOpen} onClose={handleCreateFamilyClose} setCreatedFamilyBool={setCreatedFamilyBool}/>
            <CreateTagMechanismModal open={createTagMechanismOpen} onClose={handleCreateTagMechanismClose} selectedFamily={selectedFamily} setCreatedTagMechanismBool={setCreatedTagMechanismBool}/>
        </section>
    );
}

export default FamilyPage;