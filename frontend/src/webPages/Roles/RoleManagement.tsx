import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { DataGrid, GridRowParams, GridColDef, GridToolbar, GridToolbarContainer, 
  GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, 
  GridToolbarExport, GridRowsProp, GridToolbarQuickFilter, 
  GridActionsCellItem, GridRowModesModel, 
  GridRowModes, GridRowId, GridRowModel, GridRowEditStopReasons,  
  GridEventListener} from '@mui/x-data-grid';


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
  const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({});
  const [search, setSearch] = useState<string>(''); // State for search input
  const [roleFilter, setRoleFilter] = useState<string>('all'); // State for role filter

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

  const handleRoleChange = (uuid: string, newRole: string) => {
    setSelectedRoles((prevRoles) => ({
      ...prevRoles,
      [uuid]: newRole,
    }));
  };

  const updateRole = async (uuid: string) => {
    try {
      const user = users.find((u) => u.uuid === uuid);
      if (!user) return;

      const updatedUser = {
        ...user,
        role: selectedRoles[uuid],
      };

      await axios.put(`http://localhost:8080/api/User/update`, updatedUser);
      alert('Role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.log_in_info.toLowerCase().includes(search.toLowerCase()) &&
    (roleFilter === 'all' || user.role === roleFilter)
  );

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

  const handleDeleteClick = (id: GridRowId) => () => {
    setUsers(users.filter((row) => row.uuid !== id));
  };

  const handleCancelClick = (uuid: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [uuid]: { mode: GridRowModes.View, ignoreModifications: true },
    });

  const editedRow = users.find((row) => row.uuid === uuid);
  };


  // This function handles syncing changes with database 
  const processRowUpdate = async (updatedUser: GridRowModel) => {
      let uuidTemp = updatedUser.uuid
      try {
        const user: User | undefined = users.find((u) => u.uuid === uuidTemp);
        if (!user) {console.log("user did not exist")
          return updatedUser};


        console.log(updatedUser)
  
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
      width: 250,
      editable: false
    },

    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['unverified', 'verified', 'admin']
    },

    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
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
    <div>
      {/* test div britt */}
      <div>
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
      <h1>Role Management</h1>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search by email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '200px' }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '5px' }}
        >
          <option value="all">All</option>
          <option value="unverified">Unverified</option>
          <option value="verified">Verified</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.uuid}>
              <td>{user.log_in_info}</td>
              <td>
                <select
                  value={selectedRoles[user.uuid]}
                  onChange={(e) => handleRoleChange(user.uuid, e.target.value)}
                >
                  <option value="unverified">Unverified</option>
                  <option value="verified">Verified</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <button onClick={() => updateRole(user.uuid)}>Update Role</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoleManagement;
