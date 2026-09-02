import { useEffect, useRef, useState, MouseEvent } from "react";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/FamilyEditor.css";
import {
  alpha,
  Box,
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
import CloseIcon from "@mui/icons-material/Close";
import CircleIcon from "@mui/icons-material/Circle";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { Family } from "../types/chemistryModels";
import { useCustomTheme } from "../components/CustomThemeContext";
import {
  FamilyCreationModal,
  ImportFamilyModal,
} from "../components/FamilyEditorModals";
import { UUID } from "crypto";
import { getFamily } from "../API/API_GetMethods";
import {
  apiToFrontendFamily,
  saveFamilyChanges,
  uploadFamily,
} from "../helpers/backendInteractions";
import SaveIcon from "@mui/icons-material/Save";
import { useAuth } from "../components/AuthContext";
import { deleteFamily } from "../API/API_DeleteMethods";
import { APIFamily } from "../API/API_Interfaces";
import { updateLocalStorageFamilyInfo } from "../helpers/localFamilies";
import { GeneralInfoView } from "../components/familyEditor/GeneralInfoView";
import { MechanismsView } from "../components/familyEditor/MechanismsView";
import { PhaseView } from "../components/familyEditor/PhaseView";
import { ReactionsView } from "../components/familyEditor/ReactionsView";
import { SpeciesView } from "../components/familyEditor/SpeciesView";

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
                      label={`Species (${family.species.length})`}
                      aria-label="Open Species Editor"
                      data-testid={`${family.id}-species-tree-button`}
                    />
                    <TreeItem
                      itemId={`${family.id};${DataViewSelection.Reactions}`}
                      label={`Reactions (${family.reactions.length})`}
                      aria-label="Open Reactions Editor"
                      data-testid={`${family.id}-reactions-tree-button`}
                    />
                    <TreeItem
                      itemId={`${family.id};${DataViewSelection.Phases}`}
                      label={`Phases (${family.phases.length})`}
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

export {
  GeneralInfoView,
  MechanismsView,
  PhaseView,
  ReactionsView,
  SpeciesView,
};

export default FamilyPage;
