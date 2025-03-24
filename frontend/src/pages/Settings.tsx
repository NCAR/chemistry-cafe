import { useSearchParams } from "react-router-dom";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/Settings.css";
import {
  defaultAppearanceSettings,
  useCustomTheme,
  dyslexiaFontFamily,
} from "../components/CustomThemeContext";
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Paper,
  Slider,
  Switch,
  Typography,
  ToggleButton
} from "@mui/material";
import { memo, MouseEvent, useLayoutEffect, useState } from "react";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SettingsAccessibilityIcon from "@mui/icons-material/SettingsAccessibility";
import TvIcon from "@mui/icons-material/Tv";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import {
  blue,
  cyan,
  green,
  grey,
  orange,
  purple,
  red,
  yellow,
} from "@mui/material/colors";

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

  const toggleDarkMode = () => {
    setAppearanceSettings({
      ...appearanceSettings,
      mode: appearanceSettings?.mode === "dark" ? "light" : "dark",
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
        <ListItem disablePadding>
          <ListItemButton
            aria-label="toggle dark theme"
            onClick={toggleDarkMode}
          >
            <ListItemText>
              <Typography color="textPrimary" fontSize="large">
                Dark Theme
              </Typography>
              <Typography color="textSecondary" fontSize="medium">
                This theme may not work with all pages currently
              </Typography>
            </ListItemText>
            <Switch checked={appearanceSettings?.mode === "dark"} />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );
};

const AccessibilityMenu = () => {
  const { theme, appearanceSettings, setAppearanceSettings } = useCustomTheme();

  /**
   * Modifies the main global value for a given color palette
   * @param paletteName Name of the palette to modify. This affects all components with this set value as the color.
   * @param color Hex code for color to use.
   */
  const modifyColorPalette = (
    paletteName: "primary" | "secondary" | "info" | "error",
    color: string,
  ) => {
    const modifiedAppearanceSettings = { ...appearanceSettings };
    switch (paletteName) {
      case "primary":
        modifiedAppearanceSettings.primaryColor = color;
        break;
      case "secondary":
        modifiedAppearanceSettings.secondaryColor = color;
        break;
      case "info":
        modifiedAppearanceSettings.infoColor = color;
        break;
      case "error":
        modifiedAppearanceSettings.errorColor = color;
        break;
    }

    setAppearanceSettings(modifiedAppearanceSettings);
  };

  const setFontSize = (fontSize: number) => {
    setAppearanceSettings({
      ...appearanceSettings,
      fontSize,
    });
  };

  const toggleDyslexiaFont = () => {
    setAppearanceSettings({
      ...appearanceSettings,
      fontFamily: appearanceSettings?.fontFamily ? undefined : dyslexiaFontFamily
    });
  }

  return (
    <>
      <List
        sx={{
          fontSize: theme.typography.fontSize + 4,
        }}
        subheader="Text Content"
      >
        <ListItem>  {/* Font Size */}
          <Paper
            sx={{
              p: 1,
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
              <IconButton
                onClick={() =>
                  setFontSize((appearanceSettings.fontSize ?? 14) - 1)
                }
                aria-label="decrease font size"
              >
                <RemoveCircleOutlineOutlinedIcon />
              </IconButton>
              <Typography sx={{ flex: 1 }}>
                {appearanceSettings.fontSize?.toString()} pt
              </Typography>
              <IconButton
                onClick={() =>
                  setFontSize((appearanceSettings.fontSize ?? 14) + 1)
                }
                aria-label="increase font size"
              >
                <AddCircleOutlineOutlinedIcon />
              </IconButton>
            </Box>
          </Paper>
        </ListItem>
        <ListItem>  {/* Dyslexia Font */}
          <ToggleButton 
            value="dyslexiaButton"
            selected={Boolean(appearanceSettings?.fontFamily)} 
            onChange={toggleDyslexiaFont} 
            aria-label="Dyslexia Font"
            sx={{ textTransform: "none" }}
          >
            <SpellcheckIcon/>
              Dyslexia Font
          </ToggleButton>
        </ListItem>
      </List>
      <Divider variant="middle" />
      <List
        sx={{
          fontSize: theme.typography.fontSize + 4,
        }}
        subheader="Colors"
      >
        <ListItem>
          <ColorPicker
            initialColor={theme.palette.primary.main}
            onColorChange={(color) => modifyColorPalette("primary", color)}
            label="Primary Color"
            id="primary-color-picker"
            buttonColor="primary"
          />
          {theme.palette.primary.main !==
            defaultAppearanceSettings.primaryColor && (
            <Button
              onClick={() =>
                modifyColorPalette(
                  "primary",
                  defaultAppearanceSettings.primaryColor!,
                )
              }
            >
              Reset
            </Button>
          )}
        </ListItem>
        <ListItem>
          <ColorPicker
            initialColor={theme.palette.secondary.main}
            onColorChange={(color) => modifyColorPalette("secondary", color)}
            label="Secondary Color"
            id="secondary-color-picker"
            buttonColor="secondary"
          />
          {theme.palette.secondary.main !==
            defaultAppearanceSettings.secondaryColor && (
            <Button
              onClick={() =>
                modifyColorPalette(
                  "secondary",
                  defaultAppearanceSettings.secondaryColor!,
                )
              }
            >
              Reset
            </Button>
          )}
        </ListItem>
        <ListItem>
          <ColorPicker
            initialColor={theme.palette.info.main}
            onColorChange={(color) => modifyColorPalette("info", color)}
            label="Information Color"
            id="primary-button-color-picker"
            buttonColor="info"
          />
          {theme.palette.info.main !== defaultAppearanceSettings.infoColor && (
            <Button
              onClick={() =>
                modifyColorPalette("info", defaultAppearanceSettings.infoColor!)
              }
            >
              Reset
            </Button>
          )}
        </ListItem>
        <ListItem>
          <ColorPicker
            initialColor={theme.palette.error.main}
            onColorChange={(color) => modifyColorPalette("error", color)}
            label="Warning Color"
            id="primary-button-color-picker"
            buttonColor="error"
          />
          {theme.palette.error.main !==
            defaultAppearanceSettings.errorColor && (
            <Button
              onClick={() =>
                modifyColorPalette(
                  "error",
                  defaultAppearanceSettings.errorColor!,
                )
              }
            >
              Reset
            </Button>
          )}
        </ListItem>
      </List>
    </>
  );
};

type ColorPickerProps = {
  initialColor: string;
  onColorChange: (color: string) => void;
  label: string;
  id: string;
  buttonColor?: "primary" | "secondary" | "error" | "warning" | "info";
};

type ColorType = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  700: string;
  800: string;
  900: string;
};

const defaultColors: Array<ColorType> = [
  red,
  orange,
  yellow,
  green,
  cyan,
  blue,
  purple,
  grey,
];

/**
 * Used for picking between a set of mui color values
 */
const ColorPicker = memo(function ColorPicker({
  initialColor,
  onColorChange,
  label,
  id,
  buttonColor,
}: ColorPickerProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [color, setColor] = useState<string>(initialColor);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(-1);
  const [colorValue, setColorValue] = useState<keyof ColorType>(500);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  return (
    <Box>
      <Button
        id={id}
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup={true}
        onClick={handleMenuOpen}
        variant="contained"
        endIcon={<KeyboardArrowDownIcon />}
        color={buttonColor ?? "primary"}
      >
        {label}
      </Button>
      <Menu
        MenuListProps={{
          "aria-labelledby": id,
          sx: {
            p: 2,
            display: "flex",
            flexDirection: "column",
            rowGap: 1,
          },
        }}
        open={open}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
          }}
        >
          {defaultColors.map((componentColor, index) => {
            return (
              <Box
                key={`${componentColor[50]}-${id}`}
                sx={{
                  backgroundColor: componentColor[colorValue],
                  height: "4rem",
                  width: "4rem",
                }}
                role="button"
                onClick={() => {
                  setSelectedColorIndex(index);
                  setColor(componentColor[colorValue]);
                }}
              >
                {selectedColorIndex == index && <CheckCircleIcon />}
              </Box>
            );
          })}
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            p: 0.5,
          }}
        >
          <Typography>{color}</Typography>
        </Box>
        <Slider
          aria-label="Color Saturation"
          defaultValue={500}
          step={100}
          marks={[]}
          min={100}
          max={900}
          onChange={(_, val) => {
            if (typeof val != "number") {
              return;
            }
            setColorValue(val as keyof ColorType);
            if (
              selectedColorIndex < 0 ||
              selectedColorIndex >= defaultColors.length
            ) {
              return;
            }
            setColor(defaultColors.at(selectedColorIndex)![colorValue]);
          }}
        />
        <Button
          onClick={() => onColorChange(color)}
          variant="outlined"
          color="primary"
        >
          Use This Color
        </Button>
      </Menu>
    </Box>
  );
});

export default Settings;
