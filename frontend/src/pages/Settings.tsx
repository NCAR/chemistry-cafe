import { useSearchParams } from "react-router-dom";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/Settings.css";
import {
  useCustomTheme,
  dyslexiaFontFamily,
  ColorModePreference,
} from "../components/CustomThemeContext";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Slider,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Input,
} from "@mui/material";
import { useLayoutEffect, useState } from "react";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SettingsAccessibilityIcon from "@mui/icons-material/SettingsAccessibility";
import TvIcon from "@mui/icons-material/Tv";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const Settings = () => {
  const { theme } = useCustomTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState<
    "profile" | "appearance" | "accessibility" | string
  >(searchParams.get("selectedMenu") ?? "appearance");
  const [menuComponent, setMenuComponent] = useState<JSX.Element>(
    <ProfileMenu />,
  );

  const getMenuComponent = (menuName: string) => {
    switch (menuName) {
      case "appearance":
        return <AppearanceMenu />;
      case "accessibility":
        return <AccessibilityMenu />;
      default:
      case "profile":
        return <ProfileMenu />;
    }
  };

  const selectMenu = (menuName: string) => {
    if (selectedMenu !== menuName) {
      setSelectedMenu(menuName);
      setSearchParams(`selectedMenu=${menuName}`);
    }
  };

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
        sx={{
          paddingLeft: "5%",
          paddingRight: "5%",
        }}
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
          <List
            sx={{
              color: theme.palette.text.primary,
              fontSize: theme.typography.fontSize + 4,
            }}
            subheader="App Settings"
          >
            <ListItem disablePadding>
              <ListItemButton
                aria-label="open appearance settings"
                onClick={() => selectMenu("appearance")}
              >
                <ListItemIcon>
                  <TvIcon
                    color={selectedMenu == "appearance" ? "primary" : "inherit"}
                  />
                </ListItemIcon>
                <ListItemText>
                  <Typography
                    color={
                      selectedMenu == "appearance" ? "primary" : "textPrimary"
                    }
                  >
                    Appearance
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                aria-label="open accessibility settings"
                onClick={() => selectMenu("accessibility")}
              >
                <ListItemIcon>
                  <SettingsAccessibilityIcon
                    color={
                      selectedMenu == "accessibility" ? "primary" : "inherit"
                    }
                  />
                </ListItemIcon>
                <ListItemText>
                  <Typography
                    color={
                      selectedMenu == "accessibility"
                        ? "primary"
                        : "textPrimary"
                    }
                    data-testid="accessibility-menu-button"
                  >
                    Accessibility
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          </List>

          <List
            sx={{
              color: theme.palette.text.primary,
              fontSize: theme.typography.fontSize + 4,
            }}
            subheader="User Settings"
          >
            <ListItem disablePadding>
              <ListItemButton
                aria-label="open profile settings"
                onClick={() => selectMenu("profile")}
              >
                <ListItemIcon>
                  <AccountBoxIcon
                    color={selectedMenu == "profile" ? "primary" : "inherit"}
                  />
                </ListItemIcon>
                <ListItemText>
                  <Typography
                    color={
                      selectedMenu == "profile" ? "primary" : "textPrimary"
                    }
                  >
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
  return <Typography component={"h1"}>Work In Progress</Typography>;
};

