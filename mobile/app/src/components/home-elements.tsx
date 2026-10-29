import { type ComponentProps, type PropsWithChildren, type ReactNode, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import type { GuideMaterial } from "@/features/guide/search";
import { appFontFamily } from "@/theme/fonts";
import { homeColors } from "@/theme/home-colors";
import { interaction, useAppTheme } from "@/theme/tokens";
import { ActionIcon, type ActionIconKind } from "./action-icon";
import { ReferenceSymbol } from "./reference-symbol";
import { AppText as BaseAppText, Chevron } from "./ui";

// The reference uses native, compact sans-serif text. Retain system text scaling.
export const homeFont = appFontFamily;

export function HomeText({ style, ...props }: ComponentProps<typeof BaseAppText>) {
  const { isDark } = useAppTheme();
  const home = homeColors(isDark);
  return (
    <BaseAppText
      {...props}
      style={[{ fontFamily: homeFont, color: props.muted ? home.muted : home.ink }, style]}
    />
  );
}
const AppText = HomeText;

export function HomeSurface({ children, testID }: PropsWithChildren<{ readonly testID?: string }>) {
  const { palette, isDark } = useAppTheme();
  return (
    <View
      testID={testID}
      style={[
        styles.surface,
        {
          backgroundColor: palette.bgSurface,
          boxShadow: isDark ? "none" : "0px 5px 18px rgba(40, 110, 78, 0.07)",
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
}: {
  readonly kind: ActionIconKind;
  readonly blue?: boolean;
  readonly compact?: boolean;
}) {
  const { palette, isDark } = useAppTheme();
  return (
    <View
      style={[
        styles.disc,
        compact && { width: 48, height: 48, borderWidth: 0 },
        { backgroundColor: blue ? (isDark ? palette.cobaltSoft : "#E7F5FF") : palette.pineSoft },
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
            size={compact ? 35 : 44}
            color={isDark ? (blue ? palette.cobalt : palette.actionLink) : undefined}
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
  const { isDark } = useAppTheme();
  const home = homeColors(isDark);
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
        styles.tile,
        {
          backgroundColor: palette.bgSurface,
          borderColor: focused ? palette.actionLink : "transparent",
          opacity: pressed ? interaction.pressedOpacity : 1,
        },
      ]}
    >
      <IconDisc kind={kind} compact />
      <View style={styles.grow}>
        <AppText style={styles.tileTitle}>{label}</AppText>
        <AppText style={[styles.tileCaption, { color: home.muted }]}>{detail}</AppText>
      </View>
      <View
        style={[styles.tileChevron, { backgroundColor: isDark ? palette.bgElevated : "#F0F8F4" }]}
      >
        <Chevron />
      </View>
    </Pressable>
  );
}

export function HomeSectionHeading({
  title,
  action,
  onPress,
  testID,
}: {
  readonly title: string;
  readonly action: string;
  readonly onPress: () => void;
  readonly testID?: string;
}) {
  const { palette } = useAppTheme();
  const { isDark } = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.sectionHeading}>
      <AppText accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </AppText>
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
        <AppText style={[styles.caption, { color: homeColors(isDark).link }]}>{action}</AppText>
        <Chevron />
      </Pressable>
    </View>
  );
}

export function MaterialChip({
  material,
  label,
  onPress,
}: {
  readonly material: GuideMaterial;
  readonly label: string;
  readonly onPress: () => void;
}) {
  const { palette, isDark } = useAppTheme();
  const { width, fontScale } = useWindowDimensions();
  const [focused, setFocused] = useState(false);
  const colors = { plastic: "#E0F2FF", carton: "#FFF0D3", glass: "#E3F4E6", metal: "#EFE7FC" };
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
        {
          flexBasis: fontScale >= 1.5 ? "100%" : fontScale > 1.2 || width < 360 ? "47%" : "22%",
          backgroundColor: isDark ? palette.bgElevated : colors[material],
          borderColor: focused ? palette.actionLink : "transparent",
          opacity: pressed ? interaction.pressedOpacity : 1,
        },
      ]}
    >
      <MaterialSymbol material={material} />
      <AppText style={[styles.caption, { fontWeight: "500", flexShrink: 1 }]}>{label}</AppText>
    </Pressable>
  );
}

/** Decorative material silhouettes, never a product identity or sorting answer. */
function MaterialSymbol({ material }: { readonly material: GuideMaterial }) {
  const { palette } = useAppTheme();
  const border = { borderColor: palette.actionLink };
  const shape: ReactNode =
    material === "plastic" ? (
      <>
        <View style={[styles.bottleCap, border]} />
        <View style={[styles.bottle, border]} />
      </>
    ) : material === "carton" ? (
      <View style={[styles.carton, border]}>
        <View style={[styles.seam, border]} />
      </View>
    ) : (
      <>
        <View style={[styles.lid, border]} />
        <View style={[styles.jar, border, material === "metal" && { borderRadius: 3 }]} />
      </>
    );
  return (
    <View
      accessible={false}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.symbol}
    >
      {shape}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: { borderRadius: 22, overflow: "hidden" },
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
    minHeight: 86,
    borderRadius: 22,
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  grow: { flex: 1, minWidth: 0, gap: 4 },
  tileTitle: {
    fontFamily: homeFont,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    letterSpacing: -0.35,
  },
  caption: { fontFamily: homeFont, fontSize: 13, lineHeight: 18 },
  tileCaption: { fontFamily: homeFont, fontSize: 11.5, lineHeight: 15.5, paddingRight: 10 },
  tileChevron: {
    position: "absolute",
    right: 6,
    bottom: 9,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeading: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
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
    borderRadius: 24,
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    flexGrow: 1,
  },
  symbol: { width: 18, height: 24, alignItems: "center", justifyContent: "center" },
  bottleCap: { width: 7, height: 4, borderWidth: 1.5, borderRadius: 2, marginBottom: -1 },
  bottle: {
    width: 13,
    height: 19,
    borderWidth: 1.5,
    borderRadius: 4,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  carton: { width: 17, height: 21, borderRadius: 2, borderWidth: 1.5 },
  seam: { height: 6, borderBottomWidth: 1.5 },
  lid: { width: 14, height: 3, borderWidth: 1.5, borderRadius: 1, marginBottom: 2 },
  jar: { width: 15, height: 18, borderWidth: 1.5, borderRadius: 4 },
});
