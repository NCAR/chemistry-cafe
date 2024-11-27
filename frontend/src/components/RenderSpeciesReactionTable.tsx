import React, { useEffect, useState } from "react";

import { Species, Reaction, Property } from "../API/API_Interfaces";
import {
  getReactionsByMechanismId,
  getSpeciesByMechanismId,
  getPropertyBySpeciesAndMechanism,
} from "../API/API_GetMethods";
import { deleteSpecies, deleteReaction } from "../API/API_DeleteMethods";

// import { CreateReactionModal, CreateSpeciesModal, ReactionPropertiesModal, SpeciesPropertiesModal } from './Modals';
import {
  CreateSpeciesModal,
  CreateReactionModal,
  UpdateReactionModal,
  UpdateSpeciesModal,
} from "./Modals";
import {
  DataGrid,
  GridRowParams,
  GridColDef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridActionsCellItem,
  GridRowId,
} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";

import IconButton from "@mui/material/IconButton";
import { Add } from "@mui/icons-material";
import { Typography, Box, Backdrop, CircularProgress } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { isAxiosError } from "axios";
import { createProperty } from "../API/API_CreateMethods";

const tabsHeaderStyle: React.CSSProperties = {
  backgroundColor: "#f0f0f0",
  padding: "10px",
  borderBottom: "1px solid #ccc",
};

interface Props {
  selectedFamilyID: string | null;
  selectedMechanismID: string | null;
  selectedMechanismName: string | null;
}

