import { describe, expect, it } from "vitest";
import { navigationAnimation } from "../motion";

describe("motion accessibility", () => {
  it("removes navigation motion when the system preference requests it", () => {
    expect(navigationAnimation(true)).toBe("none");
    expect(navigationAnimation(false)).toBe("fade_from_bottom");
  });
});
