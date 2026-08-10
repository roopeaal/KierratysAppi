import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  AppText,
  BrandLockup,
  Button,
  Eyebrow,
  InlineLink,
  Paper,
  Rule,
  Screen,
  SectionHeader,
  sharedStyles,
} from "@/components/ui";
import { isHistoryEnabled } from "@/features/history/storage";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { radius, spacing, useAppTheme } from "@/theme/tokens";

const WELCOME_SEEN_KEY = "@kierratysappi/welcome-seen/v1";
const BARCODE_BARS = [
  { id: "bar-a", width: 2 },
  { id: "bar-b", width: 1 },
  { id: "bar-c", width: 3 },
  { id: "bar-d", width: 1 },
  { id: "bar-e", width: 2 },
  { id: "bar-f", width: 3 },
  { id: "bar-g", width: 1 },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { language, setLanguage, t } = useLanguage();
  const { reset } = useScanSession();
  const [historyEnabled, setHistoryState] = useState(false);
  const [firstVisit, setFirstVisit] = useState(true);

  useFocusEffect(
    useCallback(() => {
      reset();
      void Promise.all([isHistoryEnabled(), AsyncStorage.getItem(WELCOME_SEEN_KEY)]).then(
        ([enabled, seen]) => {
          setHistoryState(enabled);
          setFirstVisit(seen !== "true");
          if (seen !== "true") void AsyncStorage.setItem(WELCOME_SEEN_KEY, "true");
        },
      );
    }, [reset]),
  );

  return (
    <Screen>
      <View style={styles.topbar}>
        <BrandLockup />
        <View
          style={[
            styles.languageSwitch,
            { borderColor: palette.line, backgroundColor: palette.surface },
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
              style={[styles.languageChoice, language === item && { backgroundColor: palette.ink }]}
            >
              <AppText
                variant="mono"
                style={{ color: language === item ? palette.background : palette.muted }}
              >
                {item.toUpperCase()}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Eyebrow>{t("introEyebrow")}</Eyebrow>
          <AppText variant="display" accessibilityRole="header">
            {t("introTitle")}
          </AppText>
          <AppText style={styles.intro}>{t("introBody")}</AppText>
        </View>
        <SortingMark />
      </View>

      <View style={[sharedStyles.stack, styles.actions]}>
        <Button
          label={t("scanAction")}
          onPress={() => router.push("/scan")}
          accessibilityHint={t("cameraPurpose")}
        />
        <Button
          label={t("manualEntry")}
          variant="secondary"
          onPress={() => router.push("/manual")}
        />
      </View>

      <View style={[styles.privacyStrip, { borderColor: palette.line }]}>
        <View style={[styles.privacyDot, { backgroundColor: palette.pine }]} />
        <AppText variant="small" style={styles.privacyText}>
          {t("privacySummary")}
        </AppText>
      </View>

      {firstVisit && (
        <Paper style={{ backgroundColor: palette.pineSoft }}>
          <Eyebrow>{t("localOnly").toUpperCase()}</Eyebrow>
          <AppText variant="heading">{t("privacySummary")}</AppText>
          <AppText muted>{t("cameraPermissionBody")}</AppText>
        </Paper>
      )}

      <View style={styles.section}>
        <SectionHeader
          title={t("recentScans")}
          action={<InlineLink label={t("historyTitle")} onPress={() => router.push("/history")} />}
        />
        <Paper>
          <View style={sharedStyles.row}>
            <View style={[styles.historyGlyph, { borderColor: palette.cobalt }]}>
              <AppText variant="mono" style={{ color: palette.cobalt }}>
                ↺
              </AppText>
            </View>
            <View style={sharedStyles.grow}>
              <AppText variant="label">{historyEnabled ? t("historyOn") : t("historyOff")}</AppText>
              <AppText variant="small" muted>
                {t("localOnly")}
              </AppText>
            </View>
          </View>
        </Paper>
      </View>

      <View style={styles.section}>
        <SectionHeader title={t("materialGuideTitle")} />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/guide")}
          style={({ pressed }) => [
            styles.guideRow,
            { borderColor: palette.line, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.guideText}>
            <AppText variant="heading">{t("materialGuideAction")}</AppText>
            <AppText muted>{t("materialGuideBody")}</AppText>
          </View>
          <AppText variant="title" style={{ color: palette.cobalt }}>
            →
          </AppText>
        </Pressable>
      </View>

      <Rule style={styles.footerRule} />
      <View style={styles.footer}>
        <InlineLink label={t("legalAction")} onPress={() => router.push("/legal")} />
        <AppText variant="mono" muted>
          RULESET FI · 2026.08
        </AppText>
      </View>
    </Screen>
  );
}

function SortingMark() {
  const { palette } = useAppTheme();
  return (
    <View style={[styles.sortingMark, { borderColor: palette.ink }]} accessibilityElementsHidden>
      <View style={[styles.sortingTop, { backgroundColor: palette.pineSoft }]}>
        <View style={[styles.barcode, { borderColor: palette.pine }]}>
          {BARCODE_BARS.map(({ id, width }) => (
            <View key={id} style={{ width, height: 34, backgroundColor: palette.pine }} />
          ))}
        </View>
      </View>
      <View style={[styles.sortingBottom, { backgroundColor: palette.cobaltSoft }]}>
        <AppText variant="mono" style={{ color: palette.cobalt }}>
          01 / TUNNISTA
        </AppText>
        <AppText variant="mono" style={{ color: palette.cobalt }}>
          02 / LAJITTELE
        </AppText>
      </View>
      <View style={[styles.sortingSeam, { backgroundColor: palette.background }]} />
    </View>
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
    minWidth: 42,
    minHeight: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { paddingTop: spacing.xxl, gap: spacing.xl },
  heroCopy: { gap: spacing.md },
  intro: { maxWidth: 530 },
  sortingMark: {
    height: 174,
    borderWidth: 2,
    borderRadius: radius.lg,
    overflow: "hidden",
    transform: [{ rotate: "-1deg" }],
  },
  sortingTop: { flex: 1, alignItems: "center", justifyContent: "center" },
  sortingBottom: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    gap: spacing.xs,
  },
  sortingSeam: {
    position: "absolute",
    height: 10,
    width: "110%",
    left: -14,
    top: 81,
    transform: [{ rotate: "-2deg" }],
  },
  barcode: {
    height: 48,
    minWidth: 160,
    borderWidth: 1,
    borderRadius: radius.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  actions: { paddingTop: spacing.xl },
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
