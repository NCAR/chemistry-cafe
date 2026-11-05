import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  DataGrid,
  GridColDef,
  GridToolbarQuickFilter,
  GridActionsCellItem,
  GridRowModesModel,
  GridRowModes,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridEventListener,
  GridFooterContainer,
  GridFooter,
  GridPreProcessEditCellProps,
} from "@mui/x-data-grid";
import axios from "axios";

import { Header, Footer } from "../components/HeaderFooter";

import "../styles/UserManagement.css";
//import { useAuth } from "../contexts/AuthContext"; // Import the AuthContext
import { getAllUsers, checkUsernameAvailability } from "../API/API_GetMethods";
import { APIUser } from "../API/API_Interfaces";
import { updateUser } from "../API/API_UpdateMethods";
import { deleteUser } from "../API/API_DeleteMethods";
import { validateUsernameFormat } from "../helpers/userValidation";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { Alert, Button, Paper } from "@mui/material";

function RolesToolbar() {
  return (
    <Box
      sx={{
        p: 0.5,
        pb: 0,
      }}
    >
      <GridToolbarQuickFilter />
    </Box>
  );
}

function CustomDataGridFooter() {
  return (
    <GridFooterContainer>
      <GridFooter
        sx={{
          border: "none",
          "& .MuiTablePagination-displayedRows": {
            marginBottom: 0,
          },
          "& .MuiTablePagination-selectLabel": {
            marginBottom: 0,
          },
        }}
      />
    </GridFooterContainer>
  );
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<APIUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(
    null,
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const handleDeleteDialogClose = () => setDeleteDialogOpen(false);

  // contains id of item that will be deleted by delete dialog
  const [itemForDeletionID, setItemForDeletionID] = React.useState<
    string | null
  >(null);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {},
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Handling editing actions
  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setItemForDeletionID(id as string);
    setDeleteDialogOpen(true);
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  // This function handles syncing edits with the database
  // Note: this does not handle syncing deleting from DB: see handleDeleteClick
  const processRowUpdate = async (
    updatedUser: GridRowModel,
    originalUser: GridRowModel,
  ) => {
    console.log("Updating row:", updatedUser);
    const updated = updatedUser as APIUser;
    const original = originalUser as APIUser;

    if (updated.username !== original.username) {
      const trimmed = updated.username?.trim() || "";
      const formatCheck = validateUsernameFormat(trimmed);
      if (!formatCheck.valid) {
        const msg = formatCheck.message || "Invalid username format";
        setUpdateErrorMessage(msg);
        throw new Error(msg);
      }
      const availability = await checkUsernameAvailability(trimmed, updated.id);
      if (!availability.available) {
        const msg = availability.message || "Username is already taken";
        setUpdateErrorMessage(msg);
        throw new Error(msg);
      }
      updated.username = trimmed;
    }

    try {
      await updateUser(updated);
      setUpdateErrorMessage(null);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === updated.id ? updated : u)),
      );
      return updated;
    } catch (error: unknown) {
      console.error("Error updating user: ", error);
      let msg = "Error updating user";
      if (axios.isAxiosError(error)) {
        if (typeof error.response?.data === "string") {
          msg = error.response.data;
        } else if (error.response?.data?.message) {
          msg = error.response.data.message;
        }
      }
      setUpdateErrorMessage(msg);
      throw error;
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  // Defining columns displayed
  const userColumns: GridColDef[] = [
    {
      field: "username",
      headerName: "Username",
      width: 200,
      editable: true,
      preProcessEditCellProps: async (params: GridPreProcessEditCellProps) => {
        const newUsername = (params.props.value as string)?.trim() || "";
        const originalUser = users.find((u) => u.id === params.id);
        if (originalUser && newUsername === originalUser.username) {
          return { ...params.props, error: false };
        }
        const formatCheck = validateUsernameFormat(newUsername);
        if (!formatCheck.valid) {
          return { ...params.props, error: formatCheck.message };
        }
        const availability = await checkUsernameAvailability(
          newUsername,
          params.id as string,
        );
        return {
          ...params.props,
          error: availability.available ? false : availability.message,
        };
      },
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
      editable: false,
    },
    {
      field: "role",
      headerName: "Role",
      width: 150,
      editable: true,
      type: "singleSelect",
      valueOptions: ["None", "Verifier", "Admin"],
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      headerClassName: "roleDataHeader",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <div className="layout-user-management">
      <header>
        <Header />
      </header>
      <Paper square component="main" className="content-user-management">
        {updateErrorMessage && (
          <Alert
            severity="error"
            onClose={() => setUpdateErrorMessage(null)}
            sx={{ m: 1 }}
          >
            {updateErrorMessage}
          </Alert>
        )}
        <DataGrid
          rows={users}
          columns={userColumns}
          style={{ flex: 1 }}
          // Specifying the primary key to track each entry by
          getRowId={(row) => row.id}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(err) => {
            if (err instanceof Error) {
              setUpdateErrorMessage(err.message);
            }
          }}
          slots={{
            toolbar: RolesToolbar,
            footer: CustomDataGridFooter,
          }}
          disableRowSelectionOnClick
          disableVirtualization
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 20,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </Paper>
      <footer>
        <Footer />
      </footer>
      {
        <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
          <DialogTitle>{`Are you sure you want to delete this?`}</DialogTitle>

          <DialogActions>
            <Button onClick={handleDeleteDialogClose}>No</Button>

            {
              <Button
                onClick={async () => {
                  if (!itemForDeletionID) {
                    setDeleteDialogOpen(false);
                    return;
                  }
                  await deleteUser(itemForDeletionID);
                  setDeleteDialogOpen(false);
                  setUsers((prevUsers) =>
                    prevUsers.filter((user) => user.id !== itemForDeletionID),
                  );
                }}
              >
                Yes
              </Button>
            }
          </DialogActions>
        </Dialog>
      }
    </div>
  );
};

export default UserManagement;
