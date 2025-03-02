import { useNavigate, useSearchParams } from "react-router-dom";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/settings.css";
import { useCustomTheme } from "../components/CustomThemeContext";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useLayoutEffect, useState } from "react";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SettingsAccessibilityIcon from '@mui/icons-material/SettingsAccessibility';
import TvIcon from '@mui/icons-material/Tv';
import TextFieldsIcon from '@mui/icons-material/TextFields';

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState<"profile" | "appearance" | "accessibility" | string>(searchParams.get("selectedMenu") ?? "profile");
  const [menuComponent, setMenuComponent] = useState<JSX.Element>(<ProfileMenu />);
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

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
    <section className="layout-settings">
      <header>
        <Header />
      </header>

      <section className="content-settings">
        <div className="settings-selector">
          <Box
            sx={{
              height: "100%",
              p: 1
            }}
          >
            <List subheader="User Settings">
              <ListItem disablePadding>
                <ListItemButton onClick={() => selectMenu("profile")}>
                  <ListItemIcon>
                    <AccountBoxIcon color={selectedMenu == "profile" ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography color={selectedMenu == "profile" ? "primary" : "inherit"}>
                      My Profile
                    </Typography>
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            </List>

            <List subheader="App Settings">
              <ListItem disablePadding>
                <ListItemButton onClick={() => selectMenu("appearance")}>
                  <ListItemIcon>
                    <TvIcon color={selectedMenu == "appearance" ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography color={selectedMenu == "appearance" ? "primary" : "inherit"}>
                      Appearance
                    </Typography>
                  </ListItemText>
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton onClick={() => selectMenu("accessibility")}>
                  <ListItemIcon>
                    <SettingsAccessibilityIcon color={selectedMenu == "accessibility" ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography color={selectedMenu == "accessibility" ? "primary" : "inherit"}>
                      Accessibility
                    </Typography>
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </div>
        <div className="settings-editor">
          {menuComponent}
        </div>
      </section>

      <footer>
        <Footer />
      </footer>
    </section>
  );
};

const ProfileMenu = () => {
  return (
    <Typography component={"h1"}>
      Unimplemented
    </Typography>
  );
}

const AppearanceMenu = () => {
  return (
    <Typography component={"h1"}>
      Unimplemented
    </Typography>
  );
}

const AccessibilityMenu = () => {
  const { themeOptions, setThemeOptions } = useCustomTheme();
  return (
    <>
      <List subheader="Text Content">
        <ListItem>
          <TextFieldsIcon />
          <Typography>
            Adjust Font Size
          </Typography>
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
