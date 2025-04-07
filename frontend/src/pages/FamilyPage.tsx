import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/FamilyPage.css";
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import {
  Family,
  Mechanism,
  Reaction,
  ReactionTypeName,
  Species,
} from "../types/chemistryModels";
import {
  DataGrid,
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
  MechanismCreationModal,
  ReactionsEditorModal,
  SpeciesEditorModal,
} from "../components/FamilyEditorModals";
import { reactionToString, reactionTypeToString } from "../helpers/stringify";
import { UUID } from "crypto";
import { getAllFamilies } from "../API/API_GetMethods";
import { apiToFrontendFamily } from "../helpers/backendInteractions";
import { RowActionsButton } from "../components/RowActionsButton";
import { MechanismEditor } from "../components/MechanismEditor";
import { MechanismBrowser } from "../components/MechanismBrowser";

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
  const [familyCreationModalOpen, setFamilyCreationModalOpen] = useState<boolean>(false);
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
      default:
        currentMenuName.current = DataViewSelection.Default;
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
        setFamilies([]);
        setLoadingFamilies(false);
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
    setFamilyCreationModalOpen(false);
    window.onbeforeunload = () => true; // Sets "are you sure you want to leave" popup
  };

  const removeFamilyLocally = (family: Family): void => {
    setFamilies(families?.filter((element) => element.id != family.id));
  }

  return (
    <div className="layout-family-editor">
      <header>
        <Header />
      </header>
      <Paper square component="main" className="content-family-editor main-content">
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
                onClick={() => setFamilyCreationModalOpen(true)}
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
                    aria-label={`Expand options for ${family.name || "No name"} family`}
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
                        <Tooltip
                          title={"Remove this family from the editor"}
                          placement="bottom-start"
                          arrow
                          disableInteractive
                        >
                          <IconButton
                            onClick={() => {
                              removeFamilyLocally(family);

                            }}
                            aria-label={`Remove ${family.name || "No Name"} family from the editor`}
                            edge="start"
                          >
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
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
        open={familyCreationModalOpen}
        onClose={() => setFamilyCreationModalOpen(false)}
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

type ViewProps = {
  family: Family;
  updateFamily: (family: Family) => void;
};

const DefaultView = memo(function DefaultView() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Typography sx={{ paddingTop: "0.5em" }} color="textPrimary" variant="h4">
        No Family Selected
      </Typography>
      <Typography color="textSecondary" variant="h6">
        Select or Create a family to get started
      </Typography>
    </Box>
  );
});

