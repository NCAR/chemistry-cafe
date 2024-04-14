import React, { useRef } from 'react';

import { FamilyMechList, TagMechanismReactionList, TagMechanismSpeciesList } from '../../API/API_Interfaces';
import { createSpecies, createReaction, createTagMechanismSpeciesList, createTagMechanismReactionList, createFamily, createFamilyMechList, createTagMechanism } from '../../API/API_CreateMethods';

import { Modal, Box, TextField, Button } from '@mui/material';

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

interface CreatePublishModalProps {
    open: boolean;
    onClose: () => void;
}

interface CreateShareModalProps {
    open: boolean;
    onClose: () => void;
}

interface CreateDOIModalProps {
    open: boolean;
    onClose: () => void;
}

interface CreateFamilyModalProps {
    open: boolean;
    onClose: () => void;
    setCreatedFamilyBool: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateTagMechanismModalProps {
    open: boolean;
    onClose: () => void;
    selectedFamily: string | null;
    setCreatedTagMechanismBool: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateSpeciesModalProps {
    open: boolean;
    onClose: () => void;
    selectedTagMechanism: string | null;
    setSpeciesCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateReactionModalProps {
    open: boolean;
    onClose: () => void;
    selectedTagMechanism: string | null;
    setReactionCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CreatePublishModal: React.FC<CreatePublishModalProps> = ({ open, onClose }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box sx={style}>
                Published!
            </Box>
        </Modal>
    );
}

export const CreateShareModal: React.FC<CreateShareModalProps> = ({ open, onClose }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box sx={style}>
                Shared!
            </Box>
        </Modal>
    );
}

export const CreateDOIModal: React.FC<CreateDOIModalProps> = ({ open, onClose }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box sx={style}>
                DOI!
            </Box>
        </Modal>
    );
}

export const CreateFamilyModal: React.FC<CreateFamilyModalProps> = ({ open, onClose, setCreatedFamilyBool}) => {
    const createFamilyRef = useRef("");

    const handleCreateFamilyClick = async () => {
        try {
            await createFamily(createFamilyRef.current);
            createFamilyRef.current = '';
            onClose();
            setCreatedFamilyBool(true);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <Modal
                open={open}
                onClose={onClose}
            >
                <Box sx={style}>
                    Enter name for Family below.
                    <TextField id="textField" label="Name" onChange={ e => createFamilyRef.current = e.target.value}/>
                    
                    <Button onClick={handleCreateFamilyClick}>
                        Submit
                    </Button>
                </Box>
            </Modal>
        </div>
    );
}

export const CreateTagMechanismModal: React.FC<CreateTagMechanismModalProps> = ({ open, onClose, selectedFamily, setCreatedTagMechanismBool }) => {
    const createTagMechanismRef = useRef("");

    const handleCreateTagMechanismClick = async () => {
        try {

            const tagMechanism = await createTagMechanism(createTagMechanismRef.current);

            const familyMechList: FamilyMechList = {
                uuid: '', // Auto creates in API
                family_uuid: selectedFamily as string,
                tag_mechanism_uuid: tagMechanism,
                version: '1.0',
                isDel: false, // Auto creates in API
            };

            await createFamilyMechList(familyMechList);
            createTagMechanismRef.current = '';
            onClose();
            setCreatedTagMechanismBool(true);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <Modal
                open={open}
                onClose={onClose}
            >
                <Box sx={style}>
                    Enter tag for Tag Mechanism below.
                    <TextField id="textField" label="Name" onChange={ e => createTagMechanismRef.current = e.target.value}/>
                    
                    <Button onClick={handleCreateTagMechanismClick}>
                        Submit
                    </Button>
                </Box>
            </Modal>
        </div>
    );
}

export const CreateSpeciesModal: React.FC<CreateSpeciesModalProps> = ({ open, onClose, selectedTagMechanism, setSpeciesCreated }) => {
    const createSpeciesRef = useRef("");

    const handleCreateSpeciesClick = async () => {
        try {
            const species_uuid = await createSpecies(createSpeciesRef.current);
    
            const tagMechanismSpeciesListData: TagMechanismSpeciesList = {
                uuid: '', // Auto creates
                species_uuid: species_uuid,
                tag_mechanism_uuid: selectedTagMechanism as string,
                version: '',
                isDel: false, //Auto sets false
            };
    
            await createTagMechanismSpeciesList(tagMechanismSpeciesListData);
    
            createSpeciesRef.current = '';
            onClose();
            setSpeciesCreated(true);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Modal 
            open={open} 
            onClose={onClose}
        >
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
                Enter name for Species below.
                <TextField id="textField" label="Name" onChange={e => createSpeciesRef.current = e.target.value} />
                <Button onClick={handleCreateSpeciesClick}>Submit</Button>
            </Box>
        </Modal>
    );
}

export const CreateReactionModal: React.FC<CreateReactionModalProps> = ({ open, onClose, selectedTagMechanism, setReactionCreated}) => {
    const createReactionRef = useRef("");

    const handleCreateReactionClick = async () => {
        try {
            const reaction_uuid = await createReaction(createReactionRef.current);
    
            const tagMechanismReactionListData: TagMechanismReactionList = {
                uuid: '', // Auto creates
                reaction_uuid: reaction_uuid,
                tag_mechanism_uuid: selectedTagMechanism as string,
                version: '',
                isDel: false, //Auto sets false
            };
    
            await createTagMechanismReactionList(tagMechanismReactionListData);
    
            createReactionRef.current = '';
            setReactionCreated(true);
            onClose();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Modal 
            open={open} 
            onClose={onClose}
        >
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
                Enter type for Reaction below.
                <TextField id="textField" label="Name" onChange={ e => createReactionRef.current = e.target.value} />
                <Button onClick={handleCreateReactionClick}>Submit</Button>
            </Box>
        </Modal>
    );
}
