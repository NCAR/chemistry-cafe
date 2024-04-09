import * as React from 'react';
import { useRef } from 'react';
import ButtonSystemGrid from '../buttonSystem/ButtonSystemGrid';
import { createSpecies } from '../buttonSystem/API/API_CreateMethods';
import { getSpeciesFromTagMechanism } from '../buttonSystem/API/API_GetMethods';
import { useSpeciesUuid, useTagMechanismUuid} from '../buttonSystem/GlobalVariables';
import { StyledHeader, StyledActionBar, StyledActionBarButton, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import Button from "@mui/material/Button";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';
import "./family.css";

const SpeciesPage = () => {
    const createSpeciesRef = useRef("");

    const [publishOpen, setPublishOpen] = React.useState(false);
    const [shareOpen, setShareOpen] = React.useState(false);
    const [doiOpen, setDOIOpen] = React.useState(false);
    const handlePublishOpen = () => setPublishOpen(true);
    const handlePublishClose = () => setPublishOpen(false);
    const handleShareOpen = () => setShareOpen(true);
    const handleShareClose = () => setShareOpen(false);
    const handleDOIOpen = () => setDOIOpen(true);
    const handleDOIClose = () => setDOIOpen(false);

    const { tagMechanismUuid } = useTagMechanismUuid();
    const { handleSpeciesClick } = useSpeciesUuid();

    const [createSpeciesOpen, setCreateSpeciesOpen] = React.useState(false);
    const handleCreateSpeciesOpen = () => setCreateSpeciesOpen(true);
    const handleCreateSpeciesClose = () => setCreateSpeciesOpen(false);

    const handleCreateSpeciesClick = () => {
        createSpecies(createSpeciesRef.current);
        setCreateSpeciesOpen(false);
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
                        Species/
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
                </div>
                
                <div className="L2">
                    <Button onClick = {handleCreateSpeciesOpen}>
                        Create Species
                    </Button>
                </div>

                <div className="L3">
                    <ButtonSystemGrid buttonArray={[getSpeciesFromTagMechanism(tagMechanismUuid as string)]} handleClick={handleSpeciesClick} category={'SpeciesFromTagMechanism'} height={'60vh'} cols={1}/>
                </div>

                <StyledDetailBox>
                    <p></p>
                    <ButtonSystemGrid buttonArray={[getSpeciesFromTagMechanism(tagMechanismUuid as string)]} handleClick={handleSpeciesClick} category={'SpeciesFromTagMechanism'} height={'60vh'} cols={1}/>
                    <p></p>
                </StyledDetailBox>

            </section>
        );
}

export default SpeciesPage;