import { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Footer } from '../Components/HeaderFooter';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'unverified' | 'verified' | 'admin'; // Define the possible roles
}

const RoleManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    
    const handleRoleModalOpen = (user: User) => {
        setSelectedUser(user);
        setRoleModalOpen(true);
    };

    const handleRoleModalClose = () => {
        setSelectedUser(null);
        setRoleModalOpen(false);
    };

    // Fetch users from the backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get<User[]>('http://localhost:5173/api/User/all'); // Adjust the endpoint as needed
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    // Update user role
    const updateUserRole = async (userId: string, newRole: 'unverified' | 'verified' | 'admin') => {
        try {
            await axios.patch(`/api/users/${userId}`, { role: newRole }); // Adjust the endpoint as needed
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
            handleRoleModalClose();
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <section>
            <Box sx={{ width: '100%', maxWidth: 700, mb: 4 }}>
                <Typography variant="h2" sx={{ color: 'black' }}>
                    Role Management
                </Typography>
            </Box>
            
            <div>
                {users.map(user => (
                    <Box key={user.id} sx={{ bgcolor: '#C3D7EE', padding: 2, marginBottom: 2 }}>
                        <Typography variant="h6">{user.name}</Typography>
                        <Typography variant="body1">Email: {user.email}</Typography>
                        <Typography variant="body2">Role: {user.role}</Typography>
                        <Button 
                            variant='contained' 
                            onClick={() => handleRoleModalOpen(user)} 
                            sx={{ width: '50%' }}
                        >
                            Change Role
                        </Button>
                    </Box>
                ))}
            </div>

            <Modal open={roleModalOpen} onClose={handleRoleModalClose}>
                <Box sx={style}>
                    <Typography variant="h4">Change Role</Typography>
                    {selectedUser && (
                        <>
                            <Typography variant="body1">User: {selectedUser.name}</Typography>
                            <Typography variant="body2">Current Role: {selectedUser.role}</Typography>
                            
                            <Button 
                                variant="contained" 
                                onClick={() => updateUserRole(selectedUser.id, 'verified')}
                                sx={{ margin: '8px' }}
                            >
                                Set to Verified
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={() => updateUserRole(selectedUser.id, 'admin')}
                                sx={{ margin: '8px' }}
                            >
                                Set to Admin
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={() => updateUserRole(selectedUser.id, 'unverified')}
                                sx={{ margin: '8px' }}
                            >
                                Set to Unverified
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>

            <div>
                <Footer />
            </div>
        </section>
    );
};

export default RoleManagement;
