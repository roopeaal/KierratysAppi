import { useColorScheme } from "react-native";
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
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export function useAppTheme(): { palette: AppPalette; isDark: boolean } {
  const isDark = useColorScheme() === "dark";
  return { palette: isDark ? darkPalette : lightPalette, isDark };
}
