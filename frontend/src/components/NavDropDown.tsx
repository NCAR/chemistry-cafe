import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import { useAuth } from "../components/AuthContext"; // Import useAuth to get the user data
import { AUTH_URL } from "../API/API_config";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ScienceIcon from "@mui/icons-material/Science";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import { ListItemIcon } from "@mui/material";

const NavDropDown = () => {
  const navigate = useNavigate();

  // Get the logged-in user from the AuthContext
  const { user, setUser } = useAuth();

  const goHome = () => {
    window.onbeforeunload = null;
    navigate("/");
  };
  const goFamily = () => {
    window.onbeforeunload = null;
    navigate("/familypage");
  };
  const goDashboard = () => {
    window.onbeforeunload = null;
    navigate("/dashboard");
  };
  const goSettings = () => {
    window.onbeforeunload = null;
    navigate("/settings");
  };
  const goLogOut = () => {
    setUser(null);
    localStorage.removeItem("user");
    window.location.assign(`${AUTH_URL}/google/logout`);
  };
  const goUserManagement = () => navigate("/usermanagement"); // Add navigation to Roles page

  return (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={goHome}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary={"Home"} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={goFamily}>
            <ListItemIcon>
              <ScienceIcon />
            </ListItemIcon>
            <ListItemText primary={"Families"} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={goDashboard}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary={"Dashboard"} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={goSettings}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary={"Settings"} />
          </ListItemButton>
        </ListItem>

        {/* Conditionally render the Roles option only if the user is an admin */}
        {user && user.role === "admin" && (
          <ListItem disablePadding>
            <ListItemButton onClick={goUserManagement}>
              <ListItemIcon>
                <ManageAccountsIcon />
              </ListItemIcon>
              <ListItemText primary={"User Management"} />
            </ListItemButton>
          </ListItem>
        )}

        <ListItem disablePadding>
          <ListItemButton onClick={goLogOut}>
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary={"Log Out"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default NavDropDown;