export const SpeciesView = ({ family, updateFamily }: ViewProps) => {
  const { theme } = useCustomTheme();
  const [speciesEditorOpen, setSpeciesEditorOpen] = useState<boolean>(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();

  const createSpecies = () => {
    const frontendId: string = `${Date.now()}-${Math.floor(Math.random() * 10000000000)}`;
    const species: Species = {
      id: frontendId,
      name: "",
      description: "",
      attributes: {},
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
      <Box
        sx={{
          paddingTop: "0.5em",
          display: "flex",
          alignItems: "center",
          columnGap: "0.5rem",
        }}
      >
        <Typography
          color="textPrimary"
          variant="h4">
          Chemical Species
        </Typography>
        <Tooltip title="Chemical species are forms of a specific chemical entity. They can be named anything as long as it is clear what it represents. For example, a chemical species may be represented as either 'O' or 'Ozone'.">
          <HelpOutlineIcon />
        </Tooltip>
      </Box>
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
                <Tooltip
                  title="Add species to family"
                >
                  <Button onClick={createSpecies} color="primary">
                    <AddIcon />
                    <Typography variant="caption">Add Species</Typography>
                  </Button>
                </Tooltip>
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

export const ReactionsView = ({ family, updateFamily }: ViewProps) => {
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
      type: "NONE",
      reactants: [],
      products: [],
      attributes: {},
      isModified: false,
      isDeleted: false,
      isInDatabase: false,
    };
    setSelectedReaction(reaction);
    setReactionsEditorOpen(true);
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
    const reactionList = [...family.reactions];
    const existingIndex = reactionList.findIndex(element => element.id === reaction.id);

    if (existingIndex >= 0) {
      reactionList[existingIndex] = reaction;
    }
    else {
      reactionList.unshift(reaction);
    }

    updateFamily({
      ...family,
      reactions: reactionList,
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
      <Box
        sx={{
          paddingTop: "0.5em",
          display: "flex",
          alignItems: "center",
          columnGap: "0.5rem",
        }}
      >
        <Typography
          color="textPrimary"
          variant="h4">
          Chemical Reactions
        </Typography>
        <Tooltip title="Chemical reactions consist of reactants which create products during a certain phase. They can also be tuned with specific parameters given by the reaction type.">
          <HelpOutlineIcon />
        </Tooltip>
      </Box>
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
                <Tooltip
                  title="Add reaction to family"
                >
                  <Button onClick={createReaction} color="primary">
                    <AddIcon />
                    <Typography variant="caption">Add Reaction</Typography>
                  </Button>
                </Tooltip>
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

export const MechanismsView = ({ family, updateFamily }: ViewProps) => {
  const [mechanismCreationModalOpen, setMechanismCreationModalOpen] = useState<boolean>(false);
  const [selectedMechanism, setSelectedMechanism] = useState<Mechanism | null>(null);
  const [menuComponent, setMenuComponent] = useState<React.JSX.Element | null>(null);

  const createMechanism = (mechanism: Mechanism) => {
    updateFamily({
      ...family,
      mechanisms: [mechanism, ...family.mechanisms],
    });
    setMechanismCreationModalOpen(false);
    setSelectedMechanism(mechanism);
    window.onbeforeunload = () => true;
  }

  const updateMechanism = (mechanism: Mechanism) => {
    updateFamily({
      ...family,
      mechanisms: family.mechanisms.map((element) => {
        if (element.id == mechanism.id) {
          return {
            ...mechanism,
            isModified: false,
          };
        }
        return element;
      })
    });
    setSelectedMechanism(mechanism);
    // TODO Update Mechanism in backend
  }

  const getMenuComponent = (mechanism: Mechanism | null): React.JSX.Element => {
    if (!mechanism) {
      return <MechanismBrowser family={family} onEditButtonClick={setSelectedMechanism} />
    }

    return (
      <MechanismEditor
        family={family}
        mechanism={mechanism}
        updateMechanism={updateMechanism}
        navigateBack={() => {
          setSelectedMechanism(null);
        }}
      />
    );
  }

  useLayoutEffect(() => {
    const component = getMenuComponent(selectedMechanism);
    setMenuComponent(component);
  }, [selectedMechanism]);

  return (
    <Box>
      <Box
        sx={{
          paddingTop: "0.5em",
          display: "flex",
          alignItems: "center",
          columnGap: "0.5rem",
        }}
      >
        <Typography
          color="textPrimary"
          variant="h4">
          Mechanisms
        </Typography>
        <Tooltip title="Mechanisms contain a subset of a family's entities. They represent an analytical model in a specific family.">
          <HelpOutlineIcon />
        </Tooltip>
      </Box>
      <Typography color="textSecondary" variant="h6">
        {family.name}
      </Typography>

      {
        !selectedMechanism &&
        <Tooltip
          title="Create a new chemical mechanism"
        >
          <Button onClick={() => setMechanismCreationModalOpen(true)} color="primary">
            <AddIcon />
            <Typography variant="caption">Create New Mechanism</Typography>
          </Button>
        </Tooltip>
      }
      {menuComponent}
      <MechanismCreationModal
        open={mechanismCreationModalOpen}
        onClose={() => setMechanismCreationModalOpen(false)}
        onCreation={createMechanism}
      />
    </Box>
  );
};

export default FamilyPage;
