import {
  createContext,
  createElement,
  type PropsWithChildren,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { Appearance } from "react-native";
import { createColorSchemeStore } from "./color-scheme-store";
import { type AppPalette, darkPalette, lightPalette } from "./palettes";

export { darkPalette, lightPalette } from "./palettes";

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 18,
  lg: 26,
  pill: 999,
} as const;

export const typography = {
  display: {
    fontFamily: "Atkinson_700Bold",
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: "Atkinson_700Bold",
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  heading: {
    fontFamily: "Atkinson_600SemiBold",
    fontSize: 19,
    lineHeight: 25,
  },
  body: {
    fontFamily: "Atkinson_400Regular",
    fontSize: 17,
    lineHeight: 25,
  },
  small: {
    fontFamily: "Atkinson_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: "Atkinson_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
  },
  mono: {
    fontFamily: "IBMPlexMono_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
} as const;

export const controls = {
  minimumTouchTarget: 44,
  buttonMinHeight: 56,
  inputMinHeight: 60,
} as const;

export const interaction = {
  pressedOpacity: 0.76,
  disabledOpacity: 0.48,
} as const;

export const motion = {
  quick: 120,
  standard: 180,
} as const;

export const elevation = {
  none: 0,
  raised: 2,
} as const;

type AppTheme = { palette: AppPalette; isDark: boolean };
const AppThemeContext = createContext<AppTheme | undefined>(undefined);
const colorSchemeStore = createColorSchemeStore({
  read: Appearance.getColorScheme,
  subscribe: (listener) => Appearance.addChangeListener(listener),
});

export function AppThemeProvider({ children }: PropsWithChildren) {
  const isDark =
    useSyncExternalStore(
      colorSchemeStore.subscribe,
      colorSchemeStore.getSnapshot,
      colorSchemeStore.getServerSnapshot,
    ) === "dark";
  const value = useMemo(() => ({ palette: isDark ? darkPalette : lightPalette, isDark }), [isDark]);
  return createElement(AppThemeContext.Provider, { value }, children);
}

export function useAppTheme(): AppTheme {
  const theme = useContext(AppThemeContext);
  if (!theme) throw new Error("AppThemeProvider is required");
  return theme;
}
