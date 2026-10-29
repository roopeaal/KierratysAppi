import { Platform } from "react-native";

/** One scalable sans family for Home, forms, guidance and navigation. */
export const appFontFamily = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: "System",
});

/** Codes stay monospaced so similar digits are easier to compare. */
export const codeFontFamily = "IBMPlexMono_600SemiBold";
