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
} from "@mui/x-data-grid";

import { Header, Footer } from "../components/HeaderFooter";

import "../styles/roles.css";
//import { useAuth } from "../contexts/AuthContext"; // Import the AuthContext
import { getUsers } from "../API/API_GetMethods";
import { User } from "../API/API_Interfaces";
import { updateUser } from "../API/API_UpdateMethods";
import { deleteUser } from "../API/API_DeleteMethods";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { Button } from "@mui/material";
import { handleActionWithDialog } from "../components/Modals";

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

const RoleManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>(
    {},
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const handleDeleteDialogClose = () => setDeleteDialogOpen(false);

  const [deleteType, setDeleteType] = useState<string>("");

  // contains id of item that will be deleted by delete dialog
  const [itemForDeletionID, setItemForDeletionID] = React.useState<
    string | null
  >(null);
  // const [search, setSearch] = useState<string>(""); // State for search input
  // const [roleFilter, setRoleFilter] = useState<string>("all"); // State for role filter

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {},
  );

  // Fetch the current logged-in user from the AuthContext
  //  const { user: loggedInUser } = useAuth(); // Access the logged-in user

  // Fetch users from the backend when the component mounts
  useEffect(() => {
    console.log("Selected Roles:", selectedRoles); // Temporary logging
  }, [selectedRoles]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response);
        // Initialize selectedRoles with each user's current role
        const initialRoles = response.reduce(
          (acc, user) => {
            if (user.id) {
              acc[user.id] = user.role;
            }
            return acc;
          },
          {} as { [key: string]: string },
        );
        setSelectedRoles(initialRoles);
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
    setDeleteType("User");
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
      const response = await updateUser(
        updatedUser.id as string,
        updatedUser as User,
      ); // Ensure updatedUser.id is a string
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
    <div className="totalPage">
      <div className="headerBar">
        <Header></Header>
      </div>
      <div className="mainContent">
        <div className="userDataGrid">
          <DataGrid
            rows={users}
            columns={userColumns}
            // Specifying the primary key to track each entry by
            getRowId={(row) => row.id}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={(error) => console.log(error)}
            slots={{ toolbar: RolesToolbar }}
          />
        </div>
      </div>

      <div className="footerBar">
        <Footer></Footer>
      </div>

      {deleteType === "User" && (
        <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
          <DialogTitle>{`Are you sure you want to delete this?`}</DialogTitle>

          <DialogActions>
            <Button onClick={handleDeleteDialogClose}>No</Button>

            {/* what we are deleting changes based on deleteType */}
            {deleteType === "User" && (
              <Button
                onClick={() =>
                  handleActionWithDialog({
                    deleteType: deleteType,
                    action: deleteUser,
                    id: itemForDeletionID!,
                    onClose: handleDeleteDialogClose,
                    setUsers: setUsers,
                  })
                }
              >
                Yes
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default RoleManagement;
