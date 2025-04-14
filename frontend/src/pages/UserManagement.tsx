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
} from "@mui/x-data-grid";

import { Header, Footer } from "../components/HeaderFooter";

import "../styles/UserManagement.css";
//import { useAuth } from "../contexts/AuthContext"; // Import the AuthContext
import { getAllUsers } from "../API/API_GetMethods";
import { APIUser } from "../API/API_Interfaces";
import { updateUser } from "../API/API_UpdateMethods";
import { deleteUser } from "../API/API_DeleteMethods";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { Button } from "@mui/material";

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
  const processRowUpdate = async (updatedUser: GridRowModel) => {
    console.log("Updating row:", updatedUser);
    try {
      // @ts-ignore
      // tslint:disable-next-line:no-unused-variable
      const response = await updateUser(updatedUser as APIUser); // Ensure updatedUser.id is a string
      // if no error, assume it is fine
      return updatedUser;
    } catch (error) {
      console.error("Error updating user: ", error);
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
      editable: false,
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
      valueOptions: ["unverified", "verified", "admin"],
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
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
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
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
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
      <section className="content-user-management">
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
          onProcessRowUpdateError={(error) => console.log(error)}
          slots={{
            toolbar: RolesToolbar,
            footer: CustomDataGridFooter,
          }}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 20,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </section>
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