const AppearanceMenu = () => {
  const { theme, appearanceSettings, setAppearanceSettings } = useCustomTheme();

  const setColorModePreference = (
    _: React.MouseEvent<HTMLElement>,
    preference: ColorModePreference | null,
  ) => {
    if (!preference) {
      return;
    }
    setAppearanceSettings({
      ...appearanceSettings,
      colorModePreference: preference,
    });
  };

  return (
    <>
      <List
        sx={{
          color: theme.palette.text.primary,
          fontSize: theme.typography.fontSize + 4,
        }}
        subheader="Color Theme"
      >
        <ListItem>
          <ListItemText>
            <Typography color="textPrimary" fontSize="large">
              Theme
            </Typography>
            <Typography color="textSecondary" variant="body2">
              Follow your system setting, or choose light or dark.
            </Typography>
          </ListItemText>
          <ToggleButtonGroup
            value={appearanceSettings?.colorModePreference ?? "system"}
            exclusive
            onChange={setColorModePreference}
            aria-label="Color theme preference"
          >
            <ToggleButton value="system" aria-label="use system theme">
              <SettingsBrightnessIcon sx={{ mr: 1 }} fontSize="small" />
              System
            </ToggleButton>
            <ToggleButton value="light" aria-label="use light theme">
              <LightModeIcon sx={{ mr: 1 }} fontSize="small" />
              Light
            </ToggleButton>
            <ToggleButton value="dark" aria-label="use dark theme">
              <DarkModeIcon sx={{ mr: 1 }} fontSize="small" />
              Dark
            </ToggleButton>
          </ToggleButtonGroup>
        </ListItem>
      </List>
    </>
  );
};

const AccessibilityMenu = () => {
  const { theme, appearanceSettings, setAppearanceSettings } = useCustomTheme();
  const [fontSliderValue, setFontSliderValue] = useState(
    appearanceSettings.fontSize,
  );

  const setFontSize = (fontSize: number) => {
    setAppearanceSettings({
      ...appearanceSettings,
      fontSize,
    });
  };

  const toggleDyslexiaFont = () => {
    setAppearanceSettings({
      ...appearanceSettings,
      fontFamily: appearanceSettings?.fontFamily
        ? undefined
        : dyslexiaFontFamily,
    });
  };

  const marks = [
    { value: 5, label: "5" },
    { value: 12, label: "12" },
    { value: 14, label: "14" },
    { value: 18, label: "18" },
    { value: 24, label: "24" },
    { value: 30, label: "30" },
    { value: 36, label: "36" },
    { value: 42, label: "42" },
    { value: 50, label: "50" },
  ];

  return (
    <>
      <List
        sx={{
          fontSize: theme.typography.fontSize + 4,
        }}
        subheader="Text Content"
      >
        <ListItem>
          {" "}
          {/* Font Size */}
          <Paper
            sx={{
              p: 1,
              width: "40vw",
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
              <Typography>Adjust Font Size</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                textAlign: "center",
                alignItems: "center",
                columnGap: 6,
              }}
            >
              <Slider
                // aria-label="font-size"
                track={false}
                defaultValue={appearanceSettings.fontSize ?? 12}
                min={5}
                max={50}
                marks={marks}
                // value={appearanceSettings.fontSize ?? 12}
                valueLabelDisplay="auto"
                onChange={(_, value) => {
                  setFontSliderValue(Number(value));
                }}
                onChangeCommitted={(_, value) => {
                  setFontSize(Number(value));
                }}
              />
            </Box>
            <Input
              value={fontSliderValue}
              size="small"
              onChange={(e) => {
                let n: number = Number.parseInt(e.target.value);
                if (Number.isFinite(n)) {
                  setFontSliderValue(n);
                } else {
                  setFontSliderValue(undefined);
                }
              }}
              onBlur={() => {
                let n = fontSliderValue ?? 14;
                if (n < 5) n = 5;
                if (n > 50) n = 50;
                setFontSliderValue(n);
                setFontSize(n);
              }}
              inputProps={{
                step: 2,
                min: 5,
                max: 50,
                type: "number",
              }}
            />
          </Paper>
        </ListItem>
        <ListItem>
          {" "}
          {/* Dyslexia Font */}
          <ToggleButton
            value="dyslexiaButton"
            selected={Boolean(appearanceSettings?.fontFamily)}
            onChange={toggleDyslexiaFont}
            aria-label="Dyslexia Font"
            sx={{ textTransform: "none" }}
          >
            <SpellcheckIcon />
            Dyslexia Font
          </ToggleButton>
        </ListItem>
      </List>
    </>
  );
};

export default Settings;
