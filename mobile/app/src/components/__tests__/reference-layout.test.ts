import { describe, expect, it } from "vitest";
import { photoBackdropLayout } from "../reference-layout";

describe("decorative panel layout", () => {
  it("fits the original leaf panel independently to a responsive card, without adjacent baked cards", () => {
    for (const [width, height] of [
      [358, 112],
      [288, 150],
      [528, 132],
    ]) {
      const crop = photoBackdropLayout(width ?? 358, height ?? 112);
      expect((crop.width / 941) * 846).toBeCloseTo(width ?? 358);
      expect((crop.height / 1672) * 236).toBeCloseTo(height ?? 112);
      expect(crop.top / crop.height).toBeCloseTo(-529 / 1672);
    }
  });
  it("bounds invalid and excessive layout values", () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, -1, 0])
      expect(photoBackdropLayout(value, value)).toEqual(photoBackdropLayout(358, 112));
    expect(photoBackdropLayout(10000, 10000)).toEqual(photoBackdropLayout(560, 1000));
  });
});
