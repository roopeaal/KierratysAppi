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
import { controls, interaction, radius, spacing, typography, useAppTheme } from "@/theme/tokens";

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
      {...props}
      style={[
        textStyles[variant],
        { color: muted ? palette.textSecondary : palette.textPrimary },
        style,
      ]}
    />
  );
}

export function Screen({
  children,
  scroll = true,
  style,
  testID,
}: PropsWithChildren<{
  readonly scroll?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}>) {
  const { palette } = useAppTheme();
  const { language } = useLanguage();
  const content = <View style={[styles.content, style]}>{children}</View>;
  return (
    <SafeAreaView
      accessibilityLanguage={language === "fi" ? "fi-FI" : "en"}
      style={[styles.safeArea, { backgroundColor: palette.bgCanvas }]}
      edges={["top", "bottom"]}
      testID={testID}
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
    <View
      style={styles.brand}
      accessible
      accessibilityLabel={compact ? t("appName") : `${t("appName")}. ${t("tagline")}`}
    >
      <View style={[styles.brandMark, { borderColor: palette.ink }]} accessibilityElementsHidden>
        <View style={[styles.brandMarkTop, { backgroundColor: palette.pineSoft }]} />
        <View style={[styles.brandMarkBottom, { backgroundColor: palette.actionPrimary }]} />
        <View style={[styles.brandSeam, { backgroundColor: palette.surface }]} />
      </View>
      <View style={styles.sectionTitle}>
        <AppText variant={compact ? "heading" : "title"}>{t("appName")}</AppText>
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
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  busy = false,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const { palette } = useAppTheme();
  const backgrounds = {
    primary: palette.actionPrimary,
    secondary: palette.actionSecondary,
    quiet: "transparent",
    danger: palette.brickSoft,
  };
  const foregrounds = {
    primary: palette.onStrong,
    secondary: palette.textPrimary,
    quiet: palette.actionLink,
    danger: palette.statusError,
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        style,
        {
          backgroundColor: backgrounds[variant],
          borderColor: variant === "secondary" ? palette.borderSubtle : backgrounds[variant],
          opacity:
            disabled || busy
              ? interaction.disabledOpacity
              : pressed
                ? interaction.pressedOpacity
                : 1,
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
  testID,
}: PropsWithChildren<{ readonly style?: StyleProp<ViewStyle>; readonly testID?: string }>) {
  const { palette } = useAppTheme();
  return (
    <View
      style={[
        styles.paper,
        { backgroundColor: palette.bgSurface, borderColor: palette.borderSubtle },
        style,
      ]}
      testID={testID}
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
  return <View style={[styles.rule, { backgroundColor: palette.borderSubtle }, style]} />;
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
      <AppText
        variant="small"
        style={{ color: colors[tone][1], fontFamily: "Atkinson_600SemiBold", flexShrink: 1 }}
      >
        {label}
      </AppText>
    </View>
  );
}

export function InlineLink({
  label,
  onPress,
  accessibilityHint,
  testID,
  color,
  role = "link",
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly accessibilityHint?: string;
  readonly testID?: string;
  readonly color?: string;
  readonly role?: "link" | "button";
}) {
  const { palette } = useAppTheme();
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      hitSlop={8}
      testID={testID}
      style={({ pressed }) => ({
        opacity: pressed ? interaction.pressedOpacity : 1,
        minHeight: controls.minimumTouchTarget,
        justifyContent: "center",
      })}
    >
      <AppText variant="label" style={{ color: color ?? palette.actionLink }}>
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
  display: typography.display,
  title: typography.title,
  heading: typography.heading,
  body: typography.body,
  small: typography.small,
  label: typography.label,
  mono: typography.mono,
});

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: "center" },
  content: {
    width: "100%",
    maxWidth: 560,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 },
  brandMark: { width: 32, height: 36, borderRadius: 7, borderWidth: 1.5, overflow: "hidden" },
  brandMarkTop: { flex: 1 },
  brandMarkBottom: { flex: 1 },
  brandSeam: {
    position: "absolute",
    width: 3,
    height: 32,
    left: 19,
    top: 0,
  },
  button: {
    minHeight: controls.buttonMinHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  paper: { borderWidth: 1, borderRadius: radius.lg, padding: 20, gap: spacing.md },
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
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
});
