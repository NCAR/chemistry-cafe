import {
  createTheme,
  CssVarsThemeOptions,
  Theme,
  ThemeOptions,
  ThemeProvider,
} from "@mui/material";
import { red } from "@mui/material/colors";
import {
  createContext,
  useState,
  useContext,
  useLayoutEffect,
  ReactNode,
} from "react";

export type AppearanceSettings = {
  fontSize?: number;
  mode?: "light" | "dark";
  primaryColor?: string;
  secondaryColor?: string;
  infoColor?: string;
  errorColor?: string;
  fontFamily?: string;
  theme?: string;
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

export const defaultAppearanceSettings: Readonly<AppearanceSettings> =
  Object.freeze({
    fontSize: 14,
    mode: "light",
    primaryColor: "#1976d2",
    secondaryColor: "#edc4ff",
    infoColor: "#03F4FC",
    errorColor: red[500],
    theme: "default",
  });

export const defaultColorSettings: Readonly<AppearanceSettings> =
  Object.freeze({
    primaryColor: defaultAppearanceSettings.primaryColor,
    secondaryColor: defaultAppearanceSettings.secondaryColor,
    infoColor: defaultAppearanceSettings.infoColor,
    errorColor: defaultAppearanceSettings.errorColor,
    theme: defaultAppearanceSettings.theme,
  })

export const lowSaturationColors: Readonly<AppearanceSettings> =
  Object.freeze({
    primaryColor: '#416f9d',
    secondaryColor: '#dfcae8',
    infoColor: '#62dbdf',
    errorColor: '#ae554f',
    theme: 'low saturation'
  });

export const highSaturationColors: Readonly<AppearanceSettings> =
  Object.freeze({
    primaryColor: '#0083ff',
    secondaryColor: '#ffb7ff',
    infoColor: '#00ffff',
    errorColor: '#ff1e04',
    theme: 'high saturation',
  })

export const monochromeColors: Readonly<AppearanceSettings> =
    Object.freeze({
        primaryColor: '#696969',
        secondaryColor: '#d1d1d1',
        infoColor: '#c1c1c1',
        errorColor: '#686868',
        theme: 'monochrome',
    })

const getThemeOptions = (settings: AppearanceSettings): ThemeOptionsType => ({
  palette: {
    mode: settings.mode,
    ...(settings.mode === "light" ? {} : {}),
    primary: {
      main: settings.primaryColor ?? defaultAppearanceSettings.primaryColor!,
    },
    secondary: {
      main:
        settings.secondaryColor ?? defaultAppearanceSettings.secondaryColor!,
    },
    info: {
      main: settings.infoColor ?? defaultAppearanceSettings.infoColor!,
    },
    error: {
      main: settings.errorColor ?? defaultAppearanceSettings.errorColor!,
    },
  },
  typography: {
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
  },
});

interface CustomThemeContextProps {
  theme: Theme;
  appearanceSettings: AppearanceSettings;
  setAppearanceSettings: (themeOptions: AppearanceSettings) => void;
}

const CustomThemeContext = createContext<CustomThemeContextProps | undefined>(
  undefined,
);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const [appearanceSettings, setAppearanceSettings] =
    useState<AppearanceSettings>(defaultAppearanceSettings);
  const [theme, setTheme] = useState<Theme>(() => {
    const storedOptions = localStorage.getItem("appearanceSettings");
    try {
      const settings =
        typeof storedOptions == "string"
          ? JSON.parse(storedOptions)
          : defaultAppearanceSettings;
      setAppearanceSettings(settings);
      return createTheme(getThemeOptions(settings));
    } catch (err) {
      console.error(`Issue parsing theme options: ${err}`);
      localStorage.removeItem("appearanceSettings");
      return createTheme(getThemeOptions(defaultAppearanceSettings));
    }
  });

  useLayoutEffect(() => {
    const themeOptions = getThemeOptions(
      appearanceSettings ?? defaultAppearanceSettings,
    );
    const createdTheme = createTheme(themeOptions);
    setTheme(createdTheme);
    localStorage.setItem(
      "appearanceSettings",
      JSON.stringify(appearanceSettings ?? defaultAppearanceSettings),
    );
  }, [appearanceSettings]);

  createTheme();
  return (
    <CustomThemeContext.Provider
      value={{ theme, appearanceSettings, setAppearanceSettings }}
    >
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
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
