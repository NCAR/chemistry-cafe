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
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useLayoutEffect, useState } from "react";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SettingsAccessibilityIcon from "@mui/icons-material/SettingsAccessibility";
import TvIcon from "@mui/icons-material/Tv";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import StraightenIcon from "@mui/icons-material/Straighten";
import { useAuth } from "../components/AuthContext.tsx";
import { APIUser } from "../API/API_Interfaces.tsx";
import { updateUser } from "../API/API_UpdateMethods.tsx";
import { AUTH_URL } from "../API/API_config.tsx";
import GoogleIcon from "@mui/icons-material/Google";
import OrcidImage from "../assets/ORCID-iD_icon_vector.svg";
import { useUserPreferences } from "../components/UserPreferencesContext";
import {
  genericRateUnitExponent,
  rateUnitParameters,
  RateUnitReactionType,
  rateUnitReactionTypes,
  RateUnits,
  RateUnitsByType,
} from "../helpers/rateUnits";
import { reactionTypeToString } from "../helpers/stringify";
import { reactionAttributeOptions } from "../types/chemistryModels";

const Settings = () => {
  const { theme } = useCustomTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState<
    "profile" | "appearance" | "accessibility" | "units" | string
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
      case "units":
        return <UnitsMenu />;
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

  const { user: loggedInUser } = useAuth(); // Get logged in user info from AuthContext

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

            <ListItem disablePadding>
              <ListItemButton
                aria-label="open units settings"
                onClick={() => selectMenu("units")}
              >
                <ListItemIcon>
                  <StraightenIcon
                    color={selectedMenu == "units" ? "primary" : "inherit"}
                  />
                </ListItemIcon>
                <ListItemText>
                  <Typography
                    color={selectedMenu == "units" ? "primary" : "textPrimary"}
                    data-testid="units-menu-button"
                  >
                    Units
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          </List>

          {!!loggedInUser && (
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
          )}
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
  const { user: loggedInUser } = useAuth(); // Get logged in user info from AuthContext
  const { theme } = useCustomTheme();
  const userCopy = { ...loggedInUser } as APIUser;
  const [user, setUser] = useState(userCopy);
  useEffect(() => {
    setUser(userCopy);
  }, [loggedInUser]);

  return loggedInUser ? (
    <List
      sx={{
        color: theme.palette.text.primary,
        fontSize: theme.typography.fontSize + 4,
      }}
      subheader="Account Info"
    >
      <ListItem sx={{ paddingTop: theme.spacing(2) }}>
        <TextField
          sx={{
            width: "100%",
          }}
          label="Username"
          required
          defaultValue={loggedInUser?.username}
          onChange={(e) => setUser((p) => ({ ...p, username: e.target.value }))}
        />
      </ListItem>
      <ListItem>
        <TextField
          sx={{
            width: "100%",
          }}
          label="Email"
          required
          defaultValue={loggedInUser?.email}
          onChange={(e) => setUser((p) => ({ ...p, email: e.target.value }))}
        />
      </ListItem>
      <ListItem>
        <TextField
          sx={{
            width: "100%",
          }}
          label="First Name"
          required
          defaultValue={loggedInUser?.firstName}
          onChange={(e) =>
            setUser((p) => ({ ...p, firstName: e.target.value }))
          }
        />
      </ListItem>
      <ListItem>
        <TextField
          sx={{
            width: "100%",
          }}
          label="Last Name"
          required
          defaultValue={loggedInUser?.lastName}
          onChange={(e) => setUser((p) => ({ ...p, lastName: e.target.value }))}
        />
      </ListItem>
      <ListItem>
        <Typography>
          Link to
          <IconButton
            title={"Link to Google"}
            disabled={!!loggedInUser?.googleId}
            component={"button"}
            color="primary"
            onClick={() => window.location.assign(`${AUTH_URL}/google/login`)}
          >
            <GoogleIcon fontSize="small" />
          </IconButton>
          <IconButton
            title={"Link to ORCID"}
            disabled={!!loggedInUser?.orcidId}
            component={"button"}
            color="primary"
            onClick={() => window.location.assign(`${AUTH_URL}/orcid/login`)}
          >
            <img
              aria-label={"ORCID Link"}
              alt={"ORCID Link"}
              src={OrcidImage}
              style={{
                width: 24,
                height: 24,
                filter: !!loggedInUser?.orcidId ? "grayscale(100%)" : "",
              }}
            />
          </IconButton>
        </Typography>
      </ListItem>
      <ListItem>
        <Typography>
          Merge with
          <IconButton
            title={"Merge account with Google login"}
            component={"button"}
            color="primary"
            onClick={() =>
              window.confirm(
                "Are you sure you want to merge? Merging with google will merge, then DELETE any Chemistry Cafe accounts already linked to this google account.",
              ) && window.location.assign(`${AUTH_URL}/google/login?merge=true`)
            }
          >
            <GoogleIcon fontSize="small" />
          </IconButton>
          <IconButton
            title={"Merge account with ORCID login"}
            component={"button"}
            color="primary"
            onClick={() =>
              window.confirm(
                "Are you sure you want to merge? Merging with ORCID will merge, then DELETE any Chemistry Cafe accounts already linked to this ORCID account.",
              ) && window.location.assign(`${AUTH_URL}/orcid/login?merge=true`)
            }
          >
            <img
              aria-label={"ORCID Merge"}
              alt={"ORCID Merge"}
              src={OrcidImage}
              style={{ width: 24, height: 24 }}
            />
          </IconButton>
        </Typography>
      </ListItem>
      <ListItem>
        <Button
          disabled={Object.entries(user).reduce(
            (prev, [key, val]) =>
              prev && loggedInUser[key as keyof APIUser] === val,
            true,
          )}
          color="primary"
          variant="contained"
          onClick={() =>
            updateUser(user)
              .then(() => window.location.reload())
              .catch(() => window.alert("error updating profile"))
          }
        >
          Save Changes
        </Button>
      </ListItem>
    </List>
  ) : (
    <Typography>No User Listed</Typography>
  );
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

/**
 * Renders the unit of a rate parameter before the reactants are known, for
 * example (cm3 molecule-1)^(n-1) s-1.
 */
const GenericRateUnit = ({
  rateUnits,
  offset,
}: {
  rateUnits: RateUnits;
  offset: number;
}) => {
  const [volume, amount] =
    rateUnits === "Molecule" ? ["cm", "molecule"] : ["m", "mol"];
  return (
    <span>
      ({volume}
      <sup>3</sup> {amount}
      <sup>-1</sup>)<sup>{genericRateUnitExponent(offset)}</sup> s<sup>-1</sup>
    </span>
  );
};

const UnitsMenu = () => {
  const { theme } = useCustomTheme();
  const { preferences, setPreferences } = useUserPreferences();

  const setRateUnits = (type: RateUnitReactionType, rateUnits: RateUnits) => {
    setPreferences({
      ...preferences,
      rateUnits: { ...preferences.rateUnits, [type]: rateUnits },
    });
  };

  const setAllRateUnits = (rateUnits: RateUnits) => {
    setPreferences({
      ...preferences,
      rateUnits: Object.fromEntries(
        rateUnitReactionTypes.map((type) => [type, rateUnits]),
      ) as RateUnitsByType,
    });
  };

  // The "set all" switch shows a selection only when all reaction types use
  // the same units.
  const allTypesUnits = rateUnitReactionTypes.every(
    (type) =>
      preferences.rateUnits[type] ===
      preferences.rateUnits[rateUnitReactionTypes[0]],
  )
    ? preferences.rateUnits[rateUnitReactionTypes[0]]
    : null;

  // One group of rows for each reaction type, with one row for each parameter
  // that the units change.
  const groups = rateUnitReactionTypes
    .map((type) => ({
      type,
      name: reactionTypeToString(type),
      parameters: Object.entries(
        rateUnitParameters[type] as Record<string, number>,
      ).map(([key, offset]) => ({
        key,
        label: reactionAttributeOptions[type][key]?.name ?? key,
        offset,
      })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const toggleSx = { "& .MuiToggleButton-root": { textTransform: "none" } };

  return (
    <List
      sx={{
        color: theme.palette.text.primary,
        fontSize: theme.typography.fontSize + 4,
      }}
      subheader="Display Units"
    >
      <ListItem
        sx={{ flexWrap: "wrap", columnGap: theme.spacing(2) }}
        alignItems="flex-start"
      >
        <ListItemText sx={{ minWidth: "16em" }}>
          <Typography color="textPrimary" fontSize="large">
            Rate parameters
          </Typography>
          <Typography color="textSecondary" variant="body2">
            The reaction editor shows and accepts the parameters below in the
            unit of their reaction type. Chemistry Cafe always stores and
            exports SI values.
          </Typography>
        </ListItemText>
        <ToggleButtonGroup
          value={allTypesUnits}
          exclusive
          size="small"
          onChange={(_, rateUnits: RateUnits | null) =>
            rateUnits && setAllRateUnits(rateUnits)
          }
          aria-label="Units of all reaction types"
          sx={toggleSx}
        >
          <ToggleButton
            value="Molecule"
            aria-label="use molecule units for all"
          >
            All molecule cm<sup>-3</sup>
          </ToggleButton>
          <ToggleButton value="SI" aria-label="use SI units for all">
            All mol m<sup>-3</sup>
          </ToggleButton>
        </ToggleButtonGroup>
      </ListItem>
      <ListItem sx={{ display: "block" }}>
        <TableContainer>
          <Table
            size="small"
            aria-label="Parameters that use the display unit"
            // Fixed column widths, so that a change of the unit does not move
            // the columns.
            sx={{ tableLayout: "fixed" }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "28%" }}>Reaction type</TableCell>
                <TableCell sx={{ width: "24%" }}>Display unit</TableCell>
                <TableCell sx={{ width: "14%" }}>Parameter</TableCell>
                <TableCell sx={{ width: "34%" }}>Unit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.flatMap((group) =>
                group.parameters.map((parameter, index) => (
                  <TableRow key={`${group.type}-${parameter.key}`}>
                    {index === 0 && (
                      <>
                        <TableCell rowSpan={group.parameters.length}>
                          {group.name}
                        </TableCell>
                        <TableCell rowSpan={group.parameters.length}>
                          <ToggleButtonGroup
                            value={preferences.rateUnits[group.type]}
                            exclusive
                            size="small"
                            onChange={(_, rateUnits: RateUnits | null) =>
                              rateUnits && setRateUnits(group.type, rateUnits)
                            }
                            aria-label={`Units of ${group.name}`}
                            sx={toggleSx}
                          >
                            <ToggleButton
                              value="Molecule"
                              aria-label={`use molecule units for ${group.name}`}
                            >
                              molecule
                            </ToggleButton>
                            <ToggleButton
                              value="SI"
                              aria-label={`use SI units for ${group.name}`}
                            >
                              mol
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </TableCell>
                      </>
                    )}
                    <TableCell>{parameter.label}</TableCell>
                    <TableCell>
                      <GenericRateUnit
                        rateUnits={preferences.rateUnits[group.type]}
                        offset={parameter.offset}
                      />
                    </TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography
          color="textSecondary"
          variant="body2"
          sx={{ paddingTop: theme.spacing(1) }}
        >
          n is the order of the reaction: the sum of the reactant coefficients.
          The other parameters, for example Ea and k0 B, do not change.
        </Typography>
      </ListItem>
    </List>
  );
};

export default Settings;
