import { createTheme, CssVarsThemeOptions, Theme, ThemeOptions, ThemeProvider } from "@mui/material";
import {
    createContext,
    useState,
    useContext,
    useLayoutEffect,
    ReactNode,
} from "react"

export type AppearanceSettings = {
    fontSize: number;
    mode: "light" | "dark";
}

// Type used by createTheme() for the theming options
type ThemeOptionsType = Omit<ThemeOptions, 'components'>
    & Pick<CssVarsThemeOptions, 'defaultColorScheme' | 'colorSchemes' | 'components'>
    & { cssVariables?: boolean | Pick<CssVarsThemeOptions, 'colorSchemeSelector' | 'rootSelector' | 'disableCssColorScheme' | 'cssVarPrefix' | 'shouldSkipGeneratingVar'>; }

const defaultAppearanceSettings: AppearanceSettings = {
    fontSize: 10,
    mode: "light"
};

const getThemeOptions = (settings: AppearanceSettings): ThemeOptionsType => ({
    palette: {
        mode: settings.mode,
        ...(settings.mode === "light"
            ? {
            }
            : {
                
            }
        ),
    }
});

interface CustomThemeContextProps {
    theme: Theme;
    appearanceSettings: AppearanceSettings;
    setAppearanceSettings: (themeOptions: AppearanceSettings) => void
}

const CustomThemeContext = createContext<CustomThemeContextProps | undefined>(undefined);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
    const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(defaultAppearanceSettings);
    const [theme, setTheme] = useState<Theme>(() => {
        const storedOptions = localStorage.getItem("appearanceSettings");
        try {
            const settings = typeof (storedOptions) == "string" ? JSON.parse(storedOptions) : defaultAppearanceSettings;
            setAppearanceSettings(settings);
            return createTheme(getThemeOptions(settings));
        }
        catch (err) {
            console.error(`Issue parsing theme options: ${err}`)
            localStorage.removeItem("appearanceSettings");
            return createTheme(getThemeOptions(defaultAppearanceSettings));
        }
    });

    useLayoutEffect(() => {
        const themeOptions = getThemeOptions(appearanceSettings ?? defaultAppearanceSettings);
        const createdTheme = createTheme(themeOptions);
        setTheme(createdTheme);
        localStorage.setItem("appearanceSettings", JSON.stringify(appearanceSettings ?? defaultAppearanceSettings));
    }, [appearanceSettings]);

    createTheme()
    return (
        <CustomThemeContext.Provider value={{ theme, appearanceSettings, setAppearanceSettings }}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </CustomThemeContext.Provider>
    );
}

export const useCustomTheme = () => {
    const context = useContext(CustomThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}