import { lightPalette as palette } from "./palettes";

/** Home and utility screens intentionally share the same presentation tokens. */
export const homeColors = {
  canvas: palette.bgCanvas,
  ink: palette.textPrimary,
  muted: palette.textSecondary,
  link: palette.actionLink,
} as const;
