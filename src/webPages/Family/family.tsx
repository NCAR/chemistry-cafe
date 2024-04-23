import React, { useState } from 'react';

import NavDropDown from '../Components/NavDropDown';
import RenderFamilyTree from '../Components/RenderFamilyTree';
import RenderSpeciesReactionTable from '../Components/RenderSpeciesReactionTable';
import { CreateDOIModal, CreateFamilyModal, CreatePublishModal, CreateShareModal, CreateTagMechanismModal } from '../Components/Modals';

import { StyledHeader, StyledDetailBox } from './familyStyling';

import { Drawer } from '@mui/material';
import Button from "@mui/material/Button";
import DensitySmallSharpIcon from '@mui/icons-material/DensitySmallSharp';

import { Header, Footer } from '../Components/HeaderFooter';

import "./family.css";

const FamilyPage = () => {    
    const [openDrawer, setOpenDrawer] = React.useState(false);
    const toggleDrawer = (newOpenDrawer: boolean) => () => {
      setOpenDrawer(newOpenDrawer);
    };

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
        <section className="layoutFam">
            <div className='L1Fam'>
                <Header></Header>
            </div>

            <div className="L2">
                <Button onClick={toggleDrawer(true)}>
                    <DensitySmallSharpIcon sx={{fontSize: 50}}></DensitySmallSharpIcon>
                </Button> 
                <StyledHeader>
                </StyledHeader>
            </div>

            <div className="L3">
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

            <div className='L9Fam'>
                <Footer>

                </Footer>
            </div>

            <StyledDetailBox>
                <RenderSpeciesReactionTable selectedFamily={selectedFamily} selectedTagMechanism={selectedTagMechanism} />
            </StyledDetailBox>


            <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
                <NavDropDown />
            </Drawer>

            <CreateFamilyModal 
                open={createFamilyOpen}
                onClose={handleCreateFamilyClose} 
                setCreatedFamilyBool={setCreatedFamilyBool}
            />
            <CreateTagMechanismModal 
                open={createTagMechanismOpen} 
                onClose={handleCreateTagMechanismClose} 
                selectedFamily={selectedFamily} 
                setCreatedTagMechanismBool={setCreatedTagMechanismBool}
                />
        </section>
    );
}

export default FamilyPage;