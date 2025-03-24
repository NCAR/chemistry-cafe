import { memo, MouseEvent, useEffect, useRef, useState } from "react";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/FamilyPage.css";
import { alpha, Box, Button, Card, CardContent, CircularProgress, IconButton, ListItemIcon, Menu, MenuItem, Paper, styled, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { ArrheniusReaction, Family, Mechanism, Reaction, ReactionTypeName, Species } from "../types/chemistryModels";
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton } from "@mui/x-data-grid";
import { useCustomTheme } from "../components/CustomThemeContext";
import { FamilyCreationModal, ReactionsEditorModal, SpeciesEditorModal } from "../components/FamilyEditorModals";
import { reactionToString, reactionTypeToString } from "../helpers/stringify";
import { UUID } from "crypto";

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
      speciesId: "11111111-11111111-11111111-11111111-11111111",
      coefficient: 1,
    },
    {
      speciesId: "22222222-22222222-22222222-22222222-22222222",
      coefficient: 1,
    },
  ],
  products: [
    {
      speciesId: "33333333-33333333-33333333-33333333-33333333",
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
    speciesIds: ["11111111-11111111-11111111-11111111-11111111", "22222222-22222222-22222222-22222222-22222222"],
  }],
  speciesIds: ["11111111-11111111-11111111-11111111-11111111", "22222222-22222222-22222222-22222222-22222222"],
  reactionIds: ["11111111-11111111-11111111-11111111-11111111"],
}

const dummyFamilyData: Array<Family> = [
  {
    id: "11111111-11111111-11111111-11111111-11111111",
    name: "Test Family",
    description: "Test Family",
    mechanisms: [testMechanism, { ...testMechanism, name: "Another Test Subject", description: "" }],
    species: [carbon, oxygen, carbonDioxide],
    reactions: [testReaction],
    isModified: true,
  },
  {
    id: "22222222-22222222-22222222-22222222-22222222",
    name: "Another test family with a really long name that will surely not break the ui :D aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa 11111111111111111111111111111111111111111111111111111111111111",
    description: "Test Family",
    mechanisms: [],
    species: [{ ...carbon }, { ...oxygen }, { ...carbonDioxide }],
    reactions: [],
    isModified: true,
  },
]

