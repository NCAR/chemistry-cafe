import { createTheme, CssVarsThemeOptions, Theme, ThemeOptions, ThemeProvider } from "@mui/material";
import {
    createContext,
    useState,
    useContext,
    useLayoutEffect,
    ReactNode,
} from "react"

type ThemeOptionsType = Omit<ThemeOptions, "components"> &
    Pick<CssVarsThemeOptions, "defaultColorScheme" | "colorSchemes" | "components"> & {
        cssVariables?: boolean | Pick<CssVarsThemeOptions, "colorSchemeSelector" | "rootSelector" | "disableCssColorScheme" | "cssVarPrefix" | "shouldSkipGeneratingVar">;
    };

interface CustomThemeContextProps {
    theme: Theme;
    themeOptions: ThemeOptionsType | null;
    setThemeOptions: (themeOptions: ThemeOptionsType | null) => void
}

const CustomThemeContext = createContext<CustomThemeContextProps | undefined>(undefined);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const storedOptions = localStorage.getItem("themeOptions");
        try {
            const options = typeof (storedOptions) == "string" ? JSON.parse(storedOptions) : {};
            return createTheme(options);
        }
        catch (err) {
            console.error(`Issue parsing theme options: ${err}`)
            localStorage.removeItem("themeOptions");
            return createTheme({});
        }
    });
    const [themeOptions, setThemeOptions] = useState<ThemeOptionsType | null>(null);

    useLayoutEffect(() => {
        setTheme(createTheme(themeOptions ?? {}));
        if (!themeOptions) {
            localStorage.removeItem("themeOptions");
            return;
        }
        localStorage.setItem("themeOptions", JSON.stringify(themeOptions));
    }, [themeOptions]);

    createTheme()
    return (
        <CustomThemeContext.Provider value={{ theme, themeOptions, setThemeOptions }}>
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