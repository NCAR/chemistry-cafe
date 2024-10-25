import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Import the AuthContext

interface User {
  uuid: string;
  log_in_info: string;
  role: string;
}

const RoleManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({});
  const [search, setSearch] = useState<string>(''); // State for search input
  const [roleFilter, setRoleFilter] = useState<string>('all'); // State for role filter

  // Fetch the current logged-in user from the AuthContext
  const { user: loggedInUser } = useAuth(); // Access the logged-in user

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
      alert(updatedUser.role)
      const r = await axios.put(`http://localhost:8080/api/User/update`, updatedUser);
      alert(r.status)
      alert('Role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const deleteUser = async (uuid: string) => {
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

  return (
    <div>
      <h1>Role Management</h1>

      {/* Display the current logged-in user's information */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
        <h2>Logged-in User Information</h2>
        {loggedInUser ? (
          <div>
            <p><strong>UUID:</strong> {loggedInUser.uuid}</p>
            <p><strong>Email:</strong> {loggedInUser.log_in_info}</p>
            <p><strong>Role:</strong> {loggedInUser.role}</p>
          </div>
        ) : (
          <p>No user is logged in</p>
        )}
      </div>

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
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this user?')) {
                      deleteUser(user.uuid);
                    }
                  }}
                  style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
                >
                  Delete User
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoleManagement;
