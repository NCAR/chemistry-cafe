import { useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import NavDropDown from "./NavDropDown";
import { Divider, Drawer } from "@mui/material";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import DensitySmallSharpIcon from "@mui/icons-material/DensitySmallSharp";
import HubIcon from "@mui/icons-material/Hub";
import InfoIcon from "@mui/icons-material/Info";
import BugReportIcon from "@mui/icons-material/BugReport";
import ForumIcon from "@mui/icons-material/Forum";
import PersonIcon from "@mui/icons-material/Person";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../components/AuthContext";
import { useCustomTheme } from "../components/CustomThemeContext";
import Typography from "@mui/material/Typography";
import NSF_NCARlogo_color from "../assets/branding/nsf-ncar-lockup-color.png";
import NSF_NCARlogo_white from "../assets/branding/nsf-ncar-lockup-white.png";
import { AUTH_URL } from "../API/API_config";

const CHEMISTRY_CAFE_REPO = "https://github.com/NCAR/chemistry-cafe";

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

  const login = () => {
    localStorage.removeItem("user");
    window.location.assign(`${AUTH_URL}/google/login`);
  };

  return (
    <Paper
      square={true}
      variant="outlined"
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "2px 10px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          aria-label="Open Side-Navigation Menu"
          id="side-nav-button"
          onClick={toggleDrawer(true)}
        >
          <DensitySmallSharpIcon
            sx={{ fontSize: "1.7rem" }}
          ></DensitySmallSharpIcon>
        </Button>
        <Button
          component={Link}
          to="/"
          aria-label="Chemistry Cafe home"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            color: "primary.main",
          }}
        >
          <HubIcon />
          <Typography
            sx={{ fontWeight: 700, fontSize: "1.1rem", color: "inherit" }}
          >
            Chemistry Cafe
          </Typography>
        </Button>
      </Box>
      <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
        <NavDropDown />
      </Drawer>

      {/* Display login information and sign-in controls */}
      {loggedInUser ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            paddingRight: "10px",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "medium" }}>
              {loggedInUser.email}
            </Typography>
            <Typography sx={{ fontSize: "small" }} color="text.secondary">
              ({displayRole()})
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={login}
            startIcon={<GoogleIcon color="inherit" />}
          >
            Switch Account
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            paddingRight: "20px",
          }}
        >
          <Typography sx={{ fontSize: "medium" }} color="text.secondary">
            Using as guest
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Button size="small" onClick={login} startIcon={<GoogleIcon />}>
            Sign in
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export const Footer = () => {
  const { appearanceSettings } = useCustomTheme();
  const isDark = appearanceSettings.mode === "dark";
  const NSF_NCARlogo = isDark ? NSF_NCARlogo_white : NSF_NCARlogo_color;

  const handleAccessibilityClick = () => {
    window.open("https://www.ucar.edu/accessibility", "_blank");
  };

  return (
    <Paper component="footer" square={true} variant="outlined">
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          py: 1,
          px: 4,
          "& .MuiButton-root": { fontSize: "0.75rem" },
        }}
      >
        {/* ACOM lab attribution, per the NSF NCAR Labs logo pairing guidance:
            the NSF NCAR mark locked up with the lab name in Poppins Bold. */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            component="img"
            src={NSF_NCARlogo}
            alt="NSF NCAR"
            sx={{ height: "32px", width: "auto" }}
          />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.75rem",
              lineHeight: 1.2,
              color: isDark ? "#FFFFFF" : "#00357A",
            }}
          >
            Atmospheric Chemistry
            <br />
            Observations &amp; Modeling
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button component={Link} to="/about" startIcon={<InfoIcon />}>
            About
          </Button>
          <Button
            component="a"
            href={`${CHEMISTRY_CAFE_REPO}/discussions`}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<ForumIcon />}
          >
            Start a Discussion
          </Button>
          <Button
            component="a"
            href={`${CHEMISTRY_CAFE_REPO}/issues/new`}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<BugReportIcon />}
          >
            Report a Bug
          </Button>
          <Button onClick={handleAccessibilityClick} startIcon={<PersonIcon />}>
            Accessibility
          </Button>
        </Box>
      </Container>
    </Paper>
  );
};
