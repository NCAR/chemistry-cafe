import React, { useEffect, useState } from 'react';

import { Species, Reaction, PropertyType, PropertyVersion} from '../../API/API_Interfaces';
import { getSpeciesFromTagMechanism, getReactionsFromTagMechanism, getPropertyTypesFromValidation, getPropertiesFromParent } from '../../API/API_GetMethods';

import { CreateReactionModal, CreateSpeciesModal, ReactionPropertiesModal, SpeciesPropertiesModal } from './Modals';

import { DataGrid, GridRowParams, GridColDef, GridToolbar } from '@mui/x-data-grid';

import IconButton from '@mui/material/IconButton';
import { Add } from '@mui/icons-material';
import { Typography } from '@mui/material';

interface Props {
    selectedFamily: string | null;
    selectedTagMechanism: string | null;
}

const RenderSpeciesReactionTable: React.FC<Props> = ({ selectedFamily, selectedTagMechanism }) => {
    const [createSpeciesOpen, setCreateSpeciesOpen] = React.useState(false);
    const handleCreateSpeciesOpen = () => setCreateSpeciesOpen(true);
    const handleCreateSpeciesClose = () => setCreateSpeciesOpen(false);

    const [createReactionOpen, setCreateReactionOpen] = React.useState(false);
    const handleCreateReactionOpen = () => setCreateReactionOpen(true);
    const handleCreateReactionClose = () => setCreateReactionOpen(false);
    
    const [species, setSpecies] = useState<Species[]>([]);
    const [reactions, setReactions] = useState<Reaction[]>([]);

    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
    const [speciesProperties, setSpeciesProperties] = useState<{ [key: string]: PropertyVersion[] }>({});

    const [speciesCreated, setSpeciesCreated] = useState<boolean>(false);
    const [speciesUpdated, setSpeciesUpdated] = useState<boolean>(false);
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

    const handleSpeciesCellClick = (params: GridRowParams<Species>) => {
        const species = params.row;
        setSelectedSpecies(species);
        handleSpeciesPropertiesOpen();
    };
    
    const handleReactionCellClick = (params: GridRowParams<Reaction>) => {
        const reaction = params.row;
        setSelectedReaction(reaction);
        handleReactionPropertiesOpen();
    };

    useEffect(() => {
        const fetchData = async () => {
            if (selectedTagMechanism) {
                const fetchedSpecies = await getSpeciesFromTagMechanism(selectedTagMechanism);
                const fetchedReactions = await getReactionsFromTagMechanism(selectedTagMechanism);
                
                setSpecies(fetchedSpecies);
                setReactions(fetchedReactions);
                
                const fetchedPropertyTypes = await getPropertyTypesFromValidation('Species');
                setPropertyTypes(fetchedPropertyTypes);
                
                const properties: { [key: string]: PropertyVersion[] } = {};
                for (const speciesItem of fetchedSpecies) {
                    const speciesUuid = speciesItem.uuid;
                    const fetchedProperties = await getPropertiesFromParent(speciesUuid);
                    properties[speciesUuid] = fetchedProperties;
                }
                setSpeciesProperties(properties);
                
                setSpeciesCreated(false);
                setReactionCreated(false);
                setReactionUpdated(false);
                setSpeciesUpdated(false);
            } else {
                setSpecies([]);
                setReactions([]);
                setSpeciesProperties({});
            }
        };

        fetchData();
    }, [selectedTagMechanism, speciesCreated, reactionCreated, speciesUpdated, reactionUpdated]);

    const createSpeciesColumns = (): GridColDef[] => {
        const speciesColumns: GridColDef[] = [
            {
                field: 'type',
                headerName: 'Name',
                flex: 1,
                renderCell: (params) => (
                    <Typography variant="body1">
                        {params.value}
                    </Typography>
                ),
            },
        ];
    
        propertyTypes.forEach((propertyType) => {
            const column: GridColDef = {
                field: propertyType.uuid,
                headerName: propertyType.name,
                flex: 1,
                editable: true,
                renderCell: (params) => (
                    <Typography variant="body1">
                        {params.value}
                    </Typography>
                ),
            };
            speciesColumns.push(column);
        });
    
        return speciesColumns;
    };

    const combineSpeciesAndProperties = (speciesData: Species[], propertiesData: { [key: string]: PropertyVersion[] }) => {
        return speciesData.map(speciesItem => {
            const speciesUuid = speciesItem.uuid;
            const propertiesList = propertiesData[speciesUuid] || [];
            
            const propertiesDict: { [key: string]: any } = {};
            propertiesList.forEach(property => {
                const propertyTypeUuid = property.property_type_uuid;
                var propertyValue;

                if (property.int_value !== null) {
                    propertyValue = property.int_value;
                } else if (property.double_value !== null) {
                    propertyValue = property.double_value;
                } else {
                    propertyValue = property.string_value || '';
                }
                
                propertiesDict[propertyTypeUuid] = propertyValue;
            });

            return { ...speciesItem, ...propertiesDict };
        });
    };
    
    const reactionColumns: GridColDef[] = [
        {
            field: 'type',
            headerName: 'Type',
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body1">
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'reaction_string',
            headerName: 'Reaction',
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body1">
                    {params.value}
                </Typography>
            ),
        },
    ];

    return (
        <div style={{ display:'flex', height: '100%', width: '100%' }}>
            <div style={{ height: '100%', width: '50%' }}>
                <div style={{ height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <h2>Species</h2>
                        <IconButton
                            onClick={handleCreateSpeciesOpen}
                            aria-label="create species"
                            style={{ color: 'blue', margin: '5px' }}
                            disabled={selectedFamily === null || selectedTagMechanism === null}
                        >
                            <Add sx={{ fontSize: 32, fontWeight: 'bold' }} />
                        </IconButton>
                    </div>

                    <DataGrid
                        rows={combineSpeciesAndProperties(species, speciesProperties)}
                        columns={createSpeciesColumns()}
                        getRowId={(row: Species) => row.uuid}
                        onRowClick={handleSpeciesCellClick}
                        autoPageSize
                        pagination
                        style={{ height: '80%' }}
                        slots={{ toolbar: GridToolbar }}
                        sx={{
                            '& .MuiDataGrid-cell': {
                                borderRight: '3px solid #ddd',
                                borderBottom: '3px solid #ddd',
                                padding: '8px',
                            },
                            '& .MuiDataGrid-columnHeader': {
                                borderBottom: '3px solid #ccc',
                                padding: '10px',
                            },
                        }}
                    />
                </div>
            </div>

            <div style={{ height: '100%', width: '50%' }}>
                <div style={{ height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <h2>Reactions</h2>
                        <IconButton
                            onClick={handleCreateReactionOpen}
                            aria-label="create reaction"
                            style={{ color: 'blue', margin: '5px' }}
                            disabled={selectedFamily === null || selectedTagMechanism === null}
                        >
                            <Add sx={{ fontSize: 32, fontWeight: 'bold' }} />
                        </IconButton>
                    </div>
                    
                    <DataGrid
                        rows={reactions}
                        columns={reactionColumns}
                        getRowId={(row: Reaction) => row.uuid}
                        onRowClick={handleReactionCellClick}
                        autoPageSize
                        pagination
                        style={{ height: '80%' }}
                        slots={{ toolbar: GridToolbar }}
                        sx={{
                            '& .MuiDataGrid-cell': {
                                borderRight: '3px solid #ddd',
                                borderBottom: '3px solid #ddd',
                                padding: '8px',
                            },
                            '& .MuiDataGrid-columnHeader': {
                                borderBottom: '3px solid #ccc',
                                padding: '10px',
                            },
                        }}
                    />
                </div>
            </div>
            <CreateSpeciesModal open={createSpeciesOpen} onClose={handleCreateSpeciesClose} selectedFamily={selectedFamily} selectedTagMechanism={selectedTagMechanism} setSpeciesCreated={setSpeciesCreated} />
            <CreateReactionModal open={createReactionOpen} onClose={handleCreateReactionClose} selectedFamily={selectedFamily} selectedTagMechanism={selectedTagMechanism} setReactionCreated={setReactionCreated} />
            <SpeciesPropertiesModal open={speciesPropertiesOpen} onClose={handleSpeciesPropertiesClose} selectedTagMechanism={selectedTagMechanism} selectedSpecies={selectedSpecies} setSpeciesUpdated={setSpeciesUpdated} />
            <ReactionPropertiesModal open={reactionPropertiesOpen} onClose={handleReactionPropertiesClose} selectedTagMechanism={selectedTagMechanism} selectedReaction={selectedReaction} setReactionUpdated={setReactionUpdated} />
        </div>
    );
}

export default RenderSpeciesReactionTable;
