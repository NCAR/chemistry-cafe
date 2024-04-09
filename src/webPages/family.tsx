import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import ButtonSystemGrid from '.././buttonSystem/ButtonSystemGrid';
import { getFamilies, getMechanismsFromFamily } from '../API/API_GetMethods';
import { createFamily } from '../API/API_CreateMethods';
import { useFamilyUuid, useMechanismUuid } from '../buttonSystem/GlobalVariables';
import { FamilyMechList } from '../buttonSystem/API/API_Interfaces';
import { StyledHeader, StyledActionBar, StyledActionBarButton, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TextField } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import InsertLinkSharpIcon from '@mui/icons-material/InsertLinkSharp';
import IosShareSharpIcon from '@mui/icons-material/IosShareSharp';
import TaskSharpIcon from '@mui/icons-material/TaskSharp';

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
    const handleAddMtoFOpen = () => setAddMtoFOpen(true);
    const handleAddMtoFClose = () => setAddMtoFOpen(false);

    const handleCreateFamClick = () => {
        createFamily(createFamRef.current);
        setCreateFamOpen(false);
    }
    const handleCreateMtoFClick = () => {
        let obj = { uuid: "", family_uuid: createFamRef.current, mechanism_uuid: "", version: "", isDel: false};
        createFamilyMechList(obj);
        setAddMtoFOpen(false);
    }
    const handleFamSelect = (uuid: string) => {
        handleFamilyClick(uuid);
        if(familyUuid){
            createFamRef.current = familyUuid;
        }
    }

    const [delFamOpen, setDelFamOpen] = React.useState(false);
    const handleDelFamOpen = () => setDelFamOpen(true);
    const handleDelFamClose = () => setDelFamOpen(false);

    const handleDeleteFamClick = () => {
        console.log("Delete not rdy yet!");
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
                            <Button onClick = {handleAddMtoFOpen}>
                                Add Mechanism to Family
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
                    <ButtonSystemGrid buttonArray={[getFamilies()]} handleClick={handleFamilyClick} category={'Families'} height={'60vh'} cols={1}/>
                </div>

                <StyledDetailBox>
                    <p></p>
                    <ButtonSystemGrid buttonArray={[getMechanismsFromFamily(familyUuid as string)]} handleClick={handleFamilyMechanismClick} category={'MechanismsFromFamily'} height={'80vh'} cols={1} />
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
                    <Modal
                        open={addMToFOpen}
                        onClose={handleAddMtoFClose}
                    >
                        <Box sx={style}>
                            Enter name for new Mechanism to selected Family.
                            <p></p>
                            <ButtonSystemGrid buttonArray={[getFamilies()]} handleClick={handleFamSelect} category={'Families'} height={'50vh'} cols={1}/>
                            <TextField id="textFieldAddMtoF" label="Name" onChange={ e => createFamRef.current = e.target.value}>

                            </TextField>
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
                            <p></p>
                            <ButtonSystemGrid buttonArray={[getFamilies()]} handleClick={handleFamilyClick} category={'Families'} height={'50vh'} cols={1}/>
                            <Button onClick={handleDeleteFamClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                </div>
            </section>
        );
}

export default FamilyPage;