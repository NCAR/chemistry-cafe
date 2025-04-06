import { memo, MouseEvent, useEffect, useRef, useState } from "react";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/FamilyPage.css";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import {
  Family,
  Reaction,
  ReactionTypeName,
  Species,
} from "../types/chemistryModels";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useCustomTheme } from "../components/CustomThemeContext";
import {
  FamilyCreationModal,
  ReactionsEditorModal,
  SpeciesEditorModal,
} from "../components/FamilyEditorModals";
import { reactionToString, reactionTypeToString } from "../helpers/stringify";
import { UUID } from "crypto";
import { serializeMechanism } from "../helpers/serialization";
import { getAllFamilies } from "../API/API_GetMethods";
import { apiToFrontendFamily } from "../helpers/backendInteractions";

const FamilyPage = () => {
  enum DataViewSelection {
    Species = "species",
    Reactions = "reactions",
    Mechanisms = "mechanisms",
    Default = "default",
  }

  const [loadingFamilies, setLoadingFamilies] = useState<boolean>(true);
  const [families, setFamilies] = useState<Array<Family>>();
  const [dataView, setDataView] = useState<React.JSX.Element>(<DefaultView />);
  const [openFamilyCreationModal, setOpenFamilyCreationModal] =
    useState<boolean>(false);
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
      });
    });

    setDataView(getDataViewComponent(currentMenuName.current, family));
  };

  /**
   * Creates a selected menu for a specific family
   * @param menuName Menu to be selected. This is usually encoded in the id of a treeitem
   * @param family Family object to view
   * @returns Editor Component
   */
  const getDataViewComponent = (
    menuName: string,
    family: Family,
  ): React.JSX.Element => {
    switch (menuName) {
      case DataViewSelection.Species:
        currentMenuName.current = menuName;
        return <SpeciesView family={family} updateFamily={updateFamily} />;
      case DataViewSelection.Reactions:
        currentMenuName.current = menuName;
        return <ReactionsView family={family} updateFamily={updateFamily} />;
      case DataViewSelection.Mechanisms:
        currentMenuName.current = menuName;
        return <MechanismsView family={family} updateFamily={updateFamily} />;
      case DataViewSelection.Default:
        currentMenuName.current = menuName;
        return <DefaultView />;
      default:
        return <DefaultView />;
    }
  };

  /**
   * Callback when a tree item is selected. 
   * @param _ 
   * @param itemId 
   * @param isSelected 
   * @returns 
   */
  const handleTreeItemToggle = (_: React.SyntheticEvent, itemId: string, isSelected: boolean) => {
    if (!isSelected) {
      return;
    }

    const [familyId, menuName] = itemId.split(";");
    const family = families?.find((element) => element.id == familyId);

    // This happens if a treeitem that expands a selection is chosen.
    if (!family) {
      return;
    }

    setDataView(
      getDataViewComponent(
        menuName,
        family,
      ),
    );
  }

  useEffect(() => {
    const abortController = new AbortController();
    const fetchFamilyData = async () => {
      try {
        const allFamilies = await getAllFamilies();
        setFamilies(allFamilies.map((element) => apiToFrontendFamily(element)));
        setLoadingFamilies(false);
      } catch (err) {
        if (!abortController.signal.aborted) {
          alert(err);
        }
      }
    };

    fetchFamilyData();

    return () => abortController.abort();
  }, []);

  const createFamily = (family: Family): void => {
    if (families) {
      setFamilies([...families, family]);
    } else {
      setFamilies([family]);
    }
    setOpenFamilyCreationModal(false);
    window.onbeforeunload = () => true; // Sets "are you sure you want to leave" popup
  };

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
              backgroundColor:
                appearanceSettings.mode === "dark" ? "#1a1a1a" : "#f0f0f0",
            }}
            square
            variant="outlined"
          >
            <Typography variant="h4">Families</Typography>
            <Tooltip title="Create Family">
              <IconButton
                aria-label="Create Family"
                onClick={() => setOpenFamilyCreationModal(true)}
              >
                <AddIcon
                  color="primary"
                  sx={{ fontSize: 32, fontWeight: "bold" }}
                />
              </IconButton>
            </Tooltip>
          </Paper>
          {loadingFamilies ? (
            <CircularProgress />
          ) : (
            <SimpleTreeView onItemSelectionToggle={handleTreeItemToggle}>
              {families &&
                families.map((family, index) => (
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
                          onClick={() => { }}
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
                      itemId={`${family.id};${DataViewSelection.Species}`}
                      label={`Species (${family.species.filter((element) => !element.isDeleted).length})`}
                      aria-label="Open Species Editor"
                    />
                    <TreeItem
                      itemId={`${family.id};${DataViewSelection.Reactions}`}
                      label={`Reactions (${family.reactions.filter((element) => !element.isDeleted).length})`}
                      aria-label="Open Reactions Editor"
                    />
                    <TreeItem
                      itemId={`${family.id};${DataViewSelection.Mechanisms}`}
                      label={`Mechanisms (${family.mechanisms.length})`}
                    />
                  </FamilyTreeItem>
                ))}
            </SimpleTreeView>
          )}
        </div>
        <div className="family-view">{dataView}</div>
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
    "& .close": {
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
  handleEditButtonClick: () => void;
  handleDeleteButtonClick: () => void;
}> = ({ handleEditButtonClick, handleDeleteButtonClick }) => {
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
          icon={<MoreVertIcon />}
          label="View Properties"
          onClick={handleMenuOpen}
        ></GridActionsCellItem>
      </Tooltip>
      <Menu open={open} anchorEl={anchorEl} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditButtonClick}>
          <ListItemIcon>
            <EditIcon color="action" />
          </ListItemIcon>
          <Typography>Edit</Typography>
        </MenuItem>
        <MenuItem onClick={handleDeleteButtonClick}>
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          <Typography>Delete</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

type ViewProps = {
  family: Family;
  updateFamily: (family: Family) => void;
};

const DefaultView = memo(function DefaultView() {
  return <Typography>Select a Family to get started</Typography>;
});

const SpeciesView = ({ family, updateFamily }: ViewProps) => {
  const { theme } = useCustomTheme();
  const [speciesEditorOpen, setSpeciesEditorOpen] = useState<boolean>(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();

  const createSpecies = () => {
    const frontendId: string = `${Date.now()}-${Math.floor(Math.random() * 10000000000)}`;
    const species: Species = {
      id: frontendId,
      name: "",
      description: "",
      properties: {},
      isModified: false,
      isDeleted: false,
      isInDatabase: false,
      familyId: family.id,
    };
    window.onbeforeunload = () => true;
    setSelectedSpecies(species);
    setSpeciesEditorOpen(true);
  };

  const removeSpecies = (id: UUID | string) => {
    const originalSpecies: Species | undefined = family.species.find(
      (value) => value.id === id,
    );
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
        };
      }),
    });
  };

  /**
   * Updates a given species or inserts it if it doesn't already exist in the list
   * @param species 
   */
  const updateSpecies = (species: Species) => {
    const speciesList = [...family.species];
    const existingIndex = speciesList.findIndex(element => element.id == species.id)

    if (existingIndex >= 0) {
      speciesList[existingIndex] = species;
    }
    else {
      speciesList.unshift(species);
    }

    updateFamily({
      ...family,
      species: speciesList,
    });
  };

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
              setSelectedSpecies(
                family.species.find((element) => element.id === id),
              );
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
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
        >
          {params.value || "<Empty>"}
        </Typography>
      ),
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
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
        >
          {params.value || "<Empty>"}
        </Typography>
      ),
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
      <Typography sx={{ paddingTop: "0.5em" }} color="textPrimary" variant="h4">
        Chemical Species
      </Typography>
      <Typography color="textSecondary" variant="h6">
        {family.name}
      </Typography>
      <DataGrid
        initialState={{ density: "compact" }}
        rows={family.species.filter((element) => !element.isDeleted)}
        columns={speciesColumns}
        autoPageSize
        sx={{
          flex: 1,
          ".MuiDataGrid-columnHeaderTitle": {
            fontFamily: theme.typography.fontFamily,
          },
          ".MuiDataGrid-overlay": {
            fontFamily: theme.typography.fontFamily,
          },
        }}
        slots={{
          toolbar: () => (
            <DataViewToolbar
              customButton={
                <Button onClick={createSpecies} color="primary">
                  <AddIcon />
                  <Typography variant="caption">Add Species</Typography>
                </Button>
              }
            />
          ),
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
};

const ReactionsView = ({ family, updateFamily }: ViewProps) => {
  const { theme } = useCustomTheme();
  const [reactionsEditorOpen, setReactionsEditorOpen] =
    useState<boolean>(false);
  const [selectedReaction, setSelectedReaction] = useState<Reaction>();

  const createReaction = () => {
    const frontendId: string = `${Date.now()}-${Math.floor(Math.random() * 10000000000)}`;
    const reaction: Reaction = {
      id: frontendId,
      name: "",
      description: "",
      type: "ARRHENIUS",
      reactants: [],
      products: [],
      isModified: false,
      isDeleted: false,
      isInDatabase: false,
    };
    updateFamily({
      ...family,
      reactions: [reaction, ...family.reactions],
    });
    window.onbeforeunload = () => true;
  };

  const removeReaction = (id: UUID | string) => {
    const originalReaction: Reaction | undefined = family.reactions.find(
      (value) => value.id === id,
    );
    if (!originalReaction) {
      return;
    }

    updateFamily({
      ...family,
      reactions: family.reactions.map((element) => {
        if (element.id !== id) {
          return element;
        } else {
          return {
            ...element,
            isDeleted: true,
            isModified: true,
          };
        }
      }),
    });
  };

  const updateReaction = (reaction: Reaction) => {
    updateFamily({
      ...family,
      reactions: family.reactions.map((element) => {
        if (element.id !== reaction.id) {
          return element;
        }
        return reaction;
      }),
    });
  };

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
                removeReaction(id);
              }
            }}
            handleEditButtonClick={() => {
              setSelectedReaction(
                family.reactions.find((element) => element.id === id),
              );
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
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
          noWrap
        >
          {params.value || "<Empty>"}
        </Typography>
      ),
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
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
          noWrap
        >
          {params.value || "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "type",
      headerName: "Reaction Type",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
          noWrap
        >
          {reactionTypeToString(params.value as ReactionTypeName)}
        </Typography>
      ),
    },
    {
      field: "id",
      headerName: "Equation",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
          noWrap
        >
          {reactionToString(
            family.reactions.find((e) => e.id == params.value),
            family.species,
          )}
        </Typography>
      ),
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
      <Typography sx={{ paddingTop: "0.5em" }} color="textPrimary" variant="h4">
        Chemical Reactions
      </Typography>
      <Typography color="textSecondary" variant="h6">
        {family.name}
      </Typography>
      <DataGrid
        initialState={{ density: "compact" }}
        rows={family.reactions.filter((element) => !element.isDeleted)}
        columns={reactionsColumns}
        autoPageSize
        sx={{
          flex: 1,
          ".MuiDataGrid-columnHeaderTitle": {
            fontFamily: theme.typography.fontFamily,
          },
          ".MuiDataGrid-overlay": {
            fontFamily: theme.typography.fontFamily,
          },
        }}
        slots={{
          toolbar: () => (
            <DataViewToolbar
              customButton={
                <Button onClick={createReaction} color="primary">
                  <AddIcon />
                  <Typography variant="caption">Add Reaction</Typography>
                </Button>
              }
            />
          ),
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
};

const MechanismsView = ({ family }: ViewProps) => {
  return (
    <Box>
      <Typography sx={{ paddingTop: "0.5em" }} color="textPrimary" variant="h4">
        Mechanisms (WIP)
      </Typography>
      <Typography color="textSecondary" variant="h6">
        {family.name}
      </Typography>
      {family.mechanisms.map((mechanism, index) => (
        <Card
          key={`mechanism-${mechanism.id}-${index}`}
          sx={{
            padding: 1,
          }}
        >
          <CardContent>
            <Box>
              <Typography color="textPrimary">{mechanism.name}</Typography>
              <Typography color="textSecondary">
                {mechanism.description}
              </Typography>
            </Box>
            <Button
              startIcon={<DownloadIcon />}
              sx={{ textTransform: "none" }}
              variant="contained"
              color="primary"
              onClick={() => {
                const link = document.createElement("a");
                const body = serializeMechanism(mechanism, family);
                const blob = new Blob([body], { type: "application/json" });
                const blobUrl = window.URL.createObjectURL(blob);

                link.download = "openAtmos.json";
                link.href = blobUrl;
                link.click();

                window.URL.revokeObjectURL(blobUrl);
                document.removeChild(link);
              }}
            >
              <Typography variant="subtitle1">
                Download (Not currently in spec)
              </Typography>
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default FamilyPage;
