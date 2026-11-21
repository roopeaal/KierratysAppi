import { describe, expect, it } from "vitest";
import { isPointerActivation, navigationAnimation, pressMotion } from "../motion";

describe("motion accessibility", () => {
  it("removes navigation motion when the system preference requests it", () => {
    expect(navigationAnimation(true)).toBe("none");
    expect(navigationAnimation(false)).toBe("fade_from_bottom");
  });
  it("keeps keyboard and ambiguous assistive activations still", () => {
    for (const event of [
      undefined,
      null,
      { type: "keydown", key: "Enter" },
      { type: "click", detail: 0 },
      { type: "pointerdown", pointerType: "" },
      { type: "press" },
    ]) {
      expect(isPointerActivation(event, true)).toBe(false);
      expect(isPointerActivation(event, false)).toBe(false);
    }
  });
  it("acknowledges a verifiable pointer without large or slow movement", () => {
    expect(isPointerActivation({ type: "touchstart" }, true)).toBe(true);
    expect(isPointerActivation({ type: "mousedown" }, true)).toBe(true);
    expect(isPointerActivation({ type: "click", detail: 1 }, true)).toBe(true);
    expect(isPointerActivation({ changedTouches: [{}] }, false)).toBe(true);
    expect(isPointerActivation({ changedTouches: [] }, false)).toBe(false);
    expect(pressMotion.scale).toBeGreaterThanOrEqual(0.97);
    expect(pressMotion.releaseMs).toBeLessThanOrEqual(160);
  });
});
