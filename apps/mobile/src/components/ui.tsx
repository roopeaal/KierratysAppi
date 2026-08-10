import type { PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/i18n/language-context";
import { radius, spacing, useAppTheme } from "@/theme/tokens";

type TextVariant = "display" | "title" | "heading" | "body" | "small" | "label" | "mono";

export function AppText({
  variant = "body",
  muted = false,
  style,
  ...props
}: TextProps & { readonly variant?: TextVariant; readonly muted?: boolean }) {
  const { palette } = useAppTheme();
  return (
    <Text
      maxFontSizeMultiplier={2.2}
      {...props}
      style={[textStyles[variant], { color: muted ? palette.muted : palette.ink }, style]}
    />
  );
}

export function Screen({
  children,
  scroll = true,
  style,
}: PropsWithChildren<{ readonly scroll?: boolean; readonly style?: StyleProp<ViewStyle> }>) {
  const { palette } = useAppTheme();
  const content = <View style={[styles.content, style]}>{children}</View>;
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={["top", "bottom"]}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

export function BrandLockup({ compact = false }: { readonly compact?: boolean }) {
  const { palette } = useAppTheme();
  const { t } = useLanguage();
  return (
    <View style={styles.brand} accessibilityRole="header">
      <View style={[styles.brandMark, { borderColor: palette.ink }]} accessibilityElementsHidden>
        <View style={[styles.brandMarkTop, { backgroundColor: palette.pine }]} />
        <View style={[styles.brandMarkBottom, { backgroundColor: palette.cobalt }]} />
        <View style={[styles.brandSeam, { backgroundColor: palette.surface }]} />
      </View>
      <View>
        <AppText variant={compact ? "heading" : "title"}>KierrätysAppi</AppText>
        {!compact && (
          <AppText variant="small" muted>
            {t("tagline")}
          </AppText>
        )}
      </View>
    </View>
  );
}

type ButtonProps = {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: "primary" | "secondary" | "quiet" | "danger";
  readonly disabled?: boolean;
  readonly busy?: boolean;
  readonly accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  busy = false,
  accessibilityHint,
}: ButtonProps) {
  const { palette } = useAppTheme();
  const backgrounds = {
    primary: palette.pine,
    secondary: palette.surfaceRaised,
    quiet: "transparent",
    danger: palette.brickSoft,
  };
  const foregrounds = {
    primary: palette.onStrong,
    secondary: palette.ink,
    quiet: palette.cobalt,
    danger: palette.brick,
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: backgrounds[variant],
          borderColor: variant === "secondary" ? palette.line : backgrounds[variant],
          opacity: disabled ? 0.5 : pressed ? 0.78 : 1,
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={foregrounds[variant]} />
      ) : (
        <AppText variant="label" style={{ color: foregrounds[variant], textAlign: "center" }}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

export function Paper({
  children,
  style,
}: PropsWithChildren<{ readonly style?: StyleProp<ViewStyle> }>) {
  const { palette } = useAppTheme();
  return (
    <View
      style={[styles.paper, { backgroundColor: palette.surface, borderColor: palette.line }, style]}
    >
      {children}
    </View>
  );
}

export function Eyebrow({ children, color }: PropsWithChildren<{ readonly color?: string }>) {
  const { palette } = useAppTheme();
  return (
    <AppText variant="mono" style={{ color: color ?? palette.pine }}>
      {children}
    </AppText>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  readonly title: string;
  readonly action?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="heading" style={styles.sectionTitle}>
        {title}
      </AppText>
      {action}
    </View>
  );
}

export function Rule({ style }: { readonly style?: StyleProp<ViewStyle> }) {
  const { palette } = useAppTheme();
  return <View style={[styles.rule, { backgroundColor: palette.line }, style]} />;
}

export function StatusPill({
  label,
  tone = "pine",
}: {
  readonly label: string;
  readonly tone?: "pine" | "amber" | "brick" | "cobalt";
}) {
  const { palette } = useAppTheme();
  const colors = {
    pine: [palette.pineSoft, palette.pine],
    amber: [palette.amberSoft, palette.amber],
    brick: [palette.brickSoft, palette.brick],
    cobalt: [palette.cobaltSoft, palette.cobalt],
  } as const;
  return (
    <View style={[styles.pill, { backgroundColor: colors[tone][0] }]}>
      <View style={[styles.pillDot, { backgroundColor: colors[tone][1] }]} />
      <AppText variant="small" style={{ color: colors[tone][1], fontFamily: "Atkinson_700Bold" }}>
        {label}
      </AppText>
    </View>
  );
}

export function InlineLink({
  label,
  onPress,
}: {
  readonly label: string;
  readonly onPress: () => void;
}) {
  const { palette } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        opacity: pressed ? 0.65 : 1,
        minHeight: 44,
        justifyContent: "center",
      })}
    >
      <AppText variant="label" style={{ color: palette.cobalt }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export const sharedStyles = StyleSheet.create({
  stack: { gap: spacing.md },
  tightStack: { gap: spacing.xs },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  grow: { flex: 1 },
});

const textStyles = StyleSheet.create<Record<TextVariant, TextStyle>>({
  display: {
    fontFamily: "Atkinson_700Bold",
    fontSize: 40,
    lineHeight: 43,
    letterSpacing: -1.1,
  },
  title: {
    fontFamily: "Atkinson_700Bold",
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  heading: {
    fontFamily: "Atkinson_700Bold",
    fontSize: 21,
    lineHeight: 27,
  },
  body: {
    fontFamily: "Atkinson_400Regular",
    fontSize: 17,
    lineHeight: 24,
  },
  small: {
    fontFamily: "Atkinson_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: "Atkinson_700Bold",
    fontSize: 16,
    lineHeight: 20,
  },
  mono: {
    fontFamily: "IBMPlexMono_600SemiBold",
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.8,
  },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: "center" },
  content: {
    width: "100%",
    maxWidth: 680,
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  brandMark: { width: 42, height: 42, borderRadius: radius.sm, borderWidth: 2, overflow: "hidden" },
  brandMarkTop: { flex: 1 },
  brandMarkBottom: { flex: 1 },
  brandSeam: {
    position: "absolute",
    width: 26,
    height: 5,
    left: 7,
    top: 18,
    transform: [{ rotate: "-12deg" }],
  },
  button: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  paper: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionTitle: { flexShrink: 1 },
  rule: { height: StyleSheet.hairlineWidth, width: "100%" },
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
});
