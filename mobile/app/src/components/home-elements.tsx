import { type ComponentProps, type PropsWithChildren, type ReactNode, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import type { GuideMaterial } from "@/features/guide/search";
import { appFontFamily } from "@/theme/fonts";
import { homeColors } from "@/theme/home-colors";
import type { AppPalette } from "@/theme/palettes";
import { focusRing, interaction, radius, useAppTheme } from "@/theme/tokens";
import { ActionIcon, type ActionIconKind } from "./action-icon";
import { homeShortcutGrid } from "./home-layout";
import { MaterialStudy, paperTints } from "./material-study";
import { ReferenceSymbol } from "./reference-symbol";
import { TactilePressable as Pressable } from "./tactile-pressable";
import { AppText as BaseAppText, Chevron } from "./ui";

// The reference uses native, compact sans-serif text. Retain system text scaling.
export const homeFont = appFontFamily;

export function HomeText({ style, ...props }: ComponentProps<typeof BaseAppText>) {
  return (
    <BaseAppText
      {...props}
      style={[
        { fontFamily: homeFont, color: props.muted ? homeColors.muted : homeColors.ink },
        style,
      ]}
    />
  );
}
const AppText = HomeText;

export const homeCard = StyleSheet.create({
  frame: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: homeShortcutGrid.gap },
  title: { fontSize: 14, lineHeight: 20, fontWeight: "700", letterSpacing: -0.25 },
  detail: { fontSize: 12, lineHeight: 17 },
});

export function homeCardFeedback(palette: AppPalette, pressed: boolean, focused: boolean) {
  return {
    backgroundColor: pressed ? palette.pineSoft : palette.bgSurface,
    borderColor: focused ? palette.actionLink : palette.borderSubtle,
    boxShadow: focused ? focusRing(palette) : "none",
  };
}

export function HomeSurface({ children, testID }: PropsWithChildren<{ readonly testID?: string }>) {
  const { palette } = useAppTheme();
  return (
    <View
      testID={testID}
      style={[
        styles.surface,
        {
          backgroundColor: palette.bgSurface,
          boxShadow: "0px 5px 18px rgba(40, 110, 78, 0.07)",
        },
      ]}
    >
      {children}
    </View>
  );
}

export function IconDisc({
  kind,
  blue = false,
  compact = false,
  small = false,
}: {
  readonly kind: ActionIconKind;
  readonly blue?: boolean;
  readonly compact?: boolean;
  readonly small?: boolean;
}) {
  const { palette } = useAppTheme();
  return (
    <View
      style={[
        styles.disc,
        compact && { width: 48, height: 48, borderWidth: 0 },
        small && { width: 32, height: 32, borderWidth: 0 },
        { backgroundColor: blue ? "#E7F5FF" : palette.pineSoft },
      ]}
    >
      <View
        accessible={false}
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        testID={
          ["photo", "nearby", "guide", "scan"].includes(kind) ? `action-icon-${kind}` : undefined
        }
      >
        {kind === "photo" || kind === "nearby" || kind === "guide" || kind === "scan" ? (
          <ReferenceSymbol
            name={
              kind === "photo"
                ? "camera"
                : kind === "nearby"
                  ? "location"
                  : kind === "scan"
                    ? "scan"
                    : "recycling"
            }
            size={small ? 25 : compact ? 35 : 44}
          />
        ) : (
          <ActionIcon kind={kind} />
        )}
      </View>
    </View>
  );
}

export function HomeTile({
  label,
  detail,
  kind,
  onPress,
  testID,
}: {
  readonly label: string;
  readonly detail: string;
  readonly kind: ActionIconKind;
  readonly onPress: () => void;
  readonly testID: string;
}) {
  const { palette } = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={detail}
      testID={testID}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        homeCard.frame,
        homeCard.row,
        styles.tile,
        homeCardFeedback(palette, pressed, focused),
      ]}
    >
      <IconDisc kind={kind} small />
      <View style={styles.grow}>
        <AppText style={homeCard.title}>{label}</AppText>
        <AppText muted style={homeCard.detail}>
          {detail}
        </AppText>
      </View>
      <Chevron />
    </Pressable>
  );
}

export function HomeSectionHeading({
  title,
  action,
  secondaryAction,
  onPress,
  testID,
}: {
  readonly title: string;
  readonly secondaryAction?: ReactNode;
} & (
  | { readonly action: string; readonly onPress: () => void; readonly testID?: string }
  | { readonly action?: never; readonly onPress?: never; readonly testID?: never }
)) {
  const { palette } = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.sectionHeading}>
      <AppText accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </AppText>
      {(secondaryAction || action) && (
        <View style={styles.sectionActions}>
          {secondaryAction}
          {action && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${title}: ${action}`}
              onPress={onPress}
              testID={testID}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={({ pressed }) => [
                styles.sectionAction,
                {
                  opacity: pressed ? interaction.pressedOpacity : 1,
                  borderColor: focused ? palette.actionLink : "transparent",
                },
              ]}
            >
              <AppText style={[styles.caption, { color: homeColors.link }]}>{action}</AppText>
              <Chevron />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export function MaterialChip({
  material,
  label,
  roomy = false,
  minimumHeight,
  onPress,
}: {
  readonly material: GuideMaterial;
  readonly label: string;
  readonly roomy?: boolean;
  readonly minimumHeight?: number;
  readonly onPress: () => void;
}) {
  const { palette } = useAppTheme();
  const { width, fontScale } = useWindowDimensions();
  const narrow = width < 360 && fontScale <= 1.2;
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={`home-material-${material}`}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.chip,
        narrow && styles.compactChip,
        {
          minHeight: minimumHeight ?? 44,
          flexBasis:
            fontScale >= 1.5 ? "100%" : fontScale > 1.2 || width < 360 || roomy ? "47%" : "22%",
          backgroundColor: paperTints[material],
          borderColor: focused ? palette.actionLink : "transparent",
          opacity: pressed ? interaction.pressedOpacity : 1,
        },
      ]}
    >
      <MaterialStudy material={material} size={narrow ? 34 : roomy ? 64 : undefined} />
      <AppText style={[styles.caption, { fontWeight: "500", flexShrink: 1 }]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compactChip: { flexDirection: "row", paddingVertical: 4, gap: 8 },
  surface: { borderRadius: radius.lg, overflow: "hidden" },
  disc: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tile: {
    flex: 1,
    minWidth: 0,
    minHeight: homeShortcutGrid.height,
    gap: 6,
  },
  grow: { flex: 1, minWidth: 0, gap: 2 },
  caption: { fontFamily: homeFont, fontSize: 13, lineHeight: 18 },
  sectionHeading: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  sectionActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
    maxWidth: "100%",
    marginLeft: "auto",
    columnGap: 8,
  },
  sectionTitle: {
    fontFamily: homeFont,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.5,
    fontWeight: "700",
    flexShrink: 1,
  },
  sectionAction: {
    borderWidth: 2,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingLeft: 8,
  },
  chip: {
    flexBasis: "22%",
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 3,
    paddingVertical: 8,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    flexGrow: 1,
  },
});
