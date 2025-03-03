import { useSearchParams } from "react-router-dom";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/settings.css";
import { useCustomTheme } from "../components/CustomThemeContext";
import { Box, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Switch, Typography } from "@mui/material";
import { useLayoutEffect, useState } from "react";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SettingsAccessibilityIcon from '@mui/icons-material/SettingsAccessibility';
import TvIcon from '@mui/icons-material/Tv';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';

const Settings = () => {
  const { theme } = useCustomTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState<"profile" | "appearance" | "accessibility" | string>(searchParams.get("selectedMenu") ?? "appearance");
  const [menuComponent, setMenuComponent] = useState<JSX.Element>(<ProfileMenu />);

  const getMenuComponent = (menuName: string) => {
    switch (menuName) {
      case "appearance":
        return <AppearanceMenu />
      case "accessibility":
        return <AccessibilityMenu />
      default:
      case "profile":
        return <ProfileMenu />;
    }
  }

  const selectMenu = (menuName: string) => {
    if (selectedMenu !== menuName) {
      setSelectedMenu(menuName);
      setSearchParams(`selectedMenu=${menuName}`);
    }
  }

  useLayoutEffect(() => {
    setMenuComponent(getMenuComponent(selectedMenu));
  }, [selectedMenu]);


  return (
    <div className="layout-settings">
      <header>
        <Header />
      </header>
      <Paper
        square
        component="section"
        className="content-settings"
      >
        <Box
          sx={{
            height: "100%",
            p: 1,
          }}
          className="settings-selector"
        >
          <List sx={{ color: theme.palette.text.primary }} subheader="App Settings">
            <ListItem disablePadding>
              <ListItemButton aria-label="open appearance settings" onClick={() => selectMenu("appearance")}>
                <ListItemIcon>
                  <TvIcon color={selectedMenu == "appearance" ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText>
                  <Typography color={selectedMenu == "appearance" ? "primary" : "textPrimary"}>
                    Appearance
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton aria-label="open accessibility settings" onClick={() => selectMenu("accessibility")}>
                <ListItemIcon>
                  <SettingsAccessibilityIcon color={selectedMenu == "accessibility" ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText>
                  <Typography color={selectedMenu == "accessibility" ? "primary" : "textPrimary"}>
                    Accessibility
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          </List>

          <List sx={{ color: theme.palette.text.primary }} subheader="User Settings">
            <ListItem disablePadding>
              <ListItemButton aria-label="open profile settings" onClick={() => selectMenu("profile")}>
                <ListItemIcon>
                  <AccountBoxIcon color={selectedMenu == "profile" ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText>
                  <Typography color={selectedMenu == "profile" ? "primary" : "textPrimary"}>
                    My Profile
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
        <Paper
          sx={{
            p: 2,
          }}
          square
          elevation={2}
          className="settings-editor"
        >
          {menuComponent}
        </Paper>
      </Paper>

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

const ProfileMenu = () => {
  return (
    <Typography component={"h1"}>
      Work In Progress
    </Typography>
  );
}

const AppearanceMenu = () => {
  const { theme, appearanceSettings, setAppearanceSettings } = useCustomTheme();

  const toggleDarkMode = () => {
    setAppearanceSettings({
      ...appearanceSettings,
      mode: appearanceSettings?.mode === "dark" ? "light" : "dark",
    });
  };

  return (
    <>
      <List sx={{ color: theme.palette.text.primary }} subheader="Color Theme">
        <ListItem disablePadding>
          <ListItemButton aria-label="toggle dark theme" onClick={toggleDarkMode}>
            <ListItemText>
              <Typography color="textPrimary">Dark Theme</Typography>
            </ListItemText>
            <Switch checked={appearanceSettings?.mode === "dark"} />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );
}

const AccessibilityMenu = () => {
  return (
    <>
      <List subheader="Text Content">
        <ListItem>
          <Paper
            sx={{
              p: 1
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                columnGap: 1,
              }}
            >
              <TextFieldsIcon />
              <Typography fontSize={16}>
                Adjust Font Size
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                textAlign: "center",
                alignItems: "center",
                columnGap: 5,
              }}
            >
              <IconButton aria-label="decrease font size">
                <RemoveCircleOutlineOutlinedIcon />
              </IconButton>
              <Typography sx={{ flex: 1 }}>
                100%
              </Typography>
              <IconButton aria-label="increase font size">
                <AddCircleOutlineOutlinedIcon />
              </IconButton>
            </Box>
          </Paper>
        </ListItem>
      </List>
      <List subheader="Colors">
        <ListItem>
          <Box>

          </Box>
        </ListItem>
      </List>
    </>
  );
}

export default Settings;
