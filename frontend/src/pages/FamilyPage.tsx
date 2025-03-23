import { memo, MouseEvent, useEffect, useState } from "react";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/FamilyPage.css";
import { alpha, Box, CircularProgress, IconButton, ListItemIcon, Menu, MenuItem, Paper, styled, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { ArrheniusReaction, Family, Mechanism, Species } from "../types/chemistryModels";
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton } from "@mui/x-data-grid";
import { useCustomTheme } from "../components/CustomThemeContext";

const carbon: Species = {
  id: "11111111-11111111-11111111-11111111-11111111",
  name: "C",
  description: "Good 'ol carbon",
  properties: {
    "molecular weight": {
      units: "kg mol-1",
      value: 0.045
    }
  },
}

const oxygen: Species = {
  id: "22222222-22222222-22222222-22222222-22222222",
  name: "O2",
  description: null,
  properties: {},
}

const carbonDioxide: Species = {
  id: "33333333-33333333-33333333-33333333-33333333",
  name: "CO2",
  description: "This is a really long description that will hopefully break the ui because I really want to break the ui beacus that would be cool 11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
  properties: {},
}

const testReaction: ArrheniusReaction = {
  id: "11111111-11111111-11111111-11111111-11111111",
  type: "ARRHENIUS",
  gasPhase: "gas",
  reactants: [
    {
      species: carbon,
      coefficient: 1,
    },
    {
      species: oxygen,
      coefficient: 1,
    },
  ],
  products: [
    {
      species: carbonDioxide,
      coefficient: 1,
    }
  ],
  name: "Test Reaction",
  description: "Me when I make a really long description lol lol lol lol lol lol lol lol lo ll oll ollollol lol loll ollo ll o llollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollollol",
  A: 1,
  B: 1,
  C: 1,
  D: 1,
  E: 1,
}

const testMechanism: Mechanism = {
  id: "11111111-11111111-11111111-11111111-11111111",
  name: "Test Mechanism",
  description: "This is just a test. Nothing else.",
  phases: [{
    name: "gas",
    description: "Gas Phase",
    species: [carbon, oxygen],
  }],
  species: [carbon, oxygen],
  reactions: [testReaction],
}

const dummyFamilyData: Array<Family> = [
  {
    id: "11111111-11111111-11111111-11111111-11111111",
    name: "Test Family",
    description: "Test Family",
    mechanisms: [testMechanism, { ...testMechanism, name: "Another Test Subject" }],
    species: [carbon, oxygen],
    reactions: [testReaction],
    saved: true,
  },
  {
    id: "22222222-22222222-22222222-22222222-22222222",
    name: "Another test family with a really long name that will surely not break the ui :D aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa 11111111111111111111111111111111111111111111111111111111111111",
    description: "Test Family",
    mechanisms: [],
    species: [{ ...carbon }, { ...oxygen }, { ...carbonDioxide }],
    reactions: [],
    saved: true,
  },

]

const FamilyPage = () => {
  window.onbeforeunload = () => true; // Sets "are you sure you want to leave" popup
  const [loadingFamilies, setLoadingFamilies] = useState<boolean>(true);
  const [families, setFamilies] = useState<Array<Family>>();
  const [dataView, setDataView] = useState<React.JSX.Element>(<DefaultView />);

  const { appearanceSettings } = useCustomTheme();

  enum DataViewSelection {
    Species,
    Reactions,
    Mechanisms,
    Default,
  }

  const getDataViewComponent = (menuName: DataViewSelection, family: Family, updateFamily: (family: Family) => void) => {
    switch (menuName) {
      case DataViewSelection.Species:
        return <SpeciesView family={family} updateFamily={updateFamily} />
      case DataViewSelection.Reactions:
        return <ReactionsView family={family} updateFamily={updateFamily} />
      case DataViewSelection.Mechanisms:
        return <MechanismsView family={family} updateFamily={updateFamily} />
      default:
      case DataViewSelection.Default:
        return <DefaultView />
    }
  }


  useEffect(() => {
    const abortController = new AbortController();
    const fetchFamilyData = async () => {
      try {
        // Mock network request
        setTimeout(() => {
          setFamilies(dummyFamilyData);
          setLoadingFamilies(false);
        }, 500);
      } catch (err) {
        if (!abortController.signal.aborted) {
          alert(err);
        }
      }
    }

    fetchFamilyData();

    return () => {
      abortController.abort();
    };
  }, []);

  const downloadMechanism = async (mechanismId: string, format: "JSON" | "YAML" | "Musicbox") => {
    console.log(mechanismId, format);
  }

  const updateFamilyLocally = (family: Family) => {
    console.info(`Update Family ${family.name}`)
  }

  return (
    <div className="layout-family-editor">
      <header>
        <Header />
      </header>
      <Paper square component="section" className="content-family-editor">
        <div className="family-selector">
          <Paper
            component="div"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              backgroundColor: appearanceSettings.mode === "dark" ? "#1a1a1a" : "#f0f0f0",
            }}
            square
            variant="outlined"
          >
            <Typography variant="h4">Families</Typography>
            <IconButton>
              <AddIcon color="primary" sx={{ fontSize: 32, fontWeight: "bold" }} />
            </IconButton>
          </Paper>
          {
            loadingFamilies ? (
              <CircularProgress />
            ) : (
              <SimpleTreeView>
                {families && families.map((family, index) => (
                  <FamilyTreeItem
                    key={`${family.id}-${index}`}
                    itemId={`${family.id}-${index}`}
                    label={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          columnGap: "0.8em",
                        }}
                      >
                        <Typography
                          noWrap
                          sx={{
                            flex: 1,
                          }}
                        >
                          {family.name}
                        </Typography>
                        <IconButton
                          onClick={() => {
                          }}
                          aria-label="edit"
                          edge="start"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                          }}
                          aria-label="delete"
                          style={{ color: "red" }}
                          edge="start"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    }
                  >
                    <TreeItem
                      itemId={`${family.id}-${index}-species`}
                      label={`Species (${family.species.length})`}
                      onClick={() => {
                        setDataView(getDataViewComponent(DataViewSelection.Species, family, updateFamilyLocally));
                      }}
                    />
                    <TreeItem
                      itemId={`${family.id}-${index}-reactions`}
                      label={`Reactions (${family.reactions.length})`}
                      onClick={() => {
                        setDataView(getDataViewComponent(DataViewSelection.Reactions, family, updateFamilyLocally));
                      }}
                    />
                    <TreeItem
                      itemId={`${family.id}-${index}-mechanisms`}
                      label={`Mechanisms (${family.mechanisms.length})`}
                      onClick={() => {
                        setDataView(getDataViewComponent(DataViewSelection.Mechanisms, family, (family) => { console.log(family.name) }));
                      }}
                    />
                  </FamilyTreeItem>
                ))}
              </SimpleTreeView>
            )
          }

        </div>
        <div className="family-selector">
          {dataView}
        </div>
      </Paper>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

const FamilyTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(1.0, 1),
    margin: theme.spacing(0.2, 0),
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));


const DataViewToolbar: React.FC<{ customButton?: React.ReactNode }> = ({
  customButton,
}) => {
  return (
    <GridToolbarContainer>
      {customButton && customButton}
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector
        slotProps={{ tooltip: { title: "Change density" } }}
      />

      <Box sx={{ flexGrow: 1 }} />
    </GridToolbarContainer>
  );
};

const RowActionsButton: React.FC<{
  handleEditButtonClick: () => void,
  handleDeleteButtonClick: () => void
}> = ({
  handleEditButtonClick,
  handleDeleteButtonClick,
}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen(true);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
      setOpen(false);
    };

    return (
      <>
        <Tooltip title="Row Actions" >
          <GridActionsCellItem
            aria-label="Expand Row Actions"
            icon={
              <ExpandCircleDownIcon />
            }
            label="View Properties"
            onClick={handleMenuOpen}
          >
          </GridActionsCellItem >
        </Tooltip>
        <Menu
          open={open}
          anchorEl={anchorEl}
          onClose={handleMenuClose}

        >
          <MenuItem onClick={handleEditButtonClick}>
            <ListItemIcon>
              <EditIcon color="action" />
            </ListItemIcon>
            <Typography>
              Edit
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleDeleteButtonClick}>
            <ListItemIcon>
              <DeleteIcon color="error" />
            </ListItemIcon>
            <Typography>
              Delete
            </Typography>
          </MenuItem>
        </Menu >
      </>
    );
  }

type ViewProps = {
  family: Family;
  updateFamily: (family: Family) => void;
}

const DefaultView = memo(function DefaultView() {
  return (
    <Typography>Select a Family to get started</Typography>
  );
});

const SpeciesView = ({ family, updateFamily }: ViewProps) => {
  const { theme } = useCustomTheme();

  const speciesColumns: GridColDef[] = [
    {
      field: "Row Actions",
      type: "actions",
      headerClassName: "roleDataHeader",
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <RowActionsButton
            handleDeleteButtonClick={() => alert(`Deleting ${id}`)}
            handleEditButtonClick={() => alert(`Editing ${id}`)}
          />,
        ];
      },
    },
    {
      field: "name",
      headerName: "Name",
      type: "string",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value ? theme.palette.text.primary : theme.palette.text.disabled
          }}
        >
          {params.value ?? "<Empty>"}
        </Typography>
      )
    },
    {
      field: "description",
      headerName: "Description",
      type: "string",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value ? theme.palette.text.primary : theme.palette.text.disabled
          }}
        >
          {params.value ?? "<Empty>"}
        </Typography>
      )
    },
  ];

  return (
    <>
      <DataGrid
        initialState={{ density: "compact" }}
        rows={family.species}
        columns={speciesColumns}
        autoPageSize
        style={{ height: "100%" }}
        slots={{
          toolbar: () => <DataViewToolbar />
        }}
      />
    </>
  );
}

const ReactionsView = ({ family, updateFamily }: ViewProps) => {
  const { theme } = useCustomTheme();

  const reactionsColumns: GridColDef[] = [
    {
      field: "Row Actions",
      type: "actions",
      headerClassName: "roleDataHeader",
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <RowActionsButton
            handleDeleteButtonClick={() => alert(`Deleting ${id}`)}
            handleEditButtonClick={() => alert(`Editing ${id}`)}
          />,
        ];
      },
    },
    {
      field: "name",
      headerName: "Name",
      type: "string",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value ? theme.palette.text.primary : theme.palette.text.disabled,
          }}
          noWrap
        >
          {params.value ?? "<Empty>"}
        </Typography>
      )
    },
    {
      field: "description",
      headerName: "Description",
      type: "string",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value ? theme.palette.text.primary : theme.palette.text.disabled,
          }}
          noWrap
        >
          {params.value ?? "<Empty>"}
        </Typography>
      )
    },
  ];

  return (
    <>
      <DataGrid
        initialState={{ density: "compact" }}
        rows={family.reactions}
        columns={reactionsColumns}
        autoPageSize
        style={{ height: "100%" }}
        slots={{
          toolbar: () => <DataViewToolbar />
        }}
      />
    </>
  );
}

const MechanismsView = ({ family, updateFamily }: ViewProps) => {
  return (
    <Typography>{family.name} Mechanisms</Typography>
  );
}


export default FamilyPage;
