/** Home-only presentation. Semantic result/status colors remain in the app palette. */
export function homeColors(isDark: boolean) {
  return isDark
    ? { canvas: "#14221B", ink: "#F1F5ED", muted: "#C3CDC5", link: "#B4C9F3" }
    : { canvas: "#F5FCFA", ink: "#142C39", muted: "#59688A", link: "#435D95" };
}
