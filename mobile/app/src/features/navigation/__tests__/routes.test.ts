import { describe, expect, it } from "vitest";
import { activeTab, navigationUsesTwoRows, primaryTabs, tabNavigation } from "../routes";

describe("integrated primary navigation", () => {
  it("points all four tabs at real current routes without copying the old map/profile flows", () => {
    expect(primaryTabs.map(({ path }) => path)).toEqual(["/", "/identify", "/nearby", "/settings"]);
    expect(new Set(primaryTabs.map(({ id }) => id)).size).toBe(4);
    expect(activeTab("/guide")).toBe("home");
    expect(activeTab("/history")).toBe("settings");
    expect(activeTab("/legal")).toBe("settings");
  });

  it("hides tabs during capture, consent, material confirmation and transient result flows", () => {
    for (const path of [
      "/scan",
      "/photo",
      "/manual",
      "/result",
      "/component",
      "/material-code",
      "/feedback",
      "/missing",
    ])
      expect(activeTab(path)).toBeNull();
  });

  it("does not trigger GPS from route selection, a URL or pressing an already-selected tab", () => {
    expect(activeTab("/nearby")).toBe("nearby");
    expect(tabNavigation("/nearby", "nearby")).toBeNull();
    expect(tabNavigation("/", "home")).toBeNull();
    expect(tabNavigation("/", "nearby")).toEqual({ path: "/nearby", requestLocation: true });
    expect(tabNavigation("/nearby", "identify")).toEqual({
      path: "/identify",
      requestLocation: false,
    });
  });

  it("gives large text two rows rather than shrinking, hiding or truncating tab labels", () => {
    expect(navigationUsesTwoRows(390, 1)).toBe(false);
    expect(navigationUsesTwoRows(320, 1.3)).toBe(true);
    expect(navigationUsesTwoRows(430, 2)).toBe(true);
    expect(navigationUsesTwoRows(1280, 1)).toBe(false);
  });
});
