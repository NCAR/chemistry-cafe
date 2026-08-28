import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  MouseEvent,
} from "react";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/FamilyEditor.css";
import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  styled,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import CircleIcon from "@mui/icons-material/Circle";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import FileUploadIcon from "@mui/icons-material/FileUpload";
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
  speciesExclusiveConflict ,
  applySpeciesRowUpdate
} from "../helpers/editorHelpers";
import {
  DataGrid,
  GridColDef,
  GridEditBooleanCell,
  GridEditInputCell,
  GridPreProcessEditCellProps,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useCustomTheme } from "../components/CustomThemeContext";
import {
  ConfirmActionModal,
  FamilyCreationModal,
  ImportFamilyModal,
  MechanismCreationModal,
  ReactionEditorModal,
} from "../components/FamilyEditorModals";
import { SpeciesEditorModal } from "../components/modals/SpeciesEditorModal";
import { reactionToString, reactionTypeToString } from "../helpers/stringify";
import { UUID } from "crypto";
import { getFamily } from "../API/API_GetMethods";
import {
  apiToFrontendFamily,
  saveFamilyChanges,
  uploadFamily,
} from "../helpers/backendInteractions";
import { RowActionsButton } from "../components/RowActionsButton";
import { MechanismEditor } from "../components/MechanismEditor";
import { MechanismBrowser } from "../components/MechanismBrowser";
import SaveIcon from "@mui/icons-material/Save";
import { useAuth } from "../components/AuthContext";
import { deleteFamily } from "../API/API_DeleteMethods";
import { APIFamily } from "../API/API_Interfaces";
import {
  generateFrontendID,
  updateLocalStorageFamilyInfo,
} from "../helpers/localFamilies";

