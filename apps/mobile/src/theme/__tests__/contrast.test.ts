import { describe, expect, it } from "vitest";
import { darkPalette, lightPalette } from "../palettes";

describe("theme contrast", () => {
  it.each([
    ["light ink", lightPalette.ink, lightPalette.background],
    ["light muted", lightPalette.muted, lightPalette.background],
    ["light placeholder", lightPalette.faint, lightPalette.surfaceRaised],
    ["light pine status", lightPalette.pine, lightPalette.pineSoft],
    ["light cobalt status", lightPalette.cobalt, lightPalette.cobaltSoft],
    ["light amber status", lightPalette.amber, lightPalette.amberSoft],
    ["light brick status", lightPalette.brick, lightPalette.brickSoft],
    ["light primary button", lightPalette.onStrong, lightPalette.pine],
    ["dark ink", darkPalette.ink, darkPalette.background],
    ["dark muted", darkPalette.muted, darkPalette.background],
    ["dark placeholder", darkPalette.faint, darkPalette.surfaceRaised],
    ["dark pine status", darkPalette.pine, darkPalette.pineSoft],
    ["dark cobalt status", darkPalette.cobalt, darkPalette.cobaltSoft],
    ["dark amber status", darkPalette.amber, darkPalette.amberSoft],
    ["dark brick status", darkPalette.brick, darkPalette.brickSoft],
    ["dark primary button", darkPalette.onStrong, darkPalette.pine],
  ])("keeps %s at WCAG AA for normal text", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}
