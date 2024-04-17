import React, { useEffect, useState } from 'react';

import { Species, Reaction} from '../../API/API_Interfaces';
import { getSpeciesFromTagMechanism, getReactionsFromTagMechanism } from '../../API/API_GetMethods';

import { CreateReactionModal, CreateSpeciesModal, ReactionPropertiesModal, SpeciesPropertiesModal } from './Modals';

import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, ButtonGroup, Button } from '@mui/material';

import IconButton from '@mui/material/IconButton';
import { Add } from '@mui/icons-material';

interface Props {
    selectedTagMechanism: string | null;
}

const RenderSpeciesReactionTable: React.FC<Props> = ({ selectedTagMechanism }) => {
    const [createSpeciesOpen, setCreateSpeciesOpen] = React.useState(false);
    const handleCreateSpeciesOpen = () => setCreateSpeciesOpen(true);
    const handleCreateSpeciesClose = () => setCreateSpeciesOpen(false);

    const [createReactionOpen, setCreateReactionOpen] = React.useState(false);
    const handleCreateReactionOpen = () => setCreateReactionOpen(true);
    const handleCreateReactionClose = () => setCreateReactionOpen(false);
    
    const [species, setSpecies] = useState<Species[]>([]);
    const [reactions, setReactions] = useState<Reaction[]>([]);

    const [speciesCreated, setSpeciesCreated] = useState<boolean>(false);
    const [reactionCreated, setReactionCreated] = useState<boolean>(false);
    const [reactionUpdated, setReactionUpdated] = useState<boolean>(false);

    const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
    const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null);

    const [speciesPropertiesOpen, setSpeciesPropertiesOpen] = React.useState(false);
    const handleSpeciesPropertiesOpen = () => setSpeciesPropertiesOpen(true);
    const handleSpeciesPropertiesClose = () => setSpeciesPropertiesOpen(false);

    const [reactionPropertiesOpen, setReactionPropertiesOpen] = React.useState(false);
    const handleReactionPropertiesOpen = () => setReactionPropertiesOpen(true);
    const handleReactionPropertiesClose = () => setReactionPropertiesOpen(false);

    const handleSpeciesCellClick = (species: Species) => {
        setSelectedSpecies(species);
        handleSpeciesPropertiesOpen();
    };
    
    const handleReactionCellClick = (reaction: Reaction) => {
        setSelectedReaction(reaction);
        handleReactionPropertiesOpen();
    };
    
    useEffect(() => {
        const fetchData = async () => {
            if (selectedTagMechanism ) {
                const fetchedSpecies = await getSpeciesFromTagMechanism(selectedTagMechanism);
                const fetchedReactions = await getReactionsFromTagMechanism(selectedTagMechanism);
                setSpecies(fetchedSpecies);
                setReactions(fetchedReactions);
                setSpeciesCreated(false);
                setReactionCreated(false);
                setReactionUpdated(false);
            } else {
                setSpecies([]);
                setReactions([]);
            }
        };

        fetchData();
    }, [selectedTagMechanism, speciesCreated == true, reactionCreated == true, reactionUpdated == true]);

    return (
        <div style={{ display: 'flex' }}>
            <div style={{width: '50%'}}>
                <TableContainer component={Paper}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ textAlign: 'center', margin: '0' }}>Species</h2>
                            <IconButton 
                                onClick={handleCreateSpeciesOpen} 
                                aria-label="create species" 
                                style={{ color: 'blue', margin: '5px' }}
                            >
                                <Add sx={{ fontSize: 32, fontWeight: 'bold' }} />
                            </IconButton>
                        </div>
                        <Table>
                            <TableBody>
                                {species.map(species => (
                                    <TableRow key={species.uuid}>
                                        <TableCell align="center" style={{ border: '1px solid black', padding: '1%', margin: '1%', fontWeight: 'bold' }}>
                                            <div onClick={() => handleSpeciesCellClick(species)}>
                                                {species.type}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TableContainer>
            </div>
            <div style={{width: '50%'}}>
                <TableContainer component={Paper}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ textAlign: 'center', margin: '0' }}>Reactions</h2>
                            <IconButton 
                                onClick={handleCreateReactionOpen} 
                                aria-label="create reaction" 
                                style={{ color: 'blue', margin: '5px' }}
                            >
                                <Add sx={{ fontSize: 32, fontWeight: 'bold' }} />
                            </IconButton>
                        </div>
                        <Table>
                            <TableBody>
                                {reactions.map(reaction => (
                                    <TableRow key={reaction.uuid}>
                                        <TableCell align="center" style={{ border: '1px solid black', padding: '1%', margin: '1%', fontWeight: 'bold' }}>
                                            <div onClick={() => handleReactionCellClick(reaction)}>
                                                {reaction.reaction_string}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TableContainer>
            </div>

            <CreateSpeciesModal open={createSpeciesOpen} onClose={handleCreateSpeciesClose} selectedTagMechanism={selectedTagMechanism} setSpeciesCreated={setSpeciesCreated}/>
            <CreateReactionModal open={createReactionOpen} onClose={handleCreateReactionClose} selectedTagMechanism={selectedTagMechanism} setReactionCreated={setReactionCreated}/>
            <SpeciesPropertiesModal open={speciesPropertiesOpen} onClose={handleSpeciesPropertiesClose} selectedTagMechanism={selectedTagMechanism} selectedSpecies={selectedSpecies}/>
            <ReactionPropertiesModal open={reactionPropertiesOpen} onClose={handleReactionPropertiesClose} selectedTagMechanism={selectedTagMechanism} selectedReaction={selectedReaction} setReactionUpdated={setReactionUpdated}/>
        </div>
    );
}

export default RenderSpeciesReactionTable;
