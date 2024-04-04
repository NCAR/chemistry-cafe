import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import ButtonSystemGrid from '.././buttonSystem/ButtonSystemGrid';
import { getFamilies, getMechanismsFromFamily } from '../buttonSystem/API/API_GetMethods';
import { createFamily } from '../buttonSystem/API/API_CreateMethods';
import { useFamilyUuid, useMechanismUuid } from '../buttonSystem/GlobalVariables';
import { StyledHeader, StyledActionBar, StyledActionBarButton, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import Button from "@mui/material/Button";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TextField } from '@mui/material';

import "./family.css";

const FamilyPage = () => {
    const createFamRef = useRef("");

    const { familyUuid, handleFamilyClick } = useFamilyUuid();
    const { handleFamilyMechanismClick } = useMechanismUuid();
    
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

    const [addMToFOpen, setAddMtoFOpen] = React.useState(false);
    const handleAddMtoFOpen = () => setCreateFamOpen(true);
    const handleAddMtoFClose = () => setCreateFamOpen(false);

    const handleCreateFamClick = () => {
        createFamily(createFamRef.current);
        setCreateFamOpen(false);
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
                        Family/
                    </StyledHeader>
                </div>
                <div className="M1">
                    <div style={{height: "60%"}}></div>
                    <StyledActionBar>
                        <StyledActionBarButton onClick={handlePublishOpen}>Publish</StyledActionBarButton>
                        <StyledActionBarButton onClick={handleShareOpen}>Share</StyledActionBarButton>
                        <StyledActionBarButton onClick={handleDOIOpen}>Get DOI</StyledActionBarButton> 
                    </StyledActionBar>
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
                            Enter name for new Family below.
                            <TextField id="textField" label="Name" onChange={ e => createFamRef.current = e.target.value}>

                            </TextField>
                            <Button onClick={handleCreateFamClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                    {/* <Modal
                        open={createFamOpen}
                        onClose={handleCreateFamClose}
                    >
                        <Box sx={style}>
                            
                        </Box>
                    </Modal> */}
                </div>
                
                <div className="L2">
                    <Button onClick = {handleCreateFamOpen}>
                        Create Family
                    </Button>
                    <Button onClick = {handleCreateFamOpen}>
                        Add Mechanism to Family
                    </Button>
                </div>

                <div className="L3">
                    <ButtonSystemGrid buttonArray={[getFamilies()]} handleClick={handleFamilyClick} category={'Families'} height={'60vh'} cols={1}/>
                </div>

                <StyledDetailBox>
                    <p></p>
                    <ButtonSystemGrid buttonArray={[getMechanismsFromFamily(familyUuid as string)]} handleClick={handleFamilyMechanismClick} category={'MechanismsFromFamily'} height={'80vh'} cols={1} />
                    <p></p>
                </StyledDetailBox>
            </section>
        );
}

export default FamilyPage;