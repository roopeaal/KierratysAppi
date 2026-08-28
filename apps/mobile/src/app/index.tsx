import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  AppText,
  BrandLockup,
  Button,
  Eyebrow,
  InlineLink,
  Rule,
  Screen,
  SectionHeader,
  sharedStyles,
} from "@/components/ui";
import { isHistoryEnabled } from "@/features/history/storage";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { controls, interaction, radius, spacing, useAppTheme } from "@/theme/tokens";

export default function HomeScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { language, setLanguage, t } = useLanguage();
  const { reset } = useScanSession();
  const [historyEnabled, setHistoryState] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reset();
      void isHistoryEnabled().then(setHistoryState);
    }, [reset]),
  );

  return (
    <Screen testID="home-screen">
      <View style={styles.topbar}>
        <BrandLockup compact />
        <View
          style={[
            styles.languageSwitch,
            { borderColor: palette.borderSubtle, backgroundColor: palette.bgSurface },
          ]}
          accessibilityRole="radiogroup"
          accessibilityLabel={t("languageLabel")}
        >
          {(["fi", "en"] as const).map((item) => (
            <Pressable
              key={item}
              accessibilityRole="radio"
              accessibilityState={{ checked: language === item }}
              accessibilityLabel={item === "fi" ? t("finnish") : t("english")}
              onPress={() => setLanguage(item)}
              testID={`language-${item}`}
              style={({ pressed }) => [
                styles.languageChoice,
                language === item && { backgroundColor: palette.textPrimary },
                pressed && { opacity: interaction.pressedOpacity },
              ]}
            >
              <AppText
                variant="mono"
                style={{ color: language === item ? palette.bgCanvas : palette.textSecondary }}
              >
                {item.toUpperCase()}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.hero}>
        <Eyebrow>{t("introEyebrow")}</Eyebrow>
        <AppText variant="display" accessibilityRole="header">
          {t("introTitle")}
        </AppText>
        <AppText style={styles.intro}>{t("introBody")}</AppText>
      </View>

      <View style={[sharedStyles.stack, styles.actions]}>
        <Button
          label={t("scanAction")}
          onPress={() => router.push("/scan")}
          accessibilityHint={t("cameraPurpose")}
          testID="home-scan-action"
        />
        <Button
          label={t("manualEntry")}
          variant="secondary"
          onPress={() => router.push("/manual")}
          accessibilityHint={t("gtinHint")}
          testID="home-manual-action"
        />
      </View>

      <View style={[styles.privacyStrip, { borderColor: palette.borderSubtle }]}>
        <View style={[styles.privacyDot, { backgroundColor: palette.statusSuccess }]} />
        <AppText variant="small" style={styles.privacyText}>
          {t("privacySummary")}
        </AppText>
      </View>

      <View style={styles.section}>
        <SectionHeader title={t("recentScans")} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("historyTitle")}
          accessibilityHint={historyEnabled ? t("historyOn") : t("historyOff")}
          onPress={() => router.push("/history")}
          testID="home-history-action"
          style={({ pressed }) => [
            styles.historyRow,
            {
              borderColor: palette.borderSubtle,
              opacity: pressed ? interaction.pressedOpacity : 1,
            },
          ]}
        >
          <View style={sharedStyles.row}>
            <View style={[styles.historyGlyph, { borderColor: palette.actionLink }]}>
              <AppText variant="mono" style={{ color: palette.actionLink }}>
                ↺
              </AppText>
            </View>
            <View style={sharedStyles.grow}>
              <AppText variant="label">{historyEnabled ? t("historyOn") : t("historyOff")}</AppText>
              <AppText variant="small" muted>
                {t("localOnly")}
              </AppText>
            </View>
            <AppText variant="heading" style={{ color: palette.actionLink }}>
              →
            </AppText>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <SectionHeader title={t("materialGuideTitle")} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("materialGuideAction")}
          onPress={() => router.push("/guide")}
          testID="home-guide-action"
          style={({ pressed }) => [
            styles.guideRow,
            {
              borderColor: palette.borderSubtle,
              opacity: pressed ? interaction.pressedOpacity : 1,
            },
          ]}
        >
          <View style={styles.guideText}>
            <AppText variant="heading">{t("materialGuideAction")}</AppText>
            <AppText muted>{t("materialGuideBody")}</AppText>
          </View>
          <AppText variant="title" style={{ color: palette.actionLink }}>
            →
          </AppText>
        </Pressable>
      </View>

      <Rule style={styles.footerRule} />
      <View style={styles.footer}>
        <InlineLink
          label={t("legalAction")}
          onPress={() => router.push("/legal")}
          role="button"
          testID="home-legal-action"
        />
        <AppText variant="mono" muted>
          {t("rulesetVersion")}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  languageSwitch: { flexDirection: "row", borderWidth: 1, borderRadius: radius.pill, padding: 3 },
  languageChoice: {
    minWidth: controls.minimumTouchTarget,
    minHeight: controls.minimumTouchTarget,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { paddingTop: spacing.xl, gap: spacing.md },
  intro: { maxWidth: 530 },
  actions: { paddingTop: spacing.lg },
  privacyStrip: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  privacyDot: { width: 9, height: 9, borderRadius: 5 },
  privacyText: { flex: 1 },
  section: { marginTop: spacing.xxl, gap: spacing.md },
  historyRow: {
    minHeight: 88,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  historyGlyph: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  guideRow: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  guideText: { flex: 1, gap: spacing.xs },
  footerRule: { marginTop: spacing.xxl },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
});
