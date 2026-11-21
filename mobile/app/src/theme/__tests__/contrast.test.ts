import { describe, expect, it } from "vitest";
import { homeColors } from "../home-colors";
import { lightPalette } from "../palettes";

describe("theme contrast", () => {
  it.each([
    ["Home ink", homeColors.ink, homeColors.canvas],
    ["Home muted", homeColors.muted, homeColors.canvas],
    ["Home white-card copy", homeColors.muted, "#FFFFFF"],
    ["Home leaf-panel copy", homeColors.muted, "#DFF4E7"],
    ["Home links", homeColors.link, homeColors.canvas],
    ["Home pressed-card copy", homeColors.ink, lightPalette.pineSoft],
    ["Home pressed-card details", homeColors.muted, lightPalette.pineSoft],
    ["Home focus ring", homeColors.link, lightPalette.bgSurface],
  ])("keeps %s at AA without changing semantic result colors", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
  it.each([
    ["light ink", lightPalette.ink, lightPalette.background],
    ["light muted", lightPalette.muted, lightPalette.background],
    ["light placeholder", lightPalette.faint, lightPalette.surfaceRaised],
    ["light pine status", lightPalette.pine, lightPalette.pineSoft],
    ["light cobalt status", lightPalette.cobalt, lightPalette.cobaltSoft],
    ["light amber status", lightPalette.amber, lightPalette.amberSoft],
    ["light brick status", lightPalette.brick, lightPalette.brickSoft],
    ["light primary button", lightPalette.onStrong, lightPalette.pine],
    ["Scan action supporting text", "#DCEEE2", lightPalette.actionPrimary],
  ])("keeps %s at WCAG AA for normal text", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["light semantic primary text", lightPalette.textPrimary, lightPalette.bgCanvas],
    ["light semantic secondary text", lightPalette.textSecondary, lightPalette.bgCanvas],
    ["light semantic link", lightPalette.actionLink, lightPalette.bgCanvas],
    ["light scan tile and primary button", lightPalette.onStrong, lightPalette.actionPrimary],
    ["light white-surface body", lightPalette.textPrimary, lightPalette.bgSurface],
    ["light white-surface provenance", lightPalette.textSecondary, lightPalette.bgSurface],
    ["light material pictograms", lightPalette.textPrimary, lightPalette.pineSoft],
  ])("keeps %s at WCAG AA", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["light strong border", lightPalette.borderStrong, lightPalette.bgCanvas],
    ["light input boundary", lightPalette.borderStrong, lightPalette.bgElevated],
  ])("keeps %s distinguishable", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(3);
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
