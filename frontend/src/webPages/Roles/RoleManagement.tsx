import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { DataGrid, GridToolbarQuickFilter, 
  GridActionsCellItem, GridRowModesModel, 
  GridRowModes, GridRowId, GridRowModel, GridRowEditStopReasons,  
  GridEventListener} from '@mui/x-data-grid';

import { Header, Footer } from '../Components/HeaderFooter';

import "./roles.css";



interface User {
  uuid: string;
  log_in_info: string;
  role: string;
}

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

const Roles = ['Unverified', 'Verified', 'Admin'];



const RoleManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ setSelectedRoles] = useState<{ [key: string]: string }>({});
  // const [search ] = useState<string>(''); // State for search input
  // const [roleFilter ] = useState<string>('all'); // State for role filter

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});




  // Fetch users from the backend when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>('http://localhost:8080/api/User/all');
        setUsers(response.data);
        // Initialize selectedRoles with each user's current role
        const initialRoles = response.data.reduce((acc, user) => {
          acc[user.uuid] = user.role;
          return acc;
        }, {} as { [key: string]: string });
        setSelectedRoles(initialRoles);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // const handleRoleChange = (uuid: string, newRole: string) => {
  //   setSelectedRoles((prevRoles) => ({
  //     ...prevRoles,
  //     [uuid]: newRole,
  //   }));
  // };

  // const updateRole = async (uuid: string) => {
  //   try {
  //     const user = users.find((u) => u.uuid === uuid);
  //     if (!user) return;

  //     const updatedUser = {
  //       ...user,
  //       role: selectedRoles[uuid],
  //     };
  //     alert(updatedUser.role)
  //     const r = await axios.put(`http://localhost:8080/api/User/update`, updatedUser);
  //     alert(r.status)
  //     alert('Role updated successfully!');
  //   } catch (error) {
  //     console.error('Error updating role:', error);
  //     alert('Failed to update role');
  //   }
  // };

  // const deleteUser = async (uuid: string) => {
  //   try {
  //     await axios.delete(`http://localhost:8080/api/User/delete/${uuid}`);
  //     // Remove the deleted user from the state
  //     setUsers((prevUsers) => prevUsers.filter((user) => user.uuid !== uuid));
  //     alert('User deleted successfully!');
  //   } catch (error) {
  //     console.error('Error deleting user:', error);
  //     alert('Failed to delete user: ' + error);
  //   }
  // };

  // const filteredUsers = users.filter((user) =>
  //   user.log_in_info.toLowerCase().includes(search.toLowerCase()) &&
  //   (roleFilter === 'all' || user.role === roleFilter)
  // );

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  //  handling editing actions
  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
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

  const handleDeleteClick = (uuid: GridRowId) => async () => {
    try {
      await axios.delete(`http://localhost:8080/api/User/delete/${uuid}`);
      // Remove the deleted user from the state
      setUsers((prevUsers) => prevUsers.filter((user) => user.uuid !== uuid));
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error);
    }

    
  };

  const handleCancelClick = (uuid: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [uuid]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };


  // This function handles syncing edits with database 
  // Note: this does not handle syncing deleting from DB: see handleDeleteClick
  const processRowUpdate = async (updatedUser: GridRowModel) => {
      let uuidTemp = updatedUser.uuid
      try {
        const user: User | undefined = users.find((u) => u.uuid === uuidTemp);
        if (!user) {console.log("user did not exist")
          return updatedUser};

  
        await axios.put(`http://localhost:8080/api/User/update`, updatedUser);
        alert('Role updated successfully!');
        return updatedUser;

      } catch (error) {
        console.error('Error updating role:', error);
        alert('Failed to update role');
      }
    }

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  // defining columns displayed
  const userColumns: GridColDef[] = [
    {
      field: 'log_in_info',
      headerName: 'Email',
      headerClassName: 'roleDataHeader',
      width: 250,
      editable: false
    },

    {
      field: 'role',
      headerName: 'Role',
      headerClassName: 'roleDataHeader',
      width: 150,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['unverified', 'verified', 'admin']
    },

    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      headerClassName: 'roleDataHeader',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {

        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
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
      }
    }

  
  ];


  return (
    <div className='totalPage'>
      <div className='headerBar'>
        <Header></Header>
      </div>
      <div className='mainContent'>
        <div className='userDataGrid'>
          <DataGrid
            rows={users}
            columns={userColumns}
            // specifying the primary key to track each entry by
            getRowId={(row) => row.uuid}
            editMode='row'
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={(error) => console.log(error)}
            slots={{ toolbar: RolesToolbar }}
          />
        </div>
      </div>

      <div className='footerBar'>
        <Footer></Footer>
      </div>
    </div>
  );
};

export default RoleManagement;
