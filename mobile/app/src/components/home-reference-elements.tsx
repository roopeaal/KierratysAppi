import { type ReactNode, useState } from "react";
import { StyleSheet, View } from "react-native";
import { wasteMarkings } from "@/features/sorting/waste-markings";
import { focusRing, useAppTheme } from "@/theme/tokens";
import { ActionIcon } from "./action-icon";
import { HomeText, homeCard, homeCardFeedback } from "./home-elements";
import { MaterialStudy } from "./material-study";
import { TactilePressable as Pressable } from "./tactile-pressable";
import { Chevron } from "./ui";

type QueryIcon = "plastic" | "battery" | "carton" | "electronics";
const chipColors = {
  plastic: wasteMarkings.plastic.tint,
  battery: "#F7E8E9",
  carton: wasteMarkings.carton.tint,
  electronics: "#ECE5F8",
};

export function HomeQueryChip({
  icon,
  label,
  onPress,
}: {
  readonly icon: QueryIcon;
  readonly label: string;
  readonly onPress: () => void;
}) {
  const { palette } = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={`home-query-${icon}`}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: pressed ? palette.pineSoft : chipColors[icon],
          boxShadow: focused ? focusRing(palette) : "none",
        },
      ]}
    >
      <MaterialStudy material={icon === "battery" ? "batteries" : icon} size={19} />
      <HomeText style={styles.chipLabel}>{label}</HomeText>
    </Pressable>
  );
}

export function HomePreviewRow({
  label,
  detail,
  icon,
  thumbnail,
  onPress,
  testID,
  compact = false,
}: {
  readonly label: string;
  readonly detail?: string;
  readonly icon: "history" | "nearby" | "guide";
  readonly thumbnail?: { readonly image: ReactNode; readonly caption?: string };
  readonly onPress: () => void;
  readonly testID?: string;
  readonly compact?: boolean;
}) {
  const { palette } = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={
        thumbnail?.caption ? [detail, thumbnail.caption].filter(Boolean).join(". ") : detail
      }
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      testID={testID}
      style={({ pressed }) => [
        homeCard.frame,
        homeCard.row,
        styles.row,
        homeCardFeedback(palette, pressed, focused),
      ]}
    >
      {thumbnail?.image ?? (
        <View
          aria-hidden
          style={[
            styles.thumb,
            compact && styles.smallThumb,
            { backgroundColor: palette.pineSoft },
          ]}
        >
          <ActionIcon kind={icon} color={palette.pine} />
        </View>
      )}
      <View style={styles.copy}>
        <HomeText variant="label" numberOfLines={compact ? 1 : undefined} style={homeCard.title}>
          {label}
        </HomeText>
        {detail && (
          <HomeText variant="small" muted style={homeCard.detail}>
            {detail}
          </HomeText>
        )}
        {thumbnail?.caption && (
          <HomeText variant="small" muted style={styles.caption}>
            {thumbnail.caption}
          </HomeText>
        )}
      </View>
      <Chevron />
    </Pressable>
  );
}

export function HomePreviewNotice({ children }: { readonly children: ReactNode }) {
  const { palette } = useAppTheme();
  return (
    <View
      style={[
        homeCard.frame,
        styles.notice,
        { backgroundColor: palette.bgSurface, borderColor: palette.borderSubtle },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    paddingVertical: 3,
    gap: 3,
    borderRadius: 24,
  },
  chipLabel: { fontSize: 12, lineHeight: 18, flexShrink: 1 },
  row: { minHeight: 64, flexGrow: 1 },
  thumb: {
    width: 56,
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  smallThumb: { width: 40, minHeight: 44 },
  copy: { flex: 1, minWidth: 0 },
  caption: { fontSize: 11, lineHeight: 16 },
  notice: { padding: 12, gap: 8 },
});
