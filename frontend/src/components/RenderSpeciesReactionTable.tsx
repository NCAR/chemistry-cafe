import React, { useEffect, useState } from "react";

import { Species, Reaction } from "../../API/API_Interfaces";

import { CreateReactionModal, CreateSpeciesModal } from "./Modals";

import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";

import IconButton from "@mui/material/IconButton";
import { Add } from "@mui/icons-material";
import { Typography } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {
  getReactionsByMechanismId,
  getSpeciesByMechanismId,
} from "../API/API_GetMethods";

const tabsHeaderStyle: React.CSSProperties = {
  backgroundColor: "#f0f0f0",
  padding: "10px",
  borderBottom: "1px solid #ccc",
};

interface Props {
  selectedFamilyId: string | null;
  selectedMechanismId: string | null;
}

const RenderSpeciesReactionTable: React.FC<Props> = ({
  selectedFamilyId,
  selectedMechanismId,
}) => {
  const [createSpeciesOpen, setCreateSpeciesOpen] = useState(false);
  const handleCreateSpeciesOpen = () => setCreateSpeciesOpen(true);
  const handleCreateSpeciesClose = () => setCreateSpeciesOpen(false);

  const [createReactionOpen, setCreateReactionOpen] = useState(false);
  const handleCreateReactionOpen = () => setCreateReactionOpen(true);
  const handleCreateReactionClose = () => setCreateReactionOpen(false);

  const [species, setSpecies] = useState<Species[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const [speciesCreated, setSpeciesCreated] = useState<boolean>(false);
  const [reactionCreated, setReactionCreated] = useState<boolean>(false);

  const [currentTab, setCurrentTab] = useState<number>(0);

  const handleTabSwitch = (
    _event: React.ChangeEvent<unknown>,
    tabValue: number
  ) => {
    setCurrentTab(tabValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedMechanismId) {
        const fetchedSpecies = await getSpeciesByMechanismId(
          selectedMechanismId
        );
        const fetchedReactions = await getReactionsByMechanismId(
          selectedMechanismId
        );

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
  }, [selectedMechanismId, speciesCreated, reactionCreated]);

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
  ];

  const reactionColumns: GridColDef[] = [
    {
      field: "description",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body1">{params.value}</Typography>
      ),
    },
  ];

  const CustomToolbar: React.FC<{ customButton?: React.ReactNode }> = ({
    customButton,
  }) => {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        {customButton && customButton}
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  };

  const addSpeciesButton = (
    <IconButton
      onClick={handleCreateSpeciesOpen}
      aria-label="create species"
      style={{ color: "blue", margin: "5px" }}
      disabled={selectedFamilyId === null || selectedMechanismId === null}
    >
      <Add sx={{ fontSize: 32, fontWeight: "bold" }} />
    </IconButton>
  );

  const addReactionButton = (
    <IconButton
      onClick={handleCreateReactionOpen}
      aria-label="create reaction"
      style={{ color: "blue", margin: "5px" }}
      disabled={selectedFamilyId === null || selectedMechanismId === null}
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
        style={{ display: "flex", flexGrow: 1, overflowY: "auto" }}
      >
        {currentTab === 0 && (
          <div style={{ flexGrow: 1 }}>
            <DataGrid
              rows={species}
              columns={speciesColumns}
              getRowId={(row: Species) => row.id!}
              autoPageSize
              pagination
              style={{ height: "100%" }}
              slots={{
                toolbar: () => (
                  <CustomToolbar customButton={addSpeciesButton} />
                ),
              }}
              sx={{
                "& .MuiDataGrid-cell": {
                  borderRight: "1px solid #ddd",
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                },
                "& .MuiDataGrid-columnHeader": {
                  borderBottom: "1px solid #ccc",
                  padding: "10px",
                },
              }}
            />
          </div>
        )}
        {currentTab === 1 && (
          <div style={{ flexGrow: 1 }}>
            <DataGrid
              rows={reactions}
              columns={reactionColumns}
              getRowId={(row: Reaction) => row.id!}
              autoPageSize
              pagination
              style={{ height: "100%" }}
              slots={{
                toolbar: () => (
                  <CustomToolbar customButton={addReactionButton} />
                ),
              }}
              sx={{
                "& .MuiDataGrid-cell": {
                  borderRight: "1px solid #ddd",
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                },
                "& .MuiDataGrid-columnHeader": {
                  borderBottom: "1px solid #ccc",
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
        selectedFamilyId={selectedFamilyId}
        selectedMechanismId={selectedMechanismId}
        setSpeciesCreated={setSpeciesCreated}
      />
      <CreateReactionModal
        open={createReactionOpen}
        onClose={handleCreateReactionClose}
        selectedFamilyId={selectedFamilyId}
        selectedMechanismId={selectedMechanismId}
        setReactionCreated={setReactionCreated}
      />
    </div>
  );
};

export default RenderSpeciesReactionTable;
