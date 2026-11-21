import { describe, expect, it } from "vitest";
import { homeReferenceLayout, homeShortcutGrid } from "../home-layout";

describe("reference Home layout", () => {
  it("keeps the corner motto and camera badge at normal phone width", () => {
    expect(homeReferenceLayout(390, 1)).toMatchObject({
      showMotto: true,
      showCamera: true,
      expandedText: false,
    });
  });
  it("drops optional artwork to leave room for text at narrow widths and larger text", () => {
    expect(homeReferenceLayout(320, 1)).toMatchObject({ showMotto: false, showCamera: false });
    expect(homeReferenceLayout(390, 1.5)).toMatchObject({
      showMotto: false,
      showCamera: false,
      expandedText: true,
    });
  });
  it("never trades away a shortcut's touch-target floor", () => {
    expect(homeShortcutGrid.height).toBeGreaterThanOrEqual(44);
  });
});
