import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { Divider } from "@mui/material";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import HubIcon from "@mui/icons-material/Hub";
import InfoIcon from "@mui/icons-material/Info";
import BugReportIcon from "@mui/icons-material/BugReport";
import ForumIcon from "@mui/icons-material/Forum";
import PersonIcon from "@mui/icons-material/Person";
import GoogleIcon from "@mui/icons-material/Google";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useAuth } from "../components/AuthContext";
import { useCustomTheme } from "../components/CustomThemeContext";
import Typography from "@mui/material/Typography";
import NSF_NCARlogo_color from "../assets/branding/nsf-ncar-lockup-color.png";
import NSF_NCARlogo_white from "../assets/branding/nsf-ncar-lockup-white.png";
import { AUTH_URL } from "../API/API_config";
import { clearFamiliesLocally } from "../helpers/localFamilies";

const CHEMISTRY_CAFE_REPO = "https://github.com/NCAR/chemistry-cafe";

export const Header = () => {
  const { user: loggedInUser, setUser } = useAuth(); // Get logged in user info from AuthContext

  const login = () => {
    localStorage.removeItem("user");
    window.location.assign(`${AUTH_URL}/google/login`);
  };

  const goLogOut = () => {
    clearFamiliesLocally();
    setUser(null);
    localStorage.removeItem("user");
    window.location.assign(`${AUTH_URL}/google/logout`);
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
        <Button component={Link} to="/dashboard">
          Browse
        </Button>
        <Button component={Link} to="/familyeditor">
          My Families
        </Button>
      </Box>

      {/* Display login information and sign-in controls */}
      {loggedInUser ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingRight: "10px",
          }}
        >
          <Typography sx={{ fontSize: "medium" }}>
            {loggedInUser.email}
          </Typography>
          {loggedInUser.role === "admin" && (
            <IconButton
              component={Link}
              to="/usermanagement"
              aria-label="User management"
              size="small"
            >
              <ManageAccountsIcon />
            </IconButton>
          )}
          <IconButton
            component={Link}
            to="/settings"
            aria-label="Settings"
            size="small"
          >
            <SettingsIcon />
          </IconButton>
          <Button
            size="small"
            color="error"
            onClick={goLogOut}
            startIcon={<LogoutIcon color="inherit" />}
          >
            Logout
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
          <IconButton
            component={Link}
            to="/settings"
            aria-label="Settings"
            size="small"
          >
            <SettingsIcon />
          </IconButton>
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