const FamilyPage = () => {
  enum DataViewSelection {
    GeneralInfo = "general",
    Species = "species",
    Reactions = "reactions",
    Mechanisms = "mechanisms",
    Phases = "phases",
    Default = "default",
  }

  const [loading, setLoading] = useState<boolean>(true);
  const [families, setFamilies] = useState<Array<Family>>();
  const [dataView, setDataView] = useState<React.JSX.Element>(<DefaultView />);
  const [familyCreationModalOpen, setFamilyCreationModalOpen] =
    useState<boolean>(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("");
  const [openImportMenu, setOpenImportMenu] = useState<boolean>(false); // Used when user attempts to import families
  const { user } = useAuth();
  const currentMenuName = useRef<string>(DataViewSelection.Default);
  const { appearanceSettings } = useCustomTheme();

  const updateFamily = (family: Family): void => {
    setFamilies((families) => {
      if (!families) {
        return families;
      }
      return families.map((element) => {
        if (family.id === element.id) {
          return {
            ...family,
            isModified: family.isInDatabase?.valueOf(),
          };
        }
        return element;
      });
    });

    setSelectedFamilyId(family.id);
    setDataView(
      getDataViewComponent(currentMenuName.current, {
        ...family,
        isModified: true,
      }),
    );
    window.onbeforeunload = () => true; // Sets "are you sure you want to leave" popup
  };

  useEffect(() => {
    if (families) {
      updateLocalStorageFamilyInfo(families);
    }
  }, [families]);

  /**
   * Creates a selected menu for a specific family
   * @param menuName Menu to be selected. This is usually encoded in the id of a treeitem
   * @param family Family object to view
   * @returns Editor Component
   */
  const getDataViewComponent = (
    menuName: string,
    family?: Family,
  ): React.JSX.Element => {
    if (!family) {
      return <DefaultView />;
    }

    currentMenuName.current = menuName;
    switch (menuName) {
      case DataViewSelection.Species:
        return <SpeciesView family={family} updateFamily={updateFamily} />;
      case DataViewSelection.Reactions:
        return <ReactionsView family={family} updateFamily={updateFamily} />;
      case DataViewSelection.Mechanisms:
        return <MechanismsView family={family} updateFamily={updateFamily} />;
      case DataViewSelection.GeneralInfo:
        return (
          <GeneralInfoView
            family={family}
            updateFamily={updateFamily}
            onPublish={async () => {
              if (!user) {
                alert("Please log in to upload a family");
                return;
              }
              setLoading(true);
              await uploadFamily(family, user)
                .then((databaseFamily) => {
                  setFamilies((families) => {
                    if (!families) {
                      return families;
                    }
                    return families.map((element) => {
                      if (family.id === element.id) {
                        return {
                          ...databaseFamily,
                        };
                      }
                      return element;
                    });
                  });
                })
                .catch((e) => {
                  console.error(e);
                  alert("An issue occurred while uploading the family");
                })
                .finally(() => setLoading(false));
            }}
            onDelete={() => {
              setLoading(true);
              if (family.isInDatabase) {
                deleteFamily(family.id)
                  .then(() => removeFamilyLocally(family))
                  .catch((e) => {
                    console.error(e);
                    alert("An error occurred while deleting this family");
                  })
                  .finally(() => {
                    setDataView(
                      getDataViewComponent(DataViewSelection.Default),
                    );
                    setLoading(false);
                  });
              } else {
                removeFamilyLocally(family);
              }
            }}
          />
        );
      case DataViewSelection.Phases:
        return <PhaseView family={family} updateFamily={updateFamily} />;
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
  const handleTreeItemToggle = (
    _: React.SyntheticEvent,
    itemId: string,
    isSelected: boolean,
  ) => {
    if (!isSelected) {
      return;
    }

    const [familyId, menuName] = itemId.split(";");
    const family = families?.find((element) => element.id == familyId);

    // This happens if a treeitem that expands a selection is chosen.
    if (!family) {
      return;
    }

    setSelectedFamilyId(family.id);
    setDataView(getDataViewComponent(menuName, family));
  };

  useEffect(() => {
    const abortController = new AbortController();
    const fetchFamilyData = async () => {
      try {
        let queryParameters = "?expand=true";
        if (user) {
          queryParameters += `&userId=${user.id}`;
        }
        let allFamilies: Family[] = [];

        const localFamilies: unknown = JSON.parse(
          localStorage.getItem("localFamilies") || "[]",
        );
        if (Array.isArray(localFamilies)) {
          // TODO Check if these actually follow family schema
          allFamilies = allFamilies.concat(localFamilies);
        }

        const uploadedFamilyIds: unknown = JSON.parse(
          localStorage.getItem("uploadedFamilyIds") || "[]",
        );
        if (Array.isArray(uploadedFamilyIds)) {
          for (const familyId of uploadedFamilyIds) {
            if (typeof familyId == "string") {
              const family: APIFamily | null = await getFamily(
                familyId as UUID,
              ).catch((err) => {
                console.error(
                  `Issue finding local family with id '${familyId}':`,
                  err,
                );
                return null;
              });
              if (family) {
                allFamilies.push(apiToFrontendFamily(family));
              }
            }
          }
        }

        setFamilies(allFamilies);
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error(err);
        }
        setFamilies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyData();

    return () => abortController.abort();
  }, []);

  const createFamily = (family: Family): void => {
    if (families) {
      setFamilies([family, ...families]);
    } else {
      setFamilies([family]);
    }
    setFamilyCreationModalOpen(false);
    window.onbeforeunload = () => true; // Sets "are you sure you want to leave" popup
  };

  const removeFamilyLocally = (family: Family): void => {
    if (selectedFamilyId === family.id) {
      setDataView(<DefaultView />);
    }
    setFamilies(families?.filter((element) => element.id != family.id));
  };

  const saveFamilies = async (): Promise<void> => {
    if (!families) {
      return;
    }

    setLoading(true);

    const familyList: Family[] = [];
    for (const family of families) {
      if (family.isModified && family.isInDatabase) {
        await saveFamilyChanges(family)
          .then((family) => familyList.push(family))
          .catch((e) => {
            console.error(e);
            alert("An error ocurred while saving families");
          });
      } else {
        familyList.push(family);
      }
    }

    setLoading(false);
    setFamilies(familyList);
  };

  return (
    <div className="layout-family-editor">
      <header>
        <Header />
      </header>
      <Paper
        square
        component="main"
        className="content-family-editor main-content"
      >
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
            <Typography variant="h6">Families</Typography>
            <Box
              sx={{
                justifyContent: "right",
              }}
            >
              <Tooltip title="Save changes to all families">
                <IconButton
                  aria-label="Save changes to all families"
                  id="save-family-button"
                  color="primary"
                  data-testid="save-family-button"
                  onClick={saveFamilies}
                >
                  <SaveIcon sx={{ fontSize: 32, fontWeight: "bold" }} />
                </IconButton>
              </Tooltip>
              <AddFamilyButton
                handleCreateButtonClick={() => setFamilyCreationModalOpen(true)}
                handleImportButtonClick={async () => setOpenImportMenu(true)}
              />
            </Box>
          </Paper>
          {families?.length === 0 ? (
            <Typography color="">No families to edit</Typography>
          ) : (
            <SimpleTreeView
              onItemSelectionToggle={handleTreeItemToggle}
              sx={{
                [`& .${treeItemClasses.label}`]: { fontSize: "0.85rem" },
              }}
            >
              {families &&
                families.map((family, index) => (
                  <FamilyTreeItem
                    aria-label={`Expand options for ${family.name || "No name"} family`}
                    key={`${family.id}-${index}`}
                    itemId={`${family.id}-${index}`}
                    data-testid={`${family.id}-tree-item`}
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
                              fontSize: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            {family.name}
                          </Typography>
                        </Tooltip>
                        {!family.isInDatabase && (
                          <Tooltip
                            title="This family is not currently published"
                            arrow
                          >
                            <CloudOffIcon />
                          </Tooltip>
                        )}
                        <RemoveFamilyButton
                          changesMade={family.isModified ?? false}
                          onClick={() => {
                            removeFamilyLocally(family);
                          }}
                        />
                      </div>
                    }
                  >
                    <TreeItem
                      itemId={`${family.id};${DataViewSelection.GeneralInfo}`}
                      label={`General Info`}
                      aria-label="Edit General Family Information"
                      data-testid={`${family.id}-info-tree-button`}
                    />
                    <TreeItem
                      itemId={`${family.id};${DataViewSelection.Species}`}
                      label={`Species (${family.species.filter((element) => !element.isDeleted).length})`}
                      aria-label="Open Species Editor"
                      data-testid={`${family.id}-species-tree-button`}
                    />
                    <TreeItem
                      itemId={`${family.id};${DataViewSelection.Reactions}`}
                      label={`Reactions (${family.reactions.filter((element) => !element.isDeleted).length})`}
                      aria-label="Open Reactions Editor"
                      data-testid={`${family.id}-reactions-tree-button`}
                    />
                    <TreeItem
                      itemId={`${family.id};${DataViewSelection.Phases}`}
                      label={`Phases (${family.phases.filter((element) => !element.isDeleted).length})`}
                      aria-label="Open Phase Editor"
                      data-testid={`${family.id}-phases-tree-button`}
                    />
                    <TreeItem
                      itemId={`${family.id};${DataViewSelection.Mechanisms}`}
                      label={`Mechanisms (${family.mechanisms.length})`}
                      data-testid={`${family.id}-mechanisms-tree-button`}
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
        onSubmit={createFamily}
      />
      <ImportFamilyModal
        open={openImportMenu}
        onClose={() => setOpenImportMenu(false)}
        onSubmit={createFamily}
      />
      {loading && (
        <CircularProgress
          sx={{
            position: "absolute",
            top: "50vh",
            left: "50%",
          }}
          size="5em"
        />
      )}
    </div>
  );
};

type AddFamilyButtonProps = {
  handleCreateButtonClick: () => void;
  handleImportButtonClick: () => void;
};

export const AddFamilyButton: React.FC<AddFamilyButtonProps> = ({
  handleCreateButtonClick,
  handleImportButtonClick,
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
      <Tooltip title="Add Family">
        <IconButton
          aria-label="Add a family to the editor"
          id="add-family-button"
          data-testid="add-family-button"
          onClick={handleMenuOpen}
        >
          <AddIcon color="primary" sx={{ fontSize: 32, fontWeight: "bold" }} />
        </IconButton>
      </Tooltip>
      <Menu open={open} anchorEl={anchorEl} onClose={handleMenuClose}>
        <MenuItem
          aria-label="Create a new family"
          data-testid="create-family-button"
          onClick={() => {
            handleCreateButtonClick();
            setOpen(false);
          }}
        >
          <ListItemIcon>
            <AddIcon color="primary" />
          </ListItemIcon>
          <Typography>New</Typography>
        </MenuItem>
        <MenuItem
          aria-label="Import a family from a file"
          data-testid="import-family-button"
          onClick={() => {
            handleImportButtonClick();
            setOpen(false);
          }}
        >
          <ListItemIcon>
            <FileUploadIcon color="secondary" />
          </ListItemIcon>
          <Typography>Import</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

type RemoveFamilyButtonProps = {
  changesMade: boolean;
  onClick: () => any;
  "aria-label"?: string;
};

/**
 * Used for removing a family from the editor. Also displays when family has been edited
 */
const RemoveFamilyButton: React.FC<RemoveFamilyButtonProps> = ({
  changesMade,
  onClick,
  "aria-label": ariaLabel,
}) => {
  const [hovering, setHovering] = useState<boolean>(false);

  return (
    <Tooltip
      title={"Remove this family from the editor"}
      placement="bottom-start"
      arrow
      disableInteractive
    >
      <IconButton
        onClick={onClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        aria-label={ariaLabel}
      >
        {changesMade && !hovering ? <CircleIcon /> : <CloseIcon />}
      </IconButton>
    </Tooltip>
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

const DefaultView = function DefaultView() {
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
};

type ExtraGeneralInfoViewProps = {
  onDelete: () => any;
  onPublish: () => any;
};

export const GeneralInfoView = ({
  family,
  updateFamily,
  onDelete,
  onPublish,
}: ViewProps & ExtraGeneralInfoViewProps) => {
  const [name, setName] = useState<string>(family.name);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [description, setDescription] = useState<string>(family.description);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openPublishModal, setOpenPublishModal] = useState<boolean>(false);

  const handleSave = () => {
    if (name.length === 0) {
      setErrorMessage("Name must not be empty");
      setShowAlert(true);
      return;
    }
    setShowAlert(false);
    updateFamily({
      ...family,
      name: name,
      description: description,
    });
  };

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
          display: "flex",
          alignItems: "center",
          columnGap: "0.5rem",
        }}
      >
        <Typography color="textPrimary" variant="h6">
          General Info
        </Typography>
        <Tooltip title="Chemical reactions consist of reactants which create products during a certain phase. They can also be tuned with specific parameters given by the reaction type.">
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          columnGap: "1em",
        }}
      ></Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: "1.5em",
          paddingY: "2em",
          maxWidth: "50em",
        }}
      >
        <TextField
          label="Name"
          required
          data-testid="family-name-input-general-info"
          defaultValue={family.name}
          error={name.length === 0}
          onChange={(event) => {
            setName(event.target.value);
          }}
          onBlur={handleSave}
        />
        <TextField
          label="Description"
          required
          data-testid="family-description-input-general-info"
          defaultValue={family.description}
          multiline
          minRows={3}
          maxRows={5}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          onBlur={handleSave}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "start",
            columnGap: "3em",
            width: "100%",
          }}
        >
          {!family.isInDatabase && (
            <Button
              startIcon={<CloudUploadIcon />}
              color="secondary"
              variant="contained"
              onClick={() => setOpenPublishModal(true)}
            >
              Upload Family
            </Button>
          )}
          <Button
            startIcon={<DeleteForeverIcon />}
            color="error"
            variant="contained"
            onClick={() => setOpenDeleteModal(true)}
          >
            Delete Family
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={showAlert}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity="warning"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      <ConfirmActionModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onAction={() => {
          onDelete();
          setOpenDeleteModal(false);
        }}
        message="This will permanently delete the entire family! This includes any Species, Reactions, Phases, and Mechanisms associated with this family."
        subtitle="Are you sure you want to continue?"
        confirmColor="error"
      />
      <ConfirmActionModal
        open={openPublishModal}
        onClose={() => setOpenPublishModal(false)}
        onAction={() => {
          onPublish();
          setOpenPublishModal(false);
        }}
        message="This will make the family configuration publicly available."
        subtitle="Are you sure you want to continue?"
        confirmColor="secondary"
      />
    </Box>
  );
};


const EXCLUSIVE_OPTION_MESSAGE =
  "Only one of constant concentration, constant mixing ratio, or third body may be set.";

const exclusiveOptionPreProcess =
  (field: keyof Species) => (params: GridPreProcessEditCellProps) => {
    const candidate = { ...params.row, [field]: params.props.value };
    return {
      ...params.props,
      error: speciesExclusiveConflict(candidate)
        ? EXCLUSIVE_OPTION_MESSAGE
        : undefined,
    };
  };

// Edit cells that surface the mutual-exclusion error as a tooltip.
const ExclusiveNumberEditCell = (props: GridRenderEditCellParams) => {
  const { error } = props as unknown as { error?: string };
  return (
    <Tooltip open={Boolean(error)} title={error ?? ""} arrow placement="top">
      <GridEditInputCell {...props} />
    </Tooltip>
  );
};

const ExclusiveBooleanEditCell = (props: GridRenderEditCellParams) => {
  const { error } = props as unknown as { error?: string };
  return (
    <Tooltip open={Boolean(error)} title={error ?? ""} arrow placement="top">
      <GridEditBooleanCell {...props} />
    </Tooltip>
  );
};

export const SpeciesView = ({ family, updateFamily }: ViewProps) => {
  const { theme } = useCustomTheme();
  const [speciesEditorOpen, setSpeciesEditorOpen] = useState<boolean>(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();

  const handleSpeciesRowUpdate = (updatedSpecies: Species) => {
    updateFamily(applySpeciesRowUpdate(family, updatedSpecies));
    return updatedSpecies;
  };

  const createSpecies = () => {
    const frontendId: string = generateFrontendID();
    const species: Species = {
      description: "",
      familyId: family.id,
      id: frontendId,
      isDeleted: false,
      isInDatabase: false,
      isModified: false,
      name: "",
    };
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
    const existingIndex = speciesList.findIndex(
      (element) => element.id == species.id,
    );

    if (existingIndex >= 0) {
      speciesList[existingIndex] = { ...species, isModified: true };
    } else {
      speciesList.unshift({ ...species, isModified: true });
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
      editable: true,
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
      editable: true,
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
      field: "absoluteTolerance",
      headerName: "Absolute Tolerance [mol m-3]",
      editable: true,
      type: "number",
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
          {params.value ?? "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "constantConcentration",
      headerName: "Constant Concentration [mol m-3]",
      editable: true,
      type: "number",
      flex: 1,
      preProcessEditCellProps: exclusiveOptionPreProcess("constantConcentration"),
      renderEditCell: (params) => <ExclusiveNumberEditCell {...params} />,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
        >
          {params.value ?? "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "constantMixingRatio",
      headerName: "Constant Mixing Ratio [mol mol-1]",
      editable: true,
      type: "number",
      flex: 1,
      preProcessEditCellProps: exclusiveOptionPreProcess("constantMixingRatio"),
      renderEditCell: (params) => <ExclusiveNumberEditCell {...params} />,
      renderCell: (params: GridRenderCellParams<Family>) => (
        <Typography
          variant="body1"
          sx={{
            color: params.value
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
        >
          {params.value ?? "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "molecularWeight",
      headerName: "Molecular Weight [kg mol-1]",
      editable: true,
      type: "number",
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
          {params.value ?? "<Empty>"}
        </Typography>
      ),
    },
    {
      field: "isThirdBody",
      headerName: "Third Body (M)",
      editable: true,
      type: "boolean",
      flex: 1,
      preProcessEditCellProps: exclusiveOptionPreProcess("isThirdBody"),
      renderEditCell: (params) => <ExclusiveBooleanEditCell {...params} />,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          columnGap: "0.5rem",
        }}
      >
        <Typography color="textPrimary" variant="h6">
          Chemical Species
        </Typography>
        <Tooltip title="Chemical species are forms of a specific chemical entity. They can be named anything as long as it is clear what it represents. For example, a chemical species may be represented as either 'O3' or 'Ozone'.">
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <DataGrid
        getRowId={(row) => row.id}
        editMode="cell"
        processRowUpdate={handleSpeciesRowUpdate}
        initialState={{
          density: "compact",
          pagination: { paginationModel: { pageSize: 20 } },
          sorting: { sortModel: [{ field: "name", sort: "asc" }] },
        }}
        rows={family.species.filter((element) => !element.isDeleted)}
        columns={speciesColumns}
        pageSizeOptions={[5, 10, 20, 100]}
        disableRowSelectionOnClick
        disableVirtualization // Enables DataGrid to be rendered in testing
        sx={{
          flex: 1,
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
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
                <Tooltip title="Add species to family">
                  <Button
                    aria-label="Add species to family"
                    data-testid="add-species-button"
                    onClick={createSpecies}
                    color="primary"
                  >
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
        onClose={() => {
          setSpeciesEditorOpen(false);
          setSelectedSpecies(undefined);
        }}
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
    const frontendId: string = generateFrontendID();
    const reaction: Reaction = {
      id: frontendId,
      name: "",
      description: "",
      type: "ARRHENIUS",
      reactants: [],
      products: [],
      attributes: {},
      isModified: false,
      isDeleted: false,
      isInDatabase: false,
    };
    setSelectedReaction(reaction);
    setReactionsEditorOpen(true);
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
    const existingIndex = reactionList.findIndex(
      (element) => element.id === reaction.id,
    );

    if (existingIndex >= 0) {
      reactionList[existingIndex] = { ...reaction, isModified: true };
    } else {
      reactionList.unshift({ ...reaction, isModified: true });
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
      field: "id",
      headerName: "Equation",
      flex: 1,
      valueGetter: (id: string) =>
        reactionToString(
          family.reactions.find((e) => e.id == id),
          family.species,
        ),
      renderCell: (params: GridRenderCellParams<Reaction>) => (
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
      field: "name",
      headerName: "Name",
      type: "string",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Reaction>) => (
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
      renderCell: (params: GridRenderCellParams<Reaction>) => (
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
      renderCell: (params: GridRenderCellParams<Reaction>) => (
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
          display: "flex",
          alignItems: "center",
          columnGap: "0.5rem",
        }}
      >
        <Typography color="textPrimary" variant="h6">
          Chemical Reactions
        </Typography>
        <Tooltip title="Chemical reactions consist of reactants which create products during a certain phase. They can also be tuned with specific parameters given by the reaction type.">
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <DataGrid
        initialState={{
          density: "compact",
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        rows={family.reactions.filter((element) => !element.isDeleted)}
        columns={reactionsColumns}
        pageSizeOptions={[5, 10, 20, 100]}
        disableVirtualization
        sx={{
          flex: 1,
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
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
                <Tooltip title="Add reaction to family">
                  <Button
                    aria-label="Add Reaction"
                    data-testid="add-reaction-button"
                    onClick={createReaction}
                    color="primary"
                  >
                    <AddIcon />
                    <Typography variant="caption">Add Reaction</Typography>
                  </Button>
                </Tooltip>
              }
            />
          ),
        }}
      />
      <ReactionEditorModal
        open={reactionsEditorOpen}
        onClose={() => {
          setReactionsEditorOpen(false);
          setSelectedReaction(undefined);
        }}
        onUpdate={updateReaction}
        reaction={selectedReaction}
        family={family}
      />
    </Box>
  );
};

export const PhaseView = ({ family }: ViewProps) => {
  const { theme } = useCustomTheme();

  const phaseColumns: GridColDef[] = [
    {
      field: "name",
      flex: 1,
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
          display: "flex",
          alignItems: "center",
          columnGap: "0.5rem",
        }}
      >
        <Typography color="textPrimary" variant="h6">
          Phases
        </Typography>
        <Tooltip title="Species can be in multiple different phases in a model.">
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>
      <Typography>
        Phases are currently a work in progress. Everything is assumed to be in
        a gas phase.
      </Typography>
      <DataGrid
        initialState={{
          density: "compact",
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        rows={family.phases.filter((element) => !element.isDeleted)}
        columns={phaseColumns}
        pageSizeOptions={[5, 10, 20, 100]}
        disableVirtualization
        sx={{
          flex: 1,
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
          ".MuiDataGrid-columnHeaderTitle": {
            fontFamily: theme.typography.fontFamily,
          },
          ".MuiDataGrid-overlay": {
            fontFamily: theme.typography.fontFamily,
          },
        }}
        slots={{
          toolbar: () => <DataViewToolbar />,
        }}
      />
    </Box>
  );
};

export const MechanismsView = ({ family, updateFamily }: ViewProps) => {
  const [mechanismCreationModalOpen, setMechanismCreationModalOpen] =
    useState<boolean>(false);
  const [selectedMechanism, setSelectedMechanism] = useState<Mechanism | null>(
    null,
  );
  const [menuComponent, setMenuComponent] = useState<React.JSX.Element | null>(
    null,
  );

  const createMechanism = (mechanism: Mechanism) => {
    updateFamily({
      ...family,
      mechanisms: [
        {
          ...mechanism,
          familyId: family.id,
        },
        ...family.mechanisms,
      ],
    });
    setMechanismCreationModalOpen(false);
    setSelectedMechanism(mechanism);
  };

  const updateMechanism = (mechanism: Mechanism) => {
    updateFamily({
      ...family,
      mechanisms: family.mechanisms.map((element) => {
        if (element.id == mechanism.id) {
          return {
            ...mechanism,
            isModified: true,
          };
        }
        return element;
      }),
    });
    setSelectedMechanism(mechanism);
  };

  const getMenuComponent = (mechanism: Mechanism | null): React.JSX.Element => {
    if (!mechanism) {
      return (
        <MechanismBrowser
          family={family}
          onEditButtonClick={setSelectedMechanism}
        />
      );
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
  };

  useLayoutEffect(() => {
    console.log(selectedMechanism);
    const component = getMenuComponent(selectedMechanism);
    setMenuComponent(component);
  }, [selectedMechanism, family]);

  useLayoutEffect(() => {
    setSelectedMechanism(null);
  }, [family]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          columnGap: "0.5rem",
        }}
      >
        <Typography color="textPrimary" variant="h6">
          Mechanisms
        </Typography>
        <Tooltip title="Mechanisms contain a subset of a family's entities. They represent an analytical model in a specific family.">
          <HelpOutlineIcon fontSize="small" />
        </Tooltip>
      </Box>

      {!selectedMechanism && (
        <Tooltip title="Create a new chemical mechanism">
          <Button
            aria-label="Create a new mechanism"
            data-testid="create-mechanism-button"
            onClick={() => setMechanismCreationModalOpen(true)}
            startIcon={<AddIcon />}
            color="primary"
          >
            <Typography variant="caption">Create New Mechanism</Typography>
          </Button>
        </Tooltip>
      )}
      {menuComponent}
      <MechanismCreationModal
        open={mechanismCreationModalOpen}
        onClose={() => setMechanismCreationModalOpen(false)}
        onSubmit={createMechanism}
      />
    </Box>
  );
};

export default FamilyPage;
