import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { useAuth } from '../pages/AuthContext'; // Import useAuth to get the user data

const NavDropDown = () => {
  const navigate = useNavigate();
  
  // Get the logged-in user from the AuthContext
  const { user, setUser } = useAuth();

  const goHome = () => navigate('/LoggedIn');
  const goFamily = () => navigate('/FamilyPage');
  const goLogOut = () => {
    setUser(null); 
    navigate('/');  
  };
  const goRoles = () => navigate('/Roles'); // Add navigation to Roles page

  return (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={goHome}>
            <ListItemText primary={"Home"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={goFamily}>
            <ListItemText primary={"Families"} />
          </ListItemButton>
        </ListItem>
        {/* Conditionally render the Roles option only if the user is an admin */}
        {user && user.role === 'admin' && (
          <ListItem disablePadding>
            <ListItemButton onClick={goRoles}>
              <ListItemText primary={"Role Management"} />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding>
          <ListItemButton onClick={goLogOut}>
            <ListItemText primary={"Log Out"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default NavDropDown;
