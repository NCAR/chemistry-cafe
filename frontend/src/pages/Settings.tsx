import { Header, Footer } from "../components/HeaderFooter";
import "../styles/Settings.css";
import {
  useCustomTheme,
  dyslexiaFontFamily,
  ColorModePreference,
} from "../components/CustomThemeContext";
import {
  Box,
  Container,
  Divider,
  Paper,
  Slider,
  Stack,
  Switch,
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
  Tab,
  Tabs,
} from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useAuth } from "../components/AuthContext.tsx";
import { APIUser } from "../API/API_Interfaces.tsx";
import { updateUser } from "../API/API_UpdateMethods.tsx";
import { AUTH_URL } from "../API/API_config.tsx";
import GoogleIcon from "@mui/icons-material/Google";
import OrcidImage from "../assets/ORCID-iD_icon_vector.svg";
import { useUserPreferences } from "../components/UserPreferencesContext";
import { GenericRateUnit } from "../components/RateUnitText";
import {
  rateUnitParameters,
  RateUnitReactionType,
  rateUnitReactionTypes,
  RateUnits,
  RateUnitsByType,
} from "../helpers/rateUnits";
import { reactionTypeToString } from "../helpers/stringify";
import {
  ActivationParameter,
  activationUnits,
} from "../helpers/activationEnergy";
import { reactionAttributeOptions } from "../types/chemistryModels";
import { readRememberedView, rememberView } from "../helpers/rememberedView";

const settingsTabs = [
  "appearance",
  "units",
  "rateParameters",
  "profile",
] as const;
type SettingsTab = (typeof settingsTabs)[number];

const viewKey = "settingsView";

const readSettingsTab = (): SettingsTab => {
  const tab = readRememberedView(viewKey);
  return settingsTabs.includes(tab as SettingsTab)
    ? (tab as SettingsTab)
    : "appearance";
};

const Settings = () => {
  const [selectedTab, setSelectedTab] = useState<SettingsTab>(readSettingsTab);
  const { user: loggedInUser } = useAuth(); // Get logged in user info from AuthContext

  // The profile tab is only for logged in users. After a logout, the page
  // shows the first tab.
  const tab =
    selectedTab === "profile" && !loggedInUser ? "appearance" : selectedTab;

  return (
    <div className="layout-settings">
      <header>
        <Header />
      </header>
      <Container
        component="section"
        maxWidth="md"
        className="content-settings"
        sx={{ py: 2 }}
      >
        <Paper variant="outlined">
          <Tabs
            value={tab}
            onChange={(_, value: SettingsTab) => {
              setSelectedTab(value);
              rememberView(viewKey, value);
            }}
            aria-label="Settings tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Appearance" value="appearance" />
            <Tab label="Units" value="units" />
            <Tab label="Rate Parameters" value="rateParameters" />
            {loggedInUser && <Tab label="Profile" value="profile" />}
          </Tabs>
          <Box sx={{ px: 2, py: 1 }}>
            {tab === "appearance" && <AppearanceMenu />}
            {tab === "units" && <UnitsMenu />}
            {tab === "rateParameters" && <RateParametersMenu />}
            {tab === "profile" && <ProfileMenu />}
          </Box>
        </Paper>
      </Container>

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

/** One setting: a title and a description on the left, the control on the right. */
const SettingRow = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      columnGap: 2,
      rowGap: 1,
      py: 1.5,
    }}
  >
    <Box sx={{ flex: 1, minWidth: "14em" }}>
      <Typography color="textPrimary">{title}</Typography>
      {description && (
        <Typography color="textSecondary" variant="body2">
          {description}
        </Typography>
      )}
    </Box>
    {children}
  </Box>
);

const toggleSx = { "& .MuiToggleButton-root": { textTransform: "none" } };

const ProfileMenu = () => {
  const { user: loggedInUser } = useAuth(); // Get logged in user info from AuthContext
  const userCopy = { ...loggedInUser } as APIUser;
  const [user, setUser] = useState(userCopy);
  useEffect(() => {
    setUser(userCopy);
  }, [loggedInUser]);

  if (!loggedInUser) {
    return null;
  }

  return (
    <Stack divider={<Divider flexItem />}>
      <Box sx={{ py: 1.5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            size="small"
            label="Username"
            required
            defaultValue={loggedInUser.username}
            onChange={(e) =>
              setUser((p) => ({ ...p, username: e.target.value }))
            }
          />
          <TextField
            size="small"
            label="Email"
            required
            defaultValue={loggedInUser.email}
            onChange={(e) => setUser((p) => ({ ...p, email: e.target.value }))}
          />
          <TextField
            size="small"
            label="First Name"
            required
            defaultValue={loggedInUser.firstName}
            onChange={(e) =>
              setUser((p) => ({ ...p, firstName: e.target.value }))
            }
          />
          <TextField
            size="small"
            label="Last Name"
            required
            defaultValue={loggedInUser.lastName}
            onChange={(e) =>
              setUser((p) => ({ ...p, lastName: e.target.value }))
            }
          />
        </Box>
        <Button
          sx={{ mt: 2 }}
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
      </Box>
      <SettingRow
        title="Link a login"
        description="Log in to Chemistry Cafe with this account through another provider."
      >
        <Box>
          <IconButton
            title={"Link to Google"}
            disabled={!!loggedInUser.googleId}
            component={"button"}
            color="primary"
            onClick={() => window.location.assign(`${AUTH_URL}/google/login`)}
          >
            <GoogleIcon fontSize="small" />
          </IconButton>
          <IconButton
            title={"Link to ORCID"}
            disabled={!!loggedInUser.orcidId}
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
                filter: loggedInUser.orcidId ? "grayscale(100%)" : "",
              }}
            />
          </IconButton>
        </Box>
      </SettingRow>
      <SettingRow
        title="Merge accounts"
        description="Merge in the Chemistry Cafe account of another login. The other account is deleted."
      >
        <Box>
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
        </Box>
      </SettingRow>
    </Stack>
  );
};

const AppearanceMenu = () => {
  const { appearanceSettings, setAppearanceSettings } = useCustomTheme();
  const [fontSliderValue, setFontSliderValue] = useState(
    appearanceSettings.fontSize,
  );

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

  return (
    <Stack divider={<Divider flexItem />}>
      <SettingRow
        title="Theme"
        description="Follow your system setting, or choose light or dark."
      >
        <ToggleButtonGroup
          value={appearanceSettings?.colorModePreference ?? "system"}
          exclusive
          size="small"
          onChange={setColorModePreference}
          aria-label="Color theme preference"
          sx={toggleSx}
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
      </SettingRow>
      <SettingRow title="Font size">
        <Box sx={{ display: "flex", alignItems: "center", columnGap: 2 }}>
          <Slider
            aria-label="Font size"
            sx={{ width: 180 }}
            track={false}
            value={fontSliderValue ?? 12}
            min={5}
            max={50}
            valueLabelDisplay="auto"
            onChange={(_, value) => {
              setFontSliderValue(Number(value));
            }}
            onChangeCommitted={(_, value) => {
              setFontSize(Number(value));
            }}
          />
          <Input
            value={fontSliderValue ?? ""}
            size="small"
            sx={{ width: "4em" }}
            onChange={(e) => {
              const n: number = Number.parseInt(e.target.value);
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
              "aria-label": "Font size value",
              step: 2,
              min: 5,
              max: 50,
              type: "number",
            }}
          />
        </Box>
      </SettingRow>
      <SettingRow
        title="Dyslexia font"
        description="Use a font that is easier to read for some people with dyslexia."
      >
        <Switch
          checked={Boolean(appearanceSettings?.fontFamily)}
          onChange={toggleDyslexiaFont}
          inputProps={{ "aria-label": "Dyslexia Font" }}
        />
      </SettingRow>
    </Stack>
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

  return (
    <>
      <SettingRow
        title="Concentration units"
        description="The reaction editor shows and accepts the parameters below in the unit of their reaction type. Chemistry Cafe always stores SI values."
      >
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
      </SettingRow>
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
        sx={{ py: theme.spacing(1) }}
      >
        n is the order of the reaction: the sum of the reactant coefficients.
        The other parameters, for example Ea and k0 B, do not change.
      </Typography>
    </>
  );
};

const RateParametersMenu = () => {
  const { preferences, setPreferences } = useUserPreferences();

  return (
    <SettingRow
      title="Activation energy"
      description={
        <>
          Choose whether you enter Ea ({activationUnits.Ea}) or C (
          {activationUnits.C}) for Arrhenius and Taylor Series reactions, with C
          = −Ea / k<sub>B</sub>.
        </>
      }
    >
      <ToggleButtonGroup
        value={preferences.activationParameter}
        exclusive
        size="small"
        onChange={(_, parameter: ActivationParameter | null) =>
          parameter &&
          setPreferences({ ...preferences, activationParameter: parameter })
        }
        aria-label="Activation parameter"
        sx={toggleSx}
      >
        <ToggleButton value="Ea" aria-label="enter Ea">
          Ea
        </ToggleButton>
        <ToggleButton value="C" aria-label="enter C">
          C
        </ToggleButton>
      </ToggleButtonGroup>
    </SettingRow>
  );
};

export default Settings;
