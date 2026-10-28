export const primaryTabs = [
  { id: "home", path: "/", label: "tabHome", icon: "home" },
  { id: "identify", path: "/identify", label: "tabIdentify", icon: "scan" },
  { id: "nearby", path: "/nearby", label: "tabPoints", icon: "nearby" },
  { id: "settings", path: "/settings", label: "tabSettings", icon: "settings" },
] as const;

export type PrimaryTab = (typeof primaryTabs)[number]["id"];

/** Capture/review flows keep their own back/cancel controls and all available space. */
export function activeTab(path: string): PrimaryTab | null {
  switch (path) {
    case "/":
    case "/guide":
      return "home";
    case "/identify":
      return "identify";
    case "/nearby":
      return "nearby";
    case "/settings":
    case "/history":
    case "/legal":
      return "settings";
    default:
      return null;
  }
}

export function navigationUsesTwoRows(width: number, fontScale: number): boolean {
  return fontScale >= 1.5 || width < 360;
}

/** Location intent exists only for an explicit, non-selected Points press. */
export function tabNavigation(currentPath: string, target: PrimaryTab) {
  const tab = primaryTabs.find(({ id }) => id === target);
  if (!tab || currentPath === tab.path) return null;
  return { path: tab.path, requestLocation: target === "nearby" };
}
