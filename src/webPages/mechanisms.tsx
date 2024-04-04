import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonSystemGrid from '../buttonSystem/ButtonSystemGrid';
import { getMechanisms, getTagMechanismsFromMechanism } from '../buttonSystem/API/API_GetMethods';
import { useFamilyUuid, useMechanismUuid, useTagMechanismUuid} from '../buttonSystem/GlobalVariables';
import { StyledHeader, StyledActionBar, StyledActionBarButton, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import Button from "@mui/material/Button";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import "./mechanisms.css";

const MechanismPage = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/');

    const [publishOpen, setPublishOpen] = React.useState(false);
    const [shareOpen, setShareOpen] = React.useState(false);
    const [doiOpen, setDOIOpen] = React.useState(false);
    const handlePublishOpen = () => setPublishOpen(true);
    const handlePublishClose = () => setPublishOpen(false);
    const handleShareOpen = () => setShareOpen(true);
    const handleShareClose = () => setShareOpen(false);
    const handleDOIOpen = () => setDOIOpen(true);
    const handleDOIClose = () => setDOIOpen(false);

    const { mechanismUuid, handleMechanismsClick } = useMechanismUuid();
    const { handleTagMechanismClick } = useTagMechanismUuid();

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

                <div className="M1">
                    <div style={{height: "60%"}}></div>
                    <StyledActionBar>
                        <StyledActionBarButton onClick={handlePublishOpen}>Publish</StyledActionBarButton>
                        <StyledActionBarButton onClick={handleShareOpen}>Share</StyledActionBarButton>
                        <StyledActionBarButton onClick={handleDOIOpen}>Get DOI</StyledActionBarButton> 
                    </StyledActionBar>
                </div>

                <div className="L3">
                    <ButtonSystemGrid buttonArray={[getMechanisms()]} handleClick={handleMechanismsClick} category={'MechanismsFromFamily'} height={'60vh'} cols={1}/>
                </div>

                <StyledDetailBox>
                    <p></p>
                    <ButtonSystemGrid buttonArray={[getTagMechanismsFromMechanism(mechanismUuid as string)]} handleClick={handleTagMechanismClick} category={'TagMechanismsFromMechanism'} height={'80vh'} cols={1} />
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
                </div>
            </section>
        );
}

export default MechanismPage;