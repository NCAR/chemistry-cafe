import React, { useEffect, useState } from 'react';

import { Species, Reaction} from '../../API/API_Interfaces';
import { getSpeciesFromTagMechanism, getReactionsFromTagMechanism } from '../../API/API_GetMethods';

import { CreateReactionModal, CreateSpeciesModal } from './Modals';

import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, ButtonGroup, Button } from '@mui/material';

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
    
    useEffect(() => {
        const fetchData = async () => {
            if (selectedTagMechanism ) {
                const fetchedSpecies = await getSpeciesFromTagMechanism(selectedTagMechanism);
                const fetchedReactions = await getReactionsFromTagMechanism(selectedTagMechanism);
                setSpecies(fetchedSpecies);
                setReactions(fetchedReactions);
                setSpeciesCreated(false);
                setReactionCreated(false);
            } else {
                setSpecies([]);
                setReactions([]);
            }
        };

        fetchData();
    }, [selectedTagMechanism, speciesCreated == true, reactionCreated == true]);

    return (
        <div style={{ display: 'flex' }}>
            <div style={{width: '50%'}}>
                <TableContainer component={Paper}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ textAlign: 'center', margin: '0' }}>Species</h2>
                            <ButtonGroup orientation='vertical' variant='contained' style={{ marginLeft: '1rem' }}>
                                <Button onClick={handleCreateSpeciesOpen}>Add Species</Button>
                            </ButtonGroup>
                        </div>
                        <Table>
                            <TableBody>
                                {species.map(species => (
                                    <TableRow key={species.uuid}>
                                        <TableCell align="center" style={{ border: '1px solid black', padding: '1%', margin: '1%', fontWeight: 'bold' }}>{species.type}</TableCell>
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
                            <ButtonGroup orientation='vertical' variant='contained' style={{ marginLeft: '1rem' }}>
                            <Button onClick = {handleCreateReactionOpen}>Add Reaction</Button>
                            </ButtonGroup>
                        </div>
                        <Table>
                            <TableBody>
                                {reactions.map(reaction => (
                                    <TableRow key={reaction.uuid}>
                                        <TableCell align="center" style={{ border: '1px solid black', padding: '1%', margin: '1%', fontWeight: 'bold' }}>{reaction.type}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TableContainer>
            </div>

            <CreateSpeciesModal open={createSpeciesOpen} onClose={handleCreateSpeciesClose} selectedTagMechanism={selectedTagMechanism} setSpeciesCreated={setSpeciesCreated}/>
            <CreateReactionModal open={createReactionOpen} onClose={handleCreateReactionClose} selectedTagMechanism={selectedTagMechanism} setReactionCreated={setReactionCreated}/>
        </div>
    );
}

export default RenderSpeciesReactionTable;
