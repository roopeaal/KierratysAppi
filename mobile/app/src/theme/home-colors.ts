import { darkPalette, lightPalette } from "./palettes";

/** Home and utility screens intentionally share the same presentation tokens. */
export function homeColors(isDark: boolean) {
  const palette = isDark ? darkPalette : lightPalette;
  return {
    canvas: palette.bgCanvas,
    ink: palette.textPrimary,
    muted: palette.textSecondary,
    link: palette.actionLink,
  };
}
