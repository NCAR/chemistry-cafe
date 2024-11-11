import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import NavDropDown from "./NavDropDown";
import { Drawer } from "@mui/material";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import DensitySmallSharpIcon from "@mui/icons-material/DensitySmallSharp";
import { useAuth } from "../pages/AuthContext";
// import Modal from '@mui/material/Modal';
// import Typography from '@mui/material/Typography';

export const Header = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { user: loggedInUser } = useAuth(); // Get logged in user info from AuthContext

  const displayRole = () => {
    if (!loggedInUser) return ""; // If no user is logged in, return an empty string
    switch (loggedInUser.role) {
      case "admin":
        return "Admin";
      case "verified":
        return "Verified Scientist";
      case "unverified":
        return "Unverified";
      default:
        return "Unknown Role"; // Fallback for any unexpected values
    }
  };

  const toggleDrawer = (newOpenDrawer: boolean) => () => {
    setOpenDrawer(newOpenDrawer);
  };

  return (
    <Paper
      square={true}
      variant="outlined"
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
      }}
    >
      <Button onClick={toggleDrawer(true)}>
        <DensitySmallSharpIcon sx={{ fontSize: 50 }}></DensitySmallSharpIcon>
      </Button>
      <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
        <NavDropDown />
      </Drawer>

      {/* Display login information and role */}
      {loggedInUser ? (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ paddingRight: "10px" }}>
            {/* Display user's name or email */}
            <span>{loggedInUser.email}</span>
          </Box>
          <Box sx={{ paddingRight: "20px" }}>
            {/* Display user's role */}
            <span>({displayRole()})</span>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{ display: "flex", alignItems: "center", paddingRight: "20px" }}
        >
          Using as guest
        </Box>
      )}
    </Paper>
  );
};

export const Footer = () => {
  const handleBugClick = () => {
    window.open("https://github.com/NCAR/chemistrycafe/issues", "_blank");
  };

  const handleAccessibilityClick = () => {
    window.open("https://www.ucar.edu/accessibility", "_blank");
  };

  const [, setAboutOpen] = useState(false);
  const handleAboutOpen = () => setAboutOpen(true);
  const handleAbout = () => {
    handleAboutOpen();
  };


  return (
    <Paper component="footer" square={true} variant="outlined">
      <Container maxWidth="lg" sx={{ display: "flex" }}>
        <Box
          component="img"
          src={"src/assets/nsf-stackseal-logo-lockup-dark.png"}
          sx={{ height: "80px", width: "auto", pr: 10 }}
        ></Box>
        <Box sx={{ pr: 10 }}>
          <Button onClick={handleAbout}>About</Button>
        </Box>
        <Box sx={{ pr: 10 }}>
          <Button onClick={handleBugClick} variant="text">
            Report a bug
          </Button>
        </Box>
        <Box sx={{ pr: 10 }}>
          <Button onClick={handleAccessibilityClick}>Accessibility</Button>
        </Box>
      </Container>
    </Paper>
  );
};
