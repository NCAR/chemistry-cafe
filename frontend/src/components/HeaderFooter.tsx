import { useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { Divider, ListItemIcon, Menu, MenuItem } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
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
import MenuIcon from "@mui/icons-material/Menu";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import { useAuth } from "../components/AuthContext";
import { useCustomTheme } from "../components/CustomThemeContext";
import Typography from "@mui/material/Typography";
import ACOMlockupHorizontalColor from "../assets/branding/acom-lockup-horizontal-color.png";
import ACOMlockupHorizontalWhite from "../assets/branding/acom-lockup-horizontal-white.png";
import ACOMlockupVerticalColor from "../assets/branding/acom-lockup-vertical-color.png";
import ACOMlockupVerticalWhite from "../assets/branding/acom-lockup-vertical-white.png";
import OrcidImage from "../assets/ORCID-iD_icon_vector.svg"
import {BASE_URL, AUTH_URL } from "../API/API_config";
import { clearFamiliesLocally } from "../helpers/localFamilies";

const CHEMISTRY_CAFE_REPO = "https://github.com/NCAR/chemistry-cafe";

export const Header = () => {
  const { user: loggedInUser, setUser } = useAuth(); // Get logged in user info from AuthContext
  const { theme } = useCustomTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const closeMobileMenu = () => setMobileMenuAnchor(null);

  const loginGoogle = () => {
    localStorage.removeItem("user");
    window.location.assign(`${AUTH_URL}/google/login`);
  };
  const loginOrcid = () => {
      localStorage.removeItem("user");
      window.location.assign(`${AUTH_URL}/orcid/login`);
  };

  const goLogOut = () => {
    clearFamiliesLocally();
    setUser(null);
    localStorage.removeItem("user");
    window.location.assign(`${BASE_URL}/users/logout`);
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
        {!isNarrow && (
          <>
            <Button component={Link} to="/dashboard">
              Browse
            </Button>
            <Button component={Link} to="/familyeditor">
              My Families
            </Button>
          </>
        )}
      </Box>

      {isNarrow ? (
        <Box sx={{ paddingRight: "10px" }}>
          <IconButton
            aria-label="Open navigation menu"
            onClick={(event) => setMobileMenuAnchor(event.currentTarget)}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={closeMobileMenu}
          >
            <MenuItem
              component={Link}
              to="/dashboard"
              onClick={closeMobileMenu}
            >
              <ListItemIcon>
                <TravelExploreIcon fontSize="small" />
              </ListItemIcon>
              Browse
            </MenuItem>
            <MenuItem
              component={Link}
              to="/familyeditor"
              onClick={closeMobileMenu}
            >
              <ListItemIcon>
                <FolderSpecialIcon fontSize="small" />
              </ListItemIcon>
              My Families
            </MenuItem>
            <MenuItem component={Link} to="/settings" onClick={closeMobileMenu}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            {loggedInUser?.role === "admin" && (
              <MenuItem
                component={Link}
                to="/usermanagement"
                onClick={closeMobileMenu}
              >
                <ListItemIcon>
                  <ManageAccountsIcon fontSize="small" />
                </ListItemIcon>
                User Management
              </MenuItem>
            )}
            <Divider />
            {loggedInUser ? (
              <MenuItem
                onClick={() => {
                  closeMobileMenu();
                  goLogOut();
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                Logout
              </MenuItem>
            ) : (<>
              <MenuItem
                onClick={() => {
                  closeMobileMenu();
                  loginGoogle();
                }}
              >
                <ListItemIcon>
                  <GoogleIcon fontSize="small" />
                </ListItemIcon>
                Sign in
              </MenuItem>
                <MenuItem
                    onClick={() => {
                        closeMobileMenu();
                        loginOrcid();
                    }}
                >
                    <ListItemIcon>
                        <img aria-label={"ORCID Login"} alt={"ORCID Login"} src={OrcidImage} />
                    </ListItemIcon>
                    Sign in
                </MenuItem>
            </>)}
          </Menu>
        </Box>
      ) : /* Display login information and sign-in controls */
      loggedInUser ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingRight: "10px",
          }}
        >
          <Typography sx={{ fontSize: "medium" }}>
            {loggedInUser.username}
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
          <Button size="small" onClick={loginGoogle} startIcon={<GoogleIcon />}>
            Sign in
          </Button>
            <Button size="small" onClick={loginOrcid} startIcon={<img aria-label={"ORCID Login"} alt={"ORCID Login"} src={OrcidImage} />}>
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
  const acomHorizontal = isDark
    ? ACOMlockupHorizontalWhite
    : ACOMlockupHorizontalColor;
  const acomVertical = isDark
    ? ACOMlockupVerticalWhite
    : ACOMlockupVerticalColor;
  const [linksMenuAnchor, setLinksMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const closeLinksMenu = () => setLinksMenuAnchor(null);

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
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          py: 1.5,
          px: { xs: 2, md: 4 },
          "& .MuiButton-root": { fontSize: "0.75rem" },
        }}
      >
        {/* ACOM lab lockup: horizontal on wide screens, the more compact
            vertical variant on narrow ones. */}
        <Box
          component="img"
          src={acomHorizontal}
          alt="NSF NCAR, Atmospheric Chemistry Observations & Modeling"
          sx={{
            display: { xs: "none", md: "block" },
            height: "64px",
            width: "auto",
          }}
        />
        <Box
          component="img"
          src={acomVertical}
          alt="NSF NCAR, Atmospheric Chemistry Observations & Modeling"
          sx={{
            display: { xs: "block", md: "none" },
            height: "64px",
            width: "auto",
          }}
        />
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
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

        {/* Same links, collapsed into a "more" menu on narrow screens. A
            distinct icon from the header's hamburger, since these are
            secondary, occasional links rather than site navigation. */}
        <Box sx={{ display: { xs: "block", md: "none" }, order: -1 }}>
          <IconButton
            aria-label="More links"
            onClick={(event) => setLinksMenuAnchor(event.currentTarget)}
          >
            <MoreHorizIcon />
          </IconButton>
          <Menu
            anchorEl={linksMenuAnchor}
            open={Boolean(linksMenuAnchor)}
            onClose={closeLinksMenu}
          >
            <MenuItem component={Link} to="/about" onClick={closeLinksMenu}>
              <ListItemIcon>
                <InfoIcon fontSize="small" />
              </ListItemIcon>
              About
            </MenuItem>
            <MenuItem
              component="a"
              href={`${CHEMISTRY_CAFE_REPO}/discussions`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeLinksMenu}
            >
              <ListItemIcon>
                <ForumIcon fontSize="small" />
              </ListItemIcon>
              Start a Discussion
            </MenuItem>
            <MenuItem
              component="a"
              href={`${CHEMISTRY_CAFE_REPO}/issues/new`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeLinksMenu}
            >
              <ListItemIcon>
                <BugReportIcon fontSize="small" />
              </ListItemIcon>
              Report a Bug
            </MenuItem>
            <MenuItem
              onClick={() => {
                closeLinksMenu();
                handleAccessibilityClick();
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Accessibility
            </MenuItem>
          </Menu>
        </Box>
      </Container>
    </Paper>
  );
};
