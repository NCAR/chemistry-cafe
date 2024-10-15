import React, { Children, ReactNode, useEffect, useState } from 'react';

import { Species, Reaction, PropertyType, PropertyVersion} from '../../API/API_Interfaces';
import { getSpeciesFromTagMechanism, getReactionsFromTagMechanism, getPropertyTypesFromValidation, getPropertiesFromParent } from '../../API/API_GetMethods';

import { CreateReactionModal, CreateSpeciesModal, ReactionPropertiesModal, SpeciesPropertiesModal } from './Modals';

import { DataGrid, GridRowParams, GridColDef, GridToolbar, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarExport } from '@mui/x-data-grid';

import IconButton from '@mui/material/IconButton';
import { Add, ChildCare } from '@mui/icons-material';
import { Typography } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const tabsHeaderStyle: React.CSSProperties = {
    backgroundColor: '#f0f0f0',
    padding: '10px',
    borderBottom: '1px solid #ccc',

};


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


    const [currentTab, setCurrentTab] = useState<number>(0);
    
    // Event needed as parameter to ensure correct value recieved in tabValue
    const handleTabSwitch = (event: React.ChangeEvent<unknown>, tabValue: number) => {
        setCurrentTab(tabValue);
    };

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
    /** toolbar that takes in a button and adds it, used for datagrids below 
    to include add item buttons */
    const FamilyReactionToolbar: React.FC<{ customButton?: React.ReactNode }> = ({ customButton }) =>  {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton></GridToolbarColumnsButton>
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector 
                    slotProps={{ tooltip: { title: 'Change density' } }}
                />
                {customButton && customButton}
                <GridToolbarExport 
                    slotProps={{
                        tooltip: { title: 'Export data' },
                        button: { variant: 'outlined' },
                    }}
                />
                
            </GridToolbarContainer>
        );
    };


    const addSpeciesButton = (<IconButton onClick={handleCreateSpeciesOpen} 
            aria-label="create species" 
            style={{ color: 'blue', margin: '5px' }} 
            disabled={selectedFamily === null || selectedTagMechanism === null}
            > 
            <Add sx={{ fontSize: 32, fontWeight: 'bold' }} /> 
        </IconButton>);

    const addReactionButton = (
        <IconButton
            onClick={handleCreateReactionOpen}
            aria-label="create reaction"
            style={{ color: 'blue', margin: '5px' }}
            disabled={selectedFamily === null || selectedTagMechanism === null}
        >
            <Add sx={{ fontSize: 32, fontWeight: 'bold' }} />
        </IconButton>);
    return (
        <div style={{ display:'flex', flexDirection:'column', height: '100%', width: '100%' }}>
            <div className='familyTabs' style={tabsHeaderStyle}>
                    <Tabs value={currentTab} onChange={handleTabSwitch}>
                        <Tab label="Species" />
                        <Tab label="Reactions" />
                    </Tabs>
            </div>

            <div className='dataGrids' style={ { display:'flex', flexGrow:'1', overflowY: 'auto'} }>
                {currentTab === 0 && 
                        <div style={{ flexGrow: 1 }}>
                            <DataGrid
                            rows={combineSpeciesAndProperties(species, speciesProperties)}
                            columns={createSpeciesColumns()}
                            getRowId={(row: Species) => row.uuid}
                            onRowClick={handleSpeciesCellClick}
                            autoPageSize
                            pagination
                            style={{ height: '100%' }}
                            slots={{ 
                                toolbar: () => <FamilyReactionToolbar customButton={addSpeciesButton} />
                            }}
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
                        }
                        {currentTab === 1 && 
                        <div style={{ flexGrow: 1 }}>
                            <DataGrid
                            rows={reactions}
                            columns={reactionColumns}
                            getRowId={(row: Reaction) => row.uuid}
                            onRowClick={handleReactionCellClick}
                            autoPageSize
                            pagination
                            style={{ height: '100%' }}
                            slots={{
                                toolbar: () => <FamilyReactionToolbar customButton={addReactionButton} />
                            }}
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
                        }
            </div>
            <CreateSpeciesModal open={createSpeciesOpen} onClose={handleCreateSpeciesClose} selectedFamily={selectedFamily} selectedTagMechanism={selectedTagMechanism} setSpeciesCreated={setSpeciesCreated} />
            <CreateReactionModal open={createReactionOpen} onClose={handleCreateReactionClose} selectedFamily={selectedFamily} selectedTagMechanism={selectedTagMechanism} setReactionCreated={setReactionCreated} />
            <SpeciesPropertiesModal open={speciesPropertiesOpen} onClose={handleSpeciesPropertiesClose} selectedTagMechanism={selectedTagMechanism} selectedSpecies={selectedSpecies} setSpeciesUpdated={setSpeciesUpdated} />
            <ReactionPropertiesModal open={reactionPropertiesOpen} onClose={handleReactionPropertiesClose} selectedTagMechanism={selectedTagMechanism} selectedReaction={selectedReaction} setReactionUpdated={setReactionUpdated} />
        </div>
    );
}

export default RenderSpeciesReactionTable;