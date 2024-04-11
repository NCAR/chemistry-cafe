import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getFamilies, getTagMechanismsFromFamily } from '../API/API_GetMethods';
import { createFamily, } from '../API/API_CreateMethods';
import { Family, TagMechanism } from '../API/API_Interfaces';
import { StyledHeader, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { CircularProgress, Drawer, TextField } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import NavDropDown from './NavDropDown/NavDropDown';

import InsertLinkSharpIcon from '@mui/icons-material/InsertLinkSharp';
import IosShareSharpIcon from '@mui/icons-material/IosShareSharp';
import TaskSharpIcon from '@mui/icons-material/TaskSharp';
import DensitySmallSharpIcon from '@mui/icons-material/DensitySmallSharp';


import "./family.css";
import { Margin } from '@mui/icons-material';


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
    const [families, setFamilies] = useState<Family[]>([]);
    const [tagMechanismsMap, setTagMechanismsMap] = useState<Record<string, TagMechanism[]>>({});
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedFamilies = await getFamilies();
                setFamilies(fetchedFamilies);
                setLoading(false);

                const tagMechanismsPromises = fetchedFamilies.map(family => getTagMechanismsFromFamily(family.uuid));
                const tagMechanisms = await Promise.all(tagMechanismsPromises);
                const tagMechanismsMap: Record<string, TagMechanism[]> = {};
                fetchedFamilies.forEach((family, index) => {
                    tagMechanismsMap[family.uuid] = tagMechanisms[index];
                });
                setTagMechanismsMap(tagMechanismsMap);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [families]);

    const createFamilyRef = useRef("");

    const [createFamilyOpen, setCreateFamilyOpen] = React.useState(false);
    const handleCreateFamilyOpen = () => setCreateFamilyOpen(true);
    const handleCreateFamilyClose = () => setCreateFamilyOpen(false);

    const [familySuccessOpen, setFamilySuccessOpen] = React.useState(false);
    const [familyFailOpen, setFamilyFailOpen] = React.useState(false);

    const handleCreateFamilySuccessClose = () => {
        setFamilySuccessOpen(false);
    };

    const handleCreateFamilySuccess = () => {
        setFamilySuccessOpen(true);
        setTimeout(() => {
            setFamilySuccessOpen(false);
        }, 2500);
    };

    const handleCreateFamilyFailClose = () => {
        setFamilyFailOpen(false);
    };

    const handleCreateFamilyFail = () => {
        setFamilyFailOpen(true);
        setTimeout(() => {
            setFamilyFailOpen(false);
        }, 2500);
    };

    const handleCreateFamilyClick = async () => {
        try {
            await createFamily(createFamilyRef.current);
            createFamilyRef.current = '';
            handleCreateFamilySuccess();
        } catch (error) {
            console.error(error);
            handleCreateFamilyFail();
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

    const successFail = {
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: 'auto',
        height: 'auto',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#000',
        borderRadius: '4px',
        border: '2px solid #000',
        boxShadow: 24,
        margin: '1%',
    };

    const treeItemStyle = {
        fontSize: '1.2rem',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '8px 12px',
        margin: '4px',
        cursor: 'pointer',
    };

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
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <div>
                                <ButtonGroup orientation='vertical' variant='contained'>
                                    <Button onClick = {handleCreateFamilyOpen}>
                                        Create Family
                                    </Button>
                                </ButtonGroup>
                                <h2 style={{textAlign: 'center'}}>Families</h2>
                            </div>
                            <SimpleTreeView>
                                {families.map((family) => (
                                    <TreeItem
                                        key={family.uuid}
                                        itemId={family.uuid}
                                        label={family.name}
                                        sx={treeItemStyle}
                                        onClick={() => setSelectedFamily(family.uuid)}
                                    >
                                        <h3 style={{textAlign: 'center'}}>Tag Mechanisms</h3>
                                        {tagMechanismsMap[family.uuid]?.map((tagMechanism) => (
                                            <TreeItem
                                                key={tagMechanism.uuid}
                                                itemId={tagMechanism.uuid}
                                                label={tagMechanism.tag}
                                                sx={treeItemStyle}
                                                onClick={() => setSelectedTagMechanism(tagMechanism.uuid)}
                                            />
                                        ))}
                                    </TreeItem>
                                ))}
                            </SimpleTreeView>
                        </>
                    )}
                </div>

                <StyledDetailBox>

                </StyledDetailBox>


                <div>
                    <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
                        <NavDropDown />
                    </Drawer>
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
                        open={createFamilyOpen}
                        onClose={handleCreateFamilyClose}
                    >
                        <Box sx={style}>
                            Enter name for Family below.
                            <TextField id="textField" label="Name" onChange={ e => createFamilyRef.current = e.target.value}/>
                            
                            <Button onClick={handleCreateFamilyClick}>
                                Submit
                            </Button>
                        </Box>
                    </Modal>
                    <Modal
                        open={familySuccessOpen || familyFailOpen}
                        onClose={familySuccessOpen ? handleCreateFamilySuccessClose : handleCreateFamilyFailClose}
                        BackdropProps={{ invisible: true }}
                        className={familySuccessOpen || familyFailOpen ? 'modal-visible' : 'modal-hidden'}
                    >
                        <Box sx={{ ...successFail, backgroundColor: familySuccessOpen ? '#00FF00' : '#FF0000' }}>
                            {familySuccessOpen ? 'Family created successfully!' : 'Failed to create family!'}
                        </Box>
                    </Modal>
                </div>
            </section>
        );
}

export default FamilyPage;