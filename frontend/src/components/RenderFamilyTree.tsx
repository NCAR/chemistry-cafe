import React, { useEffect, useState, useRef } from "react";

import { Family, Mechanism } from "../API/API_Interfaces";
import {
  downloadOAYAML,
  downloadOAJSON,
  downloadOAMusicbox,
  getFamilies,
  getMechanismsByFamilyId,
} from "../API/API_GetMethods";
import { deleteFamily, deleteMechanism } from "../API/API_DeleteMethods";

import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

import IconButton from "@mui/material/IconButton";
import { Add, GetApp, Delete, Edit } from "@mui/icons-material";

import CircularProgress from "@mui/material/CircularProgress";

import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import { handleActionWithDialog, UpdateFamilyModal, UpdateMechanismModal } from "./Modals";
import Dialog from "@mui/material/Dialog";
import { DialogActions, DialogTitle } from "@mui/material";

const treeItemStyle = {
  fontSize: "1.2rem",
  backgroundColor: "#f0f0f0",
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "8px 12px",
  margin: "4px",
  cursor: "pointer",
  boxShadow: "3",
};

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
};
const stickyHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "sticky",
  top: 0,
  backgroundColor: "#f0f0f0",
  zIndex: 1,
  padding: "10px",
  borderBottom: "1px solid #ccc",
};
const treeViewContainerStyle = {
  overflow: "auto",
  flexGrow: 1,
};

interface RenderFamilyTreeProps {
  setSelectedFamily: React.Dispatch<React.SetStateAction<Family | null>>;
  setSelectedMechanism: React.Dispatch<React.SetStateAction<Mechanism | null>>;
  setSelectedFamilyId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedMechanismId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedMechanismName: React.Dispatch<React.SetStateAction<string | null>>;
  handleCreateFamilyOpen: () => void;
  handleCreateMechanismOpen: () => void;
  selectedFamily: Family | null;
  selectedMechanism: Mechanism | null;
  selectedFamilyId: string | null;
  createdFamilyBool: boolean;
  setCreatedFamilyBool: React.Dispatch<React.SetStateAction<boolean>>;
  createdMechanismBool: boolean;
  setCreatedMechanismBool: React.Dispatch<React.SetStateAction<boolean>>;

  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteType: string;
  setDeleteType: React.Dispatch<React.SetStateAction<string>>;
  itemForDeletionID : string | null;
  setItemForDeletionID: React.Dispatch<React.SetStateAction<string | null>>;
  handleDeleteDialogOpen: () => void;
  handleDeleteDialogClose: () => void;
}

const RenderFamilyTree: React.FC<RenderFamilyTreeProps> = ({
  selectedMechanism,
  setSelectedMechanism,
  selectedFamily,
  setSelectedFamily,
  setSelectedFamilyId,
  setSelectedMechanismId,
  setSelectedMechanismName,
  handleCreateFamilyOpen,
  handleCreateMechanismOpen,
  createdFamilyBool,
  setCreatedFamilyBool,
  createdMechanismBool,
  setCreatedMechanismBool,

  deleteDialogOpen,
  setDeleteDialogOpen,
  deleteType,
  setDeleteType,
  itemForDeletionID,
  setItemForDeletionID,
  handleDeleteDialogClose,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const [families, setFamilies] = useState<Family[]>([]);
  const [mechanismsMap, setMechanismsMap] = useState<
    Record<string, Mechanism[]>
  >({});

  const [loading, setLoading] = useState<boolean>(true);

  const [deleteBool, setDeleteBool] = useState<boolean>(false);
  const [updateFamilyOpen, setUpdateFamilyOpen] = useState<boolean>(false);
  const [updateMechanismOpen, setUpdateMechanismOpen] = useState<boolean>(false);
  const handleUpdateMechanismOpen = () => setUpdateMechanismOpen(true);
  const handleUpdateMechanismClose = () => setUpdateMechanismOpen(false);
  const handleUpdateFamilyOpen = () => setUpdateFamilyOpen(true);
  const handleUpdateFamilyClose = () => setUpdateFamilyOpen(false);

  // const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  // const handleDeleteDialogOpen = () => setDeleteDialogOpen(true);
  // const handleDeleteDialogClose = () => setDeleteDialogOpen(false);

  // const [deleteType, setDeleteType] = useState<string>('');

  // // contains id of item that will be deleted by delete dialog
  // const [itemForDeletionID, setItemForDeletionID] = React.useState<string | null>(null);


  const ref = useRef<string | null>(null);

  /* Popover for Downloads */
  const [popOver, setPopOver] = useState<HTMLButtonElement | null>(null);
  const handlePopOverClose = () => {
    setPopOver(null);
  };
  const popOverOpen = Boolean(popOver);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedFamilies = await getFamilies();
        setFamilies(fetchedFamilies);
        setLoading(false);

        const mechanismsPromises = fetchedFamilies.map((family) =>
          getMechanismsByFamilyId(family.id!),
        );
        const mechanismsArray = await Promise.all(mechanismsPromises);
        const mechanismsMap: Record<string, Mechanism[]> = {};
        fetchedFamilies.forEach((family, index) => {
          if (family.id) {
            mechanismsMap[family.id] = mechanismsArray[index];
          } else {
            throw Error("Missing id for family " + family.name);
          }
        });
        setMechanismsMap(mechanismsMap);
        setCreatedFamilyBool(false);
        setCreatedMechanismBool(false);
        setDeleteBool(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [createdFamilyBool, createdMechanismBool, deleteBool]);

  const handleDownloadClick = async (mechanismId: string, format: string) => {
    const link = document.createElement("a");
    let blobUrl = "";
    if (format === "JSON") {
      const body = await downloadOAJSON(mechanismId);
      const blob = new Blob([body], { type: "application/json" });
      blobUrl = window.URL.createObjectURL(blob);
      link.download = "openAtmos.json";
    } else if (format === "YAML") {
      const body = await downloadOAYAML(mechanismId);
      const blob = new Blob([body], { type: "application/json" });
      blobUrl = window.URL.createObjectURL(blob);
      link.download = "openAtmos.yaml";
    } else if (format === "Musicbox") {
      const body = await downloadOAMusicbox(mechanismId);
      const blob = new Blob([body], { type: "application/zip" });
      blobUrl = window.URL.createObjectURL(blob);
      link.download = "musicbox.zip";
    }

    link.href = blobUrl;

    link.click();

    window.URL.revokeObjectURL(blobUrl);
  };

  const handlePopOverClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    mechanismId: string,
  ) => {
    ref.current = mechanismId;
    setPopOver(event.currentTarget);
  };

  const handleItemExpansionToggle = (
    _event: React.SyntheticEvent<{}>,
    itemId: string,
    isExpanded: boolean,
  ) => {
    setExpandedItems((prevExpandedItems) => {
      if (isExpanded) {
        return [...prevExpandedItems, itemId];
      } else {
        return prevExpandedItems.filter((id) => id !== itemId);
      }
    });
  };



  const handleFamilyDelete = (familyId: string) => {
    setDeleteType("Family");
    setItemForDeletionID(familyId);
    console.log("Updated deleteType:", deleteType);
    console.log("Updated itemForDeletionID:", itemForDeletionID);
    setDeleteDialogOpen(true);
  };

  const handleMechanismDelete = (mechanismId: string) => {
    setDeleteType("Mechanism");
    setItemForDeletionID(mechanismId);
    setDeleteDialogOpen(true);

  };

  const handleFamilyUpdated = (updatedFamily: Family) => {
    setFamilies((prevFamilies) =>
      prevFamilies.map((family) =>
        family.id === updatedFamily.id ? updatedFamily : family
      )
    );
  };

  const handleMechanismUpdated = (updatedMechanism: Mechanism) => {
    setMechanismsMap((prevMechanismsMap) => {
      const updatedMap = { ...prevMechanismsMap };
  
      // find family with updated mechanism
      for (const familyId in updatedMap) {
        const mechanisms = updatedMap[familyId];
        const mechanismIndex = mechanisms.findIndex(
          (mech) => mech.id === updatedMechanism.id
        );
  
        if (mechanismIndex !== -1) {
          // update mechanism 
          const updatedMechanisms = [...mechanisms];
          updatedMechanisms[mechanismIndex] = updatedMechanism;
  
          updatedMap[familyId] = updatedMechanisms;
          break;
        }
      }
  
      return updatedMap;
    });
  };
  



  return (
    <div style={containerStyle}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <div style={stickyHeaderStyle}>
            <h2 style={{ textAlign: "center", margin: "0" }}>Families</h2>
            <IconButton
              onClick={handleCreateFamilyOpen}
              aria-label="create family"
              style={{ color: "blue", margin: "5px" }}
            >
              <Add sx={{ fontSize: 32, fontWeight: "bold" }} />
            </IconButton>
          </div>
          <div style={treeViewContainerStyle}>
            <SimpleTreeView
              expandedItems={expandedItems}
              onItemExpansionToggle={handleItemExpansionToggle}
            >
              {families.map((family) => (
                <TreeItem
                  key={family.id}
                  itemId={family.id!}
                  label={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{family.name}</span>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: 80,
                        }}
                      >
                        <IconButton
                          onClick={() => {

                            setSelectedFamily(family);
                            handleUpdateFamilyOpen();
                            console.log(selectedFamily);
                          }}
                          aria-label="edit"
                          edge="start"
                        >
                          <Edit/>
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            handleFamilyDelete(family.id!);
                          }}
                          aria-label="delete"
                          style={{ color: "red" }}
                          edge="start"
                        >
                          <Delete />
                        </IconButton>
                      </div>
                    </div>
                  }
                  sx={treeItemStyle}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <h6 style={{ textAlign: "left", margin: "0" }}>
                      Mechanisms
                    </h6>
                    <IconButton
                      onClick={() => {
                        setSelectedFamilyId(family.id!);
                        handleCreateMechanismOpen();
                      }}
                      aria-label="create mechanism"
                      style={{ color: "blue", margin: "5px" }}
                    >
                      <Add sx={{ fontSize: 32, fontWeight: "bold" }} />
                    </IconButton>
                  </div>
                  {mechanismsMap[family.id!]?.map((mechanism) => (
                    <TreeItem
                      key={mechanism.id}
                      itemId={`mechanism-${mechanism.id}`}
                      label={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>{mechanism.name}</span>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: 80,
                            }}
                          >
                            <IconButton
                              onClick={() => {

                                setSelectedMechanism(mechanism);
                                handleUpdateMechanismOpen();
                                console.log(selectedMechanism);
                              }}
                              aria-label="edit"
                              edge="start">
                              <Edit/>
                            </IconButton>

                            <IconButton
                              onClick={(event) => {
                                handlePopOverClick(event, mechanism.id!);
                              }}
                              aria-label="download"
                              style={{ color: "green" }}
                            >
                              <GetApp />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                handleMechanismDelete(mechanism.id!);
                              }}
                              aria-label="delete"
                              style={{ color: "red" }}
                              edge="start"
                            >
                              <Delete />
                            </IconButton>
                            <Popover
                              open={popOverOpen}
                              anchorEl={popOver}
                              onClose={handlePopOverClose}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                              }}
                            >
                              <Button
                                onClick={() => {
                                  if (ref.current !== null) {
                                    handleDownloadClick(ref.current, "YAML");
                                  }
                                }}
                              >
                                YAML
                              </Button>
                              <Button
                                onClick={() => {
                                  if (ref.current !== null) {
                                    handleDownloadClick(ref.current, "JSON");
                                  }
                                }}
                              >
                                JSON
                              </Button>
                              <Button
                                onClick={() => {
                                  if (ref.current !== null) {
                                    handleDownloadClick(
                                      ref.current,
                                      "Musicbox",
                                    );
                                  }
                                }}
                              >
                                MusicBox
                              </Button>
                            </Popover>
                          </div>
                        </div>
                      }
                      sx={treeItemStyle}
                      onClick={() => {
                        setSelectedFamilyId(family.id!);
                        setSelectedMechanismId(mechanism.id!);
                        setSelectedMechanismName(mechanism.name!);
                      }}
                    />
                  ))}
                </TreeItem>
              ))}
            </SimpleTreeView>
          </div>
        </>
      )}

    <UpdateFamilyModal
    open={updateFamilyOpen}
    onClose={handleUpdateFamilyClose}
    selectedFamily={selectedFamily}
    onFamilyUpdated={handleFamilyUpdated}
    />
    <UpdateMechanismModal 
    open={updateMechanismOpen}
    onClose={handleUpdateMechanismClose}
    selectedMechanism={selectedMechanism}
    onMechanismUpdated={handleMechanismUpdated}
    />

    {/* this is to ensure this dialog only renders in the correct cases instead
    of the one in RenderFamilyTree */}
    {  (deleteType === "Mechanism" || deleteType === "Family") && 
    <Dialog 
    open={deleteDialogOpen}
    onClose={handleDeleteDialogClose}>
      <DialogTitle>
        {`Are you sure you want to delete this?`}
      </DialogTitle>

      <DialogActions>
        <Button onClick={handleDeleteDialogClose}>No</Button>
        

        {/* what we are deleting changes based on deleteType */}
        {(deleteType === "Mechanism") &&
          <Button onClick={() => handleActionWithDialog({
            deleteType: deleteType,
            action: deleteMechanism, id: itemForDeletionID!, 
            onClose: handleDeleteDialogClose, setBool: setDeleteBool,
            setSelectedMechanism: setSelectedMechanism,
            setSelectedMechanismId: setSelectedMechanismId,
            setSelectedMechanismName: setSelectedMechanismName
          })
          }>Yes</Button>
        }

        {(deleteType === "Family") &&
          <Button onClick={() => handleActionWithDialog({
            deleteType: deleteType,
            action: deleteFamily, id: itemForDeletionID!, 
            onClose: handleDeleteDialogClose, setBool: setDeleteBool
            })
          }>Yes</Button>
        }
      </DialogActions>
    </Dialog>
    }
    </div>
  );
};

export default RenderFamilyTree;
