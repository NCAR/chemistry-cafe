import {
  createTheme,
  CssVarsThemeOptions,
  Theme,
  ThemeOptions,
  ThemeProvider,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
// Augments MUI's Components type with MuiDataGrid so its styleOverrides can
// be set below, without pulling in the whole package as a dependency here.
import type {} from "@mui/x-data-grid/themeAugmentation";
import {
  createContext,
  useState,
  useContext,
  useLayoutEffect,
  ReactNode,
} from "react";

// NSF NCAR / UCAR brand colors. See the Vermilion NSF NCAR-UCAR-UCP Brand
// Style Guide. These are fixed brand values, not user-configurable.
const ncarBlue = "#0057C2";
const darkBlue = "#00357A";
const lightBlue = "#42C0FF";
const orange = "#FAA119";
const ink = "#1F2937";
const muted = "#5F6368";
// Dark-mode surfaces. The brand's own "Dark Blue" and "Space" swatches are
// meant for large hero blocks, not for every card and panel in a dense UI,
// and tinting every surface toward navy read as "very blue" rather than
// dark. Dark mode instead uses neutral near-black grays, the same values
// Material Design's own dark theme uses, so Light Blue and Orange stay the
// only colors in the interface.
const nearBlack = "#121212";
const darkSurface = "#1E1E1E";
const lightGrey = "#B3B3B3";

export type ColorModePreference = "system" | "light" | "dark";

export type AppearanceSettings = {
  fontSize?: number;
  // The user's raw preference: "system" follows the OS/browser setting.
  colorModePreference?: ColorModePreference;
  // The resolved mode ("light" or "dark") that the theme and the rest of the
  // app actually render with. Kept separate from colorModePreference so a
  // "system" preference can still resolve to a concrete value everywhere.
  mode?: "light" | "dark";
  fontFamily?: string;
};

// Type used by createTheme() for the theming options
type ThemeOptionsType = Omit<ThemeOptions, "components"> &
  Pick<
    CssVarsThemeOptions,
    "defaultColorScheme" | "colorSchemes" | "components"
  > & {
    cssVariables?:
      | boolean
      | Pick<
          CssVarsThemeOptions,
          | "colorSchemeSelector"
          | "rootSelector"
          | "disableCssColorScheme"
          | "cssVarPrefix"
          | "shouldSkipGeneratingVar"
        >;
  };

export const dyslexiaFontFamily: string =
  "OpenDyslexic3,Comic Sans MS,Arial,Helvetica,sans-serif !important";

const brandFontFamily = '"Poppins", "Helvetica", "Arial", sans-serif';

export const defaultAppearanceSettings: Readonly<AppearanceSettings> =
  Object.freeze({
    fontSize: 14,
    colorModePreference: "system",
    mode: "light",
  });

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function resolveMode(
  preference: ColorModePreference | undefined,
): "light" | "dark" {
  if (preference === "light" || preference === "dark") {
    return preference;
  }
  return systemPrefersDark() ? "dark" : "light";
}

const getThemeOptions = (settings: AppearanceSettings): ThemeOptionsType => {
  const mode = settings.mode ?? "light";
  const isDark = mode === "dark";

  return {
    palette: {
      mode,
      primary: {
        main: isDark ? lightBlue : ncarBlue,
        // On dark backgrounds Light Blue is the approved brand accent, and it
        // needs a dark foreground to stay readable (see the brand guide's Web
        // Content Accessibility Guidelines page).
        contrastText: isDark ? darkBlue : "#FFFFFF",
      },
      secondary: {
        main: orange,
        // Dark Blue reads at 5.7:1 on Orange per the brand guide; white does not.
        contrastText: darkBlue,
      },
      background: {
        default: isDark ? nearBlack : "#FFFFFF",
        paper: isDark ? darkSurface : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#FFFFFF" : ink,
        secondary: isDark ? lightGrey : muted,
      },
      divider: isDark ? "rgba(255, 255, 255, 0.16)" : "#D8D6D2",
    },
    typography: {
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily ?? brandFontFamily,
      h1: { fontWeight: 700, color: isDark ? "#FFFFFF" : darkBlue },
      h2: { fontWeight: 700, color: isDark ? "#FFFFFF" : darkBlue },
      h3: { fontWeight: 700, color: isDark ? "#FFFFFF" : darkBlue },
      h4: { fontWeight: 700, color: isDark ? "#FFFFFF" : darkBlue },
      h5: { fontWeight: 600, color: isDark ? "#FFFFFF" : darkBlue },
      h6: { fontWeight: 600, color: isDark ? "#FFFFFF" : darkBlue },
      button: { fontWeight: 600, textTransform: "none" },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            boxShadow: "none",
          },
        },
        variants: [
          // The one true call-to-action: an outline that fills solid on
          // hover. Reserved for variant="contained" with the default
          // (primary) color, so only the main action on a screen gets this
          // treatment.
          {
            props: { variant: "contained", color: "primary" },
            style: ({ theme }: { theme: Theme }) => ({
              backgroundColor: theme.palette.background.paper,
              border: `2px solid ${theme.palette.primary.main}`,
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                border: `2px solid ${theme.palette.primary.main}`,
              },
            }),
          },
          {
            props: { variant: "contained", color: "secondary" },
            style: ({ theme }: { theme: Theme }) => ({
              backgroundColor: theme.palette.background.paper,
              border: `2px solid ${theme.palette.secondary.main}`,
              color:
                theme.palette.secondary.dark ?? theme.palette.secondary.main,
              "&:hover": {
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
                border: `2px solid ${theme.palette.secondary.main}`,
              },
            }),
          },
          {
            props: { variant: "contained", color: "error" },
            style: ({ theme }: { theme: Theme }) => ({
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.error.main}`,
              color: theme.palette.error.main,
              "&:hover": {
                backgroundColor: theme.palette.error.light,
                border: `1px solid ${theme.palette.error.main}`,
              },
            }),
          },
          // A neutral, quiet outline for supporting actions. Does not invert
          // to a solid fill on hover, it just gets a soft highlight.
          {
            props: { variant: "outlined" },
            style: ({ theme }: { theme: Theme }) => ({
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
                borderColor: theme.palette.divider,
              },
            }),
          },
        ],
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            // A full rectangular outline makes the table read as a boxed
            // widget dropped onto the page instead of part of it. Drop the
            // outer border and let the row dividers (still visible, see
            // below) and the surrounding page layout define the table's
            // edges instead.
            borderStyle: "none",
            // The default row/cell divider color is tuned for subtle
            // borders like modal outlines, and reads as barely visible on a
            // dense data table. Use the app's established neutral gray
            // instead, which is legible against both light and dark
            // surfaces.
            "--DataGrid-rowBorderColor": lightGrey,
            // Matches the column header/pinned-row background to the same
            // surface the body uses, so there's no seam between them (this
            // only differs from the default in dark mode; background.paper
            // and background.default are equal in light mode).
            "--DataGrid-containerBackground": isDark ? darkSurface : "#FFFFFF",
          },
        },
      },
    },
  };
};

interface CustomThemeContextProps {
  theme: Theme;
  appearanceSettings: AppearanceSettings;
  setAppearanceSettings: (themeOptions: AppearanceSettings) => void;
}

const CustomThemeContext = createContext<CustomThemeContextProps | undefined>(
  undefined,
);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const [appearanceSettings, setAppearanceSettingsState] =
    useState<AppearanceSettings>(defaultAppearanceSettings);
  const [theme, setTheme] = useState<Theme>(() => {
    const storedOptions = localStorage.getItem("appearanceSettings");
    try {
      const stored: AppearanceSettings =
        typeof storedOptions == "string"
          ? JSON.parse(storedOptions)
          : defaultAppearanceSettings;
      const settings: AppearanceSettings = {
        ...defaultAppearanceSettings,
        ...stored,
        mode: resolveMode(stored.colorModePreference),
      };
      setAppearanceSettingsState(settings);
      return createTheme(getThemeOptions(settings));
    } catch (err) {
      console.error(`Issue parsing theme options: ${err}`);
      localStorage.removeItem("appearanceSettings");
      return createTheme(getThemeOptions(defaultAppearanceSettings));
    }
  });

  // Public setter: any caller that changes colorModePreference gets it
  // immediately resolved to a concrete light/dark mode, so every existing
  // consumer that reads appearanceSettings.mode keeps working unchanged.
  const setAppearanceSettings = (settings: AppearanceSettings) => {
    setAppearanceSettingsState({
      ...settings,
      mode: resolveMode(settings.colorModePreference),
    });
  };

  useLayoutEffect(() => {
    const createdTheme = createTheme(getThemeOptions(appearanceSettings));
    setTheme(createdTheme);
    localStorage.setItem(
      "appearanceSettings",
      JSON.stringify(appearanceSettings),
    );
  }, [appearanceSettings]);

  // Follow the OS/browser preference live while the user has not overridden it.
  useLayoutEffect(() => {
    if (
      appearanceSettings.colorModePreference !== "system" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      setAppearanceSettingsState((current) => ({
        ...current,
        mode:
          current.colorModePreference === "system"
            ? resolveMode("system")
            : current.mode,
      }));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [appearanceSettings.colorModePreference]);

  return (
    <CustomThemeContext.Provider
      value={{ theme, appearanceSettings, setAppearanceSettings }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CustomThemeContext.Provider>
  );
};

export const useCustomTheme = () => {
  const context = useContext(CustomThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
