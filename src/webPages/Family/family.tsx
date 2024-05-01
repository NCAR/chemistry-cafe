import React, { useState } from 'react';

import RenderFamilyTree from '../Components/RenderFamilyTree';
import RenderSpeciesReactionTable from '../Components/RenderSpeciesReactionTable';
import { CreateFamilyModal, CreateTagMechanismModal } from '../Components/Modals';

import { StyledDetailBox } from './familyStyling';

import { Header, Footer } from '../Components/HeaderFooter';

import "./family.css";

const FamilyPage = () => {    

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
                <Header>
                </Header>
            </div>

            <div className="L2Fam" style={{overflow: 'auto'}}>
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