import { AccessibilityInfo, Platform } from "react-native";

type AnnouncementPriority = "default" | "high";

export function announceAccessibility(
  message: string,
  priority: AnnouncementPriority = "default",
): void {
  if (Platform.OS !== "ios") return;

  AccessibilityInfo.announceForAccessibilityWithOptions(
    message,
    priority === "high" ? { priority } : { priority, queue: true },
  );
}