const RenderSpeciesReactionTable: React.FC<Props> = ({
  selectedFamilyID,
  selectedMechanismID,
  selectedMechanismName,
}) => {
  const [createSpeciesOpen, setCreateSpeciesOpen] = React.useState(false);
  const handleCreateSpeciesOpen = () => setCreateSpeciesOpen(true);
  const handleCreateSpeciesClose = () => setCreateSpeciesOpen(false);

  const [createReactionOpen, setCreateReactionOpen] = React.useState(false);
  const handleCreateReactionOpen = () => setCreateReactionOpen(true);
  const handleCreateReactionClose = () => setCreateReactionOpen(false);

  const [species, setSpecies] = useState<Species[]>([]);
  const [reactionsCount, setReactionsCount] = useState<number>(0);

  const [speciesCreated, setSpeciesCreated] = useState<boolean>(false);
  const [speciesUpdated, setSpeciesUpdated] = useState<boolean>(false);
  const [reactionCreated, setReactionCreated] = useState<boolean>(false);
  const [reactionUpdated, setReactionUpdated] = useState<boolean>(false);

  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [selectedSpeciesProperties, setSelectedSpeciesProperties] =
    useState<Property | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(
    null,
  );

  const [editPropertiesLoading, setEditPropertiesLoading] =
    React.useState(false);
  const [editPropertiesOpen, setEditPropertiesOpen] = React.useState(false);
  const handleEditPropertiesOpen = () => setEditPropertiesOpen(true);
  const handleEditPropertiesClose = () => setEditPropertiesOpen(false);

  const [editReactionOpen, setEditReactionOpen] = React.useState(false);
  const handleEditReactionOpen = () => setEditReactionOpen(true);
  const handleEditReactionClose = () => setEditReactionOpen(false);

  const [currentTab, setCurrentTab] = useState<number>(0);

  const [speciesRowData, setSpeciesRowData] = useState<Species[]>([]);
  const [reactionsRowData, setReactionsRowData] = useState<Reaction[]>([]);

  const handleSpeciesDeleteClick = (id: GridRowId) => async () => {
    try {
      await deleteSpecies(id as string);
      // Remove the deleted user from the state
      setSpeciesRowData(
        speciesRowData.filter((speciesRow) => speciesRow.id !== id),
      );
      alert("Species deleted successfully!");
    } catch (error) {
      console.error("Error deleting species:", error);
      alert("Failed to delete species: " + error);
    }
  };

  const handleReactionDeleteClick = (id: GridRowId) => async () => {
    try {
      await deleteReaction(id as string);
      // Remove the deleted user from the state
      setReactionsRowData(
        reactionsRowData.filter((reactionRow) => reactionRow.id !== id),
      );
      alert("Reaction deleted successfully!");
    } catch (error) {
      console.error("Error deleting reaction:", error);
      alert("Failed to delete reaction: " + error);
    }
  };

  // Event needed as parameter to ensure correct value recieved in tabValue
  const handleTabSwitch = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSpeciesCellClick = async (params: GridRowParams<Species>) => {
    const species = params.row;
    console.log("selected species");
    console.log(species);
    setSelectedSpecies(species);
    // get properties of species to set it as well
    try {
      setEditPropertiesLoading(true);
      const fetchedProperty = await getPropertyBySpeciesAndMechanism(
        species.id!,
        selectedMechanismID!,
      );
      //console.log(fetchedProperty);
      setSelectedSpeciesProperties(fetchedProperty);
    } catch (error) {
      setSelectedSpeciesProperties(null);
      //console.log(error);
    } finally {
      setEditPropertiesLoading(false);
      handleEditPropertiesOpen();
    }
  };

  const handleReactionCellClick = (params: GridRowParams<Reaction>) => {
    const reaction = params.row;
    setSelectedReaction(reaction);
    handleEditReactionOpen();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedMechanismID) {
        try {
          const fetchedSpecies =
            await getSpeciesByMechanismId(selectedMechanismID);
          const fetchedReactions =
            await getReactionsByMechanismId(selectedMechanismID);

          setSpecies(fetchedSpecies);
          console.log(species);
          setReactionsCount(fetchedReactions.length);

          const rowifiedSpeciesData = await rowifySpecies(fetchedSpecies);
          const rowifiedReactionsData = await rowifyReactions(fetchedReactions);
          setSpeciesRowData(rowifiedSpeciesData);
          setReactionsRowData(rowifiedReactionsData);

          setSpeciesCreated(false);
          setReactionCreated(false);
          setReactionUpdated(false);
          setSpeciesUpdated(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setSpecies([]);
        }
      } else {
        setSpecies([]);
      }
    };

    fetchData();
  }, [
    selectedMechanismID,
    speciesCreated,
    reactionCreated,
    speciesUpdated,
    reactionUpdated,
  ]);

  const createSpeciesColumns = (): GridColDef[] => {
    const speciesColumns: GridColDef[] = [
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body1">{params.value}</Typography>
        ),
      },
      {
        field: "description",
        headerName: "Description",
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body1">{params.value}</Typography>
        ),
      },
      {
        field: "property.tolerance",
        headerName: "Abs Convergence Tolerance",
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body1">
            {params.row.property?.tolerance === 0
              ? ""
              : (params.row.property?.tolerance ?? "")}
          </Typography>
        ),
      },
      {
        field: "property.weight",
        headerName: "Molecular Weight",
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body1">
            {params.row.property?.weight === 0
              ? ""
              : (params.row.property?.weight ?? "")}
          </Typography>
        ),
      },
      {
        field: "property.concentration",
        headerName: "Fixed Concentration",
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body1">
            {params.row.property?.concentration === 0
              ? ""
              : (params.row.property?.concentration ?? "")}
          </Typography>
        ),
      },
      {
        field: "property.diffusion",
        headerName: "Diffusion Coefficient",
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body1">
            {params.row.property?.diffusion === 0
              ? ""
              : (params.row.property?.diffusion ?? "")}
          </Typography>
        ),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        headerClassName: "roleDataHeader",
        flex: 1,
        cellClassName: "actions",
        getActions: ({ id }) => {
          return [
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={handleSpeciesDeleteClick(id)}
              color="inherit"
            />,
          ];
        },
      },
    ];

    return speciesColumns;
  };

  const rowifySpecies = async (speciesData: Species[]) => {
    const rowifiedSpecies = speciesData.map(async (speciesItem) => {
      let fetchedProperty;

      // Try to get the initial conditions from the species
      try {
        fetchedProperty = await getPropertyBySpeciesAndMechanism(
          speciesItem.id!,
          selectedMechanismID!,
        );
      } catch (error) {
        // if no property found, create one
        if (isAxiosError(error) && error.response?.status === 404) {
          const propertyData: Property = {
            speciesId: speciesItem.id!,
            mechanismId: selectedMechanismID!,
          };
          const createdProperty = await createProperty(propertyData);
          fetchedProperty = createdProperty;
          console.log("Missing Property handled successfully");
        } else {
          //('Error fetching property:', error);
        }
      }

      // Log the fetched property for debugging
      //console.log('Fetched property for species', speciesItem.name, fetchedProperty);

      return {
        ...speciesItem,
        property: fetchedProperty || null,
      };
    });

    // Wait for all promises to resolve
    const result = await Promise.all(rowifiedSpecies);

    // Log the final result to check if property was added
    //console.log('Rowified species:', result);
    return result;
  };

  const reactionColumns: GridColDef[] = [
    {
      field: "reactionType",
      headerName: "Reaction Type",
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body1">{params.value}</Typography>
      ),
    },
    {
      field: "reaction",
      headerName: "Reaction",
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body1">{params.value}</Typography>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      headerClassName: "reactionDataHeader",
      flex: 1,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleReactionDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const rowifyReactions = (reactionsData: Reaction[]) => {
    const rowifiedReactions = reactionsData.map((reactionItem) => {
      // currently, all meaningful info is stored in description field
      // for now, getting around this using regex string parsing
      // example string: ARRHENIUS Reaction 1: O + O3 -> 2 * O2 + irr__071b97cd-d37e-41e1-9ff1-308e3179f910
      if (reactionItem.description === null) {
        return { ...reactionItem };
      } else {
        // make regex expression
        const regex =
          /^(Arrhenius|Branched|Emission|First-Order Loss|Photolysis|Surface \(Heterogeneous\)|Ternary Chemical Activation|Troe \(Fall-Off\)|Tunneling|N\/A)(?: Reaction \d+)?: (.+)$/i;

        const matches = reactionItem.description.match(regex);

        // console.log("heres the matches:");
        // console.log(matches);
        // console.log("heres the description:");
        // console.log(reactionItem.description)

        if (matches) {
          // Extract components from matches
          const reactionType = matches[1]
            .toLowerCase()
            .replace(/^./, (char) => char.toUpperCase());
          const reaction = matches[2].trim();

          return { ...reactionItem, reactionType, reaction };
        } else {
          return { ...reactionItem };
        }
      }
    });
    // console.log(rowifiedReactions);
    return rowifiedReactions;
  };
  /** toolbar that takes in a button and adds it, used for datagrids below 
    to include add item buttons */
  const FamilyReactionToolbar: React.FC<{ customButton?: React.ReactNode }> = ({
    customButton,
  }) => {
    return (
      <GridToolbarContainer>
        {customButton && customButton}
        <GridToolbarColumnsButton></GridToolbarColumnsButton>
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector
          slotProps={{ tooltip: { title: "Change density" } }}
        />

        <Box sx={{ flexGrow: 1 }} />
      </GridToolbarContainer>
    );
  };

  const addSpeciesButton = (
    <IconButton
      onClick={handleCreateSpeciesOpen}
      aria-label="create species"
      style={{ color: "blue", margin: "5px" }}
      disabled={selectedFamilyID === null || selectedMechanismID === null}
    >
      <Add sx={{ fontSize: 32, fontWeight: "bold" }} />
    </IconButton>
  );

  const addReactionButton = (
    <IconButton
      onClick={handleCreateReactionOpen}
      aria-label="create reaction"
      style={{ color: "blue", margin: "5px" }}
      disabled={selectedFamilyID === null || selectedMechanismID === null}
    >
      <Add sx={{ fontSize: 32, fontWeight: "bold" }} />
    </IconButton>
  );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div className="familyTabs" style={tabsHeaderStyle}>
        <Tabs value={currentTab} onChange={handleTabSwitch}>
          <Tab label="Species" />
          <Tab label="Reactions" />
        </Tabs>
      </div>

      <div
        className="dataGrids"
        style={{ display: "flex", flexGrow: "1", overflowY: "auto" }}
      >
        {currentTab === 0 && (
          <div style={{ flexGrow: 1 }}>
            <Backdrop
              open={editPropertiesLoading}
              sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
            <DataGrid
              initialState={{ density: "compact" }}
              rows={speciesRowData}
              columns={createSpeciesColumns()}
              getRowId={(row: Species) => row.id ?? 0}
              onRowClick={handleSpeciesCellClick}
              autoPageSize
              pagination
              style={{ height: "100%" }}
              slots={{
                toolbar: () => (
                  <FamilyReactionToolbar customButton={addSpeciesButton} />
                ),
              }}
              sx={{
                "& .MuiDataGrid-cell": {
                  borderRight: "3px solid #ddd",
                  borderBottom: "3px solid #ddd",
                  padding: "8px",
                },
                "& .MuiDataGrid-columnHeader": {
                  borderBottom: "3px solid #ccc",
                  padding: "10px",
                },
              }}
            />
          </div>
        )}
        {currentTab === 1 && (
          <div style={{ flexGrow: 1 }}>
            <DataGrid
              initialState={{ density: "compact" }}
              rows={reactionsRowData}
              columns={reactionColumns}
              getRowId={(row: Reaction) => {
                if (row.id === undefined) {
                  return 0;
                } else {
                  return row.id;
                }
              }}
              onRowClick={handleReactionCellClick}
              autoPageSize
              pagination
              style={{ height: "100%" }}
              slots={{
                toolbar: () => (
                  <FamilyReactionToolbar customButton={addReactionButton} />
                ),
              }}
              sx={{
                "& .MuiDataGrid-cell": {
                  borderRight: "3px solid #ddd",
                  borderBottom: "3px solid #ddd",
                  padding: "8px",
                },
                "& .MuiDataGrid-columnHeader": {
                  borderBottom: "3px solid #ccc",
                  padding: "10px",
                },
              }}
            />
          </div>
        )}
      </div>
      <CreateSpeciesModal
        open={createSpeciesOpen}
        onClose={handleCreateSpeciesClose}
        selectedFamilyId={selectedFamilyID}
        selectedMechanismId={selectedMechanismID}
        setSpeciesCreated={setSpeciesCreated}
      />
      <CreateReactionModal
        open={createReactionOpen}
        onClose={handleCreateReactionClose}
        selectedFamilyId={selectedFamilyID}
        selectedMechanismId={selectedMechanismID}
        selectedMechanismName={selectedMechanismName}
        setReactionCreated={setReactionCreated}
        reactionsCount={reactionsCount}
      />

      <UpdateSpeciesModal
        open={editPropertiesOpen}
        onClose={handleEditPropertiesClose}
        selectedFamilyId={selectedFamilyID}
        selectedMechanismId={selectedMechanismID}
        selectedSpecies={selectedSpecies}
        setSpeciesUpdated={setSpeciesUpdated}
        selectedSpeciesProperties={selectedSpeciesProperties}
      />
      <UpdateReactionModal
        open={editReactionOpen}
        onClose={handleEditReactionClose}
        selectedFamilyId={selectedFamilyID}
        selectedMechanismId={selectedMechanismID}
        selectedMechanismName={selectedMechanismName}
        setReactionUpdated={setReactionUpdated}
        reactionsCount={reactionsCount}
        selectedReaction={selectedReaction}
      />
    </div>
  );
};

export default RenderSpeciesReactionTable;
