import * as React from 'react';
import { useRef } from 'react';
import ButtonSystemGrid from '../buttonSystem/ButtonSystemGrid';
import { createSpecies, createTagMechanismSpeciesList } from '../API/API_CreateMethods';
import { ProperyVersion, TagMechanismSpeciesList } from "../API/API_Interfaces";
import { getSpeciesFromTagMechanism, getPropertyiesFromParent } from '../API/API_GetMethods';
import { useSpeciesUuid, useTagMechanismUuid} from '../buttonSystem/GlobalVariables';
import { StyledHeader, StyledActionBar, StyledActionBarButton, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import RenderProperties from './RenderPropeties/RenderProperties';

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
    const { speciesUuid, handleSpeciesClick } = useSpeciesUuid();

    const [createSpeciesOpen, setCreateSpeciesOpen] = React.useState(false);
    const handleCreateSpeciesOpen = () => setCreateSpeciesOpen(true);
    const handleCreateSpeciesClose = () => setCreateSpeciesOpen(false);

    const handleCreateSpeciesClick = async () => {
        try {
            const species_uuid = await createSpecies(createSpeciesRef.current);
    
            const tagMechanismSpeciesListData: TagMechanismSpeciesList = {
                uuid: '', // Auto creates
                species_uuid: species_uuid,
                tag_mechanism_uuid: tagMechanismUuid as string,
                version: '',
                isDel: false, //Auto sets false
            };
    
            await createTagMechanismSpeciesList(tagMechanismSpeciesListData);
    
            setCreateSpeciesOpen(false);
        } catch (error) {
            console.error(error);
        }
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
                        TagMechanism/Species
                    </StyledHeader>
                </div>

                <div className="L2">
                    <Button onClick={handleCreateSpeciesOpen}>
                        Create Species For This Tag Mechanism
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
                    <ButtonSystemGrid buttonArray={[getSpeciesFromTagMechanism(tagMechanismUuid as string)]} handleClick={handleSpeciesClick} category={'SpeciesFromTagMechanism'} height={'60vh'} cols={1}/>
                </div>

                <StyledDetailBox>
                    <p></p>
                        <RenderProperties properties={[getPropertyiesFromParent(speciesUuid as string)]} />
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
            </section>
        );
}

export default SpeciesPage;