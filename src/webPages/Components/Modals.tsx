import React, { useRef } from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';
import { createSpecies, createReaction, createTagMechanismSpeciesList, createTagMechanismReactionList } from '../../API/API_CreateMethods';
import { TagMechanismReactionList, TagMechanismSpeciesList } from '../../API/API_Interfaces';

interface CreateSpeciesModalProps {
    open: boolean;
    onClose: () => void;
    selectedTagMechanism: string | null;
}

const CreateSpeciesModal: React.FC<CreateSpeciesModalProps> = ({ open, onClose, selectedTagMechanism }) => {
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
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
                Enter name for Species below.
                <TextField id="textField" label="Name" onChange={e => createSpeciesRef.current = e.target.value} />
                <Button onClick={handleCreateSpeciesClick}>Submit</Button>
            </Box>
        </Modal>
    );
}

interface CreateReactionModalProps {
    open: boolean;
    onClose: () => void;
    selectedTagMechanism: string | null;
}

const CreateReactionModal: React.FC<CreateReactionModalProps> = ({ open, onClose, selectedTagMechanism }) => {
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
    
            onClose();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
                Enter type for Reaction below.
                <TextField id="textField" label="Name" onChange={ e => createReactionRef.current = e.target.value} />
                <Button onClick={handleCreateReactionClick}>Submit</Button>
            </Box>
        </Modal>
    );
}

export { CreateSpeciesModal, CreateReactionModal };