const FamilyPage = () => {
  enum DataViewSelection {
    Species,
    Reactions,
    Mechanisms,
    Default,
  }

  const [loadingFamilies, setLoadingFamilies] = useState<boolean>(true);
  const [families, setFamilies] = useState<Array<Family>>();
  const [dataView, setDataView] = useState<React.JSX.Element>(<DefaultView />);
  const [openFamilyCreationModal, setOpenFamilyCreationModal] = useState<boolean>(false);
  const currentMenuName = useRef<DataViewSelection>(DataViewSelection.Default);

  const { appearanceSettings } = useCustomTheme();

  const updateFamily = (family: Family): void => {
    setFamilies((families) => {
      if (!families) {
        return families;
      }
      return families?.map((element) => {
        if (family.id === element.id) {
          return family;
        }
        return element;
      })
    });

    setDataView(getDataViewComponent(currentMenuName.current, family));
  }

  const getDataViewComponent = (menuName: DataViewSelection, family: Family) => {
    currentMenuName.current = menuName;
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

  const createFamily = (family: Family): void => {
    if (families) {
      setFamilies([...families, family]);
    }
    else {
      setFamilies([family]);
    }
    setOpenFamilyCreationModal(false);
    window.onbeforeunload = () => true; // Sets "are you sure you want to leave" popup
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
            <Tooltip title="Create Family">
              <IconButton aria-label="Create Family" onClick={() => setOpenFamilyCreationModal(true)}>
                <AddIcon color="primary" sx={{ fontSize: 32, fontWeight: "bold" }} />
              </IconButton>
            </Tooltip>
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
                        <Tooltip
                          title={family.name}
                          placement="bottom-start"
                          arrow
                          disableInteractive
                        >
                          <Typography
                            noWrap
                            sx={{
                              flex: 1,
                            }}
                          >
                            {family.name}
                          </Typography>
                        </Tooltip>
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
                      label={`Species (${family.species.filter((element) => !element.isDeleted).length})`}
                      aria-label="Open Species Editor"
                      onClick={() => {
                        setDataView(getDataViewComponent(DataViewSelection.Species, family));
                      }}
                    />
                    <TreeItem
                      itemId={`${family.id}-${index}-reactions`}
                      label={`Reactions (${family.reactions.filter((element) => !element.isDeleted).length})`}
                      aria-label="Open Reactions Editor"
                      onClick={() => {
                        setDataView(getDataViewComponent(DataViewSelection.Reactions, family));
                      }}
                    />
                    <TreeItem
                      itemId={`${family.id}-${index}-mechanisms`}
                      label={`Mechanisms (${family.mechanisms.length})`}
                      onClick={() => {
                        setDataView(getDataViewComponent(DataViewSelection.Mechanisms, family));
                      }}
                    />
                  </FamilyTreeItem>
                ))}
              </SimpleTreeView>
            )
          }

        </div>
        <div className="family-view">
          {dataView}
        </div>
      </Paper>
      <footer>
        <Footer />
      </footer>
      <FamilyCreationModal
        open={openFamilyCreationModal}
        onClose={() => setOpenFamilyCreationModal(false)}
        onCreation={createFamily}
      />
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
        <Tooltip title="Row Actions" disableInteractive>
          <GridActionsCellItem
            aria-label="Expand Row Actions"
            icon={
              <MoreVertIcon />
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
  const [speciesEditorOpen, setSpeciesEditorOpen] = useState<boolean>(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();

  const createSpecies = () => {
    const species: Species = {
      id: Date.now().toString(),
      name: "",
      description: "",
      properties: {},
      isModified: false,
      isDeleted: false,
    }
    updateFamily({
      ...family,
      species: [species, ...family.species],
    });
    window.onbeforeunload = () => true;
  }

  const removeSpecies = (id: UUID | string) => {
    const originalSpecies: Species | undefined = family.species.find((value) => value.id === id);
    if (!originalSpecies) {
      return;
    }

    updateFamily({
      ...family,
      species: family.species.map((element) => {
        if (element.id !== id) {
          return element;
        }
        return {
          ...element,
          isDeleted: true,
          isModified: true,
        }
      })
    });
  }

  const updateSpecies = (species: Species) => {
    updateFamily({
      ...family,
      species: family.species.map((element) => {
        if (element.id !== species.id) {
          return element;
        }
        return species;
      })
    });
  }

  const speciesColumns: GridColDef[] = [
    {
      field: "Row Actions",
      type: "actions",
      headerClassName: "roleDataHeader",
      cellClassName: "actions",
      disableColumnMenu: true,
      getActions: ({ id }) => {
        return [
          <RowActionsButton
            handleDeleteButtonClick={() => {
              if (typeof id === "string") {
                removeSpecies(id as string);
              }
            }}
            handleEditButtonClick={() => {
              setSelectedSpecies(family.species.find((element) => element.id === id));
              setSpeciesEditorOpen(true);
            }}
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
          {params.value || "<Empty>"}
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
          {params.value || "<Empty>"}
        </Typography>
      )
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Typography sx={{ paddingTop: "0.5em" }} color="textPrimary" variant="h4">Chemical Species</Typography>
      <Typography color="textSecondary" variant="h6">{family.name}</Typography>
      <DataGrid
        initialState={{ density: "compact" }}
        rows={family.species.filter((element) => !element.isDeleted)}
        columns={speciesColumns}
        autoPageSize
        style={{
          flex: 1,
        }}
        slots={{
          toolbar: () =>
            <DataViewToolbar
              customButton={
                <Button onClick={createSpecies} color="primary">
                  <AddIcon />
                  <Typography variant="caption">Add Species</Typography>
                </Button>
              }
            />
        }}
      />
      <SpeciesEditorModal
        open={speciesEditorOpen}
        onClose={() => setSpeciesEditorOpen(false)}
        onUpdate={updateSpecies}
        species={selectedSpecies}
      />
    </Box>
  );
}

const ReactionsView = ({ family, updateFamily }: ViewProps) => {
  const { theme } = useCustomTheme();
  const [reactionsEditorOpen, setReactionsEditorOpen] = useState<boolean>(false);
  const [selectedReaction, setSelectedReaction] = useState<Reaction>();

  const createReaction = () => {
    const reaction: Reaction = {
      id: Date.now().toString(),
      name: "",
      description: "",
      type: "ARRHENIUS",
      reactants: [],
      products: [],
      isModified: false,
      isDeleted: false,
    }
    updateFamily({
      ...family,
      reactions: [reaction, ...family.reactions]
    });
    window.onbeforeunload = () => true;
  }

  const removeReaction = (id: UUID | string) => {
    const originalReaction: Reaction | undefined = family.reactions.find((value) => value.id === id);
    if (!originalReaction) {
      return;
    }

    updateFamily({
      ...family,
      reactions: family.reactions.map((element) => {
        if (element.id !== id) {
          return element;
        }
        else {
          return {
            ...element,
            isDeleted: true,
            isModified: true,
          }
        }
      })
    });
  }

  const updateReaction = (reaction: Reaction) => {
    updateFamily({
      ...family,
      reactions: family.reactions.map((element) => {
        if (element.id !== reaction.id) {
          return element;
        }
        return reaction;
      })
    });
  }

  const reactionsColumns: GridColDef[] = [
    {
      field: "Row Actions",
      type: "actions",
      headerClassName: "roleDataHeader",
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <RowActionsButton
            handleDeleteButtonClick={() => {
              if (typeof id === "string") {
                removeReaction(id)
              }
            }}
            handleEditButtonClick={() => {
              setSelectedReaction(family.reactions.find((element) => element.id === id));
              setReactionsEditorOpen(true);
            }}
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
          {params.value || "<Empty>"}
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
          {params.value || "<Empty>"}
        </Typography>
      )
    },
    {
      field: "type",
      headerName: "Reaction Type",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value ? theme.palette.text.primary : theme.palette.text.disabled,
          }}
          noWrap
        >
          {reactionTypeToString(params.value as ReactionTypeName)}
        </Typography>
      )
    },
    {
      field: "id",
      headerName: "Equation",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value ? theme.palette.text.primary : theme.palette.text.disabled,
          }}
          noWrap
        >
          {reactionToString(family.reactions.find(e => e.id == params.value), family.species)}
        </Typography>
      )
    },

  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
    >
      <Typography sx={{ paddingTop: "0.5em" }} color="textPrimary" variant="h4">Chemical Reactions</Typography>
      <Typography color="textSecondary" variant="h6">{family.name}</Typography>
      <DataGrid
        initialState={{ density: "compact" }}
        rows={family.reactions.filter((element) => !element.isDeleted)}
        columns={reactionsColumns}
        autoPageSize
        sx={{
          flex: 1
        }}
        slots={{
          toolbar: () =>
            <DataViewToolbar
              customButton={
                <Button onClick={createReaction} color="primary">
                  <AddIcon />
                  <Typography variant="caption">Add Reaction</Typography>
                </Button>
              }
            />
        }}
      />
      <ReactionsEditorModal
        open={reactionsEditorOpen}
        onClose={() => setReactionsEditorOpen(false)}
        onUpdate={updateReaction}
        reaction={selectedReaction}
        family={family}
      />
    </Box>
  );
}

const MechanismsView = ({ family, updateFamily }: ViewProps) => {
  return (
    <Box>
      <Typography sx={{ paddingTop: "0.5em" }} color="textPrimary" variant="h4">Mechanisms</Typography>
      <Typography color="textSecondary" variant="h6">{family.name}</Typography>
      {family.mechanisms.map((mechanism, index) => (
        <Card
          key={`mechanism-${mechanism.id}-${index}`}
          sx={{
            padding: 1,
          }}
        >
          <CardContent>
            <Typography color="textPrimary">{mechanism.name}</Typography>
            <Typography color="textSecondary">{mechanism.description}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}


export default FamilyPage;
