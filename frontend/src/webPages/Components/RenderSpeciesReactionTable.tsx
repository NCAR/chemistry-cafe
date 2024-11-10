import React, { Children, ReactNode, useEffect, useState } from 'react';

import { Species, Reaction, InitialConditionSpecies} from '../../API/API_Interfaces';
import { getReactionsByMechanismId, getSpeciesByMechanismId, getSpeciesPropertiesByMechanismIDAsync} from '../../API/API_GetMethods';

// import { CreateReactionModal, CreateSpeciesModal, ReactionPropertiesModal, SpeciesPropertiesModal } from './Modals';
import {CreateSpeciesModal, CreateReactionModal, CreateReactantModal} from './Modals';
import { DataGrid, GridRowParams, GridColDef, GridToolbar, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarExport } from '@mui/x-data-grid';

import IconButton from '@mui/material/IconButton';
import { Add, ChildCare, Description } from '@mui/icons-material';
import { Typography, Box } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const tabsHeaderStyle: React.CSSProperties = {
    backgroundColor: '#f0f0f0',
    padding: '10px',
    borderBottom: '1px solid #ccc',

};


interface Props {
    selectedFamilyID: string | null;
    selectedMechanismID: string | null;
    selectedMechanismName: string | null;
}


const RenderSpeciesReactionTable: React.FC<Props> = ({ selectedFamilyID, selectedMechanismID, selectedMechanismName}) => {
    const [createSpeciesOpen, setCreateSpeciesOpen] = React.useState(false);
    const handleCreateSpeciesOpen = () => setCreateSpeciesOpen(true);
    const handleCreateSpeciesClose = () => setCreateSpeciesOpen(false);

    const [createReactionOpen, setCreateReactionOpen] = React.useState(false);
    const handleCreateReactionOpen = () => setCreateReactionOpen(true);
    const handleCreateReactionClose = () => setCreateReactionOpen(false);
    
    const [species, setSpecies] = useState<Species[]>([]);
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [reactionsCount, setReactionsCount] = useState<number>(1);
    const [speciesProperties, setSpeciesProperties] = useState<InitialConditionSpecies[]>([]);

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
            if (selectedMechanismID) {
                const fetchedSpecies = await getSpeciesByMechanismId(selectedMechanismID);
                const fetchedReactions = await getReactionsByMechanismId(selectedMechanismID);
                const fetchedSpeciesProperties = await getSpeciesPropertiesByMechanismIDAsync(selectedMechanismID);
                setSpecies(fetchedSpecies);
                setReactions(fetchedReactions);
                setReactionsCount(fetchedReactions.length);
                setSpeciesProperties(fetchedSpeciesProperties);

                
                setSpeciesCreated(false);
                setReactionCreated(false);
                setReactionUpdated(false);
                setSpeciesUpdated(false);
            } else {
                setSpecies([]);
                setReactions([]);
            }
        };

        fetchData();
    }, [selectedMechanismID, speciesCreated, reactionCreated, speciesUpdated, reactionUpdated]);

    const createSpeciesColumns = (): GridColDef[] => {
        const speciesColumns: GridColDef[] = [
            {
                field: 'name',
                headerName: 'Name',
                flex: 1,
                renderCell: (params) => (
                    <Typography variant="body1">
                        {params.value}
                    </Typography>
                ),
            },
        ];
    
    
        return speciesColumns;
    };

    const rowifySpecies = (speciesData: Species[]) => {
        const templol = speciesData.map(speciesItem => {
            const speciesUuid = speciesItem.id;

            // get the inital conditions from the species

            // if initial conditions are null, assign default values; otherwise put in the correct values

            // return the data
            

            return { ...speciesItem};
        });
        // console.log(templol);
        // console.log("speciesdata");
        // console.log(speciesData);
        return templol;
    };
    
    const reactionColumns: GridColDef[] = [
        {
            field: 'reactionType',
            headerName: 'Reaction Type',
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body1">
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'reaction',
            headerName: 'Reaction',
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body1">
                    {params.value}
                </Typography>
            ),
        },
    ];

    const rowifyReactions = (reactionsData: Reaction[]) => {

        const rowifiedReactions = reactionsData.map(reactionItem => {
            // currently, all meaningful info is stored in description field
            // for now, getting around this using regex string parsing
            // example string: ARRHENIUS Reaction 1: O + O3 -> 2 * O2 + irr__071b97cd-d37e-41e1-9ff1-308e3179f910
            if (reactionItem.description === null){
                return {... reactionItem};
            }
            else{
                
                const matches = reactionItem.description.match(/^(\w+)(?: Reaction \d+)?: (.+)$/);

                if (matches) {
                    // Extract components from matches
                    let reactionType = matches[1].toLowerCase().replace(/^./, char => char.toUpperCase());
                    let reaction = matches[2].trim();

                    return {... reactionItem, reactionType, reaction};
                }

                else{
                    return {... reactionItem};
                }
            }
        });
        // console.log(rowifiedReactions);
        return rowifiedReactions;
        
    }
    /** toolbar that takes in a button and adds it, used for datagrids below 
    to include add item buttons */
    const FamilyReactionToolbar: React.FC<{ customButton?: React.ReactNode }> = ({ customButton }) =>  {
        return (
            <GridToolbarContainer>
                {customButton && customButton}
                <GridToolbarColumnsButton></GridToolbarColumnsButton>
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector 
                    slotProps={{ tooltip: { title: 'Change density' } }}
                />

                <Box sx={{ flexGrow: 1 }} />
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
            disabled={selectedFamilyID === null || selectedMechanismID === null}
            > 
            <Add sx={{ fontSize: 32, fontWeight: 'bold' }} /> 
        </IconButton>);

    const addReactionButton = (
        <IconButton
            onClick={handleCreateReactionOpen}
            aria-label="create reaction"
            style={{ color: 'blue', margin: '5px' }}
            disabled={selectedFamilyID === null || selectedMechanismID === null}
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
                            initialState={{ density: 'compact', }}
                            rows={rowifySpecies(species)}
                            columns={createSpeciesColumns()}
                            getRowId={(row: Species) => {if (row.id === undefined){
                                return 0} // TODO: figure out better solution for this?
                                else {return row.id}
                                }
                            }
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
                            initialState={{ density: 'compact', }}
                            rows={rowifyReactions(reactions)}
                            columns={reactionColumns}
                            getRowId={(row: Reaction) => {if (row.id === undefined){
                                return 0} // TODO: figure out better solution for this?
                                else {return row.id}
                                }
                            }
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
            <CreateSpeciesModal open={createSpeciesOpen} onClose={handleCreateSpeciesClose} selectedFamilyId={selectedFamilyID} 
                selectedMechanismId={selectedMechanismID} setSpeciesCreated={setSpeciesCreated} />
            <CreateReactionModal open={createReactionOpen} onClose={handleCreateReactionClose} selectedFamilyId={selectedFamilyID} 
                selectedMechanismId={selectedMechanismID} selectedMechanismName={selectedMechanismName} setReactionCreated={setReactionCreated} 
                reactionsCount={reactionsCount}/>
            {/* <SpeciesPropertiesModal open={speciesPropertiesOpen} onClose={handleSpeciesPropertiesClose} selectedTagMechanism={selectedTagMechanism} selectedSpecies={selectedSpecies} setSpeciesUpdated={setSpeciesUpdated} />
            <ReactionPropertiesModal open={reactionPropertiesOpen} onClose={handleReactionPropertiesClose} selectedTagMechanism={selectedTagMechanism} selectedReaction={selectedReaction} setReactionUpdated={setReactionUpdated} /> */}
        </div>
    );
}

export default RenderSpeciesReactionTable;