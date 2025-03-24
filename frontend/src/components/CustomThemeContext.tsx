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
  });

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
