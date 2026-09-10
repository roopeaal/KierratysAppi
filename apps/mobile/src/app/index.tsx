import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { BarcodeMark, PackagingMark } from "@/components/packaging-mark";
import { AppText, BrandLockup, InlineLink, Screen, sharedStyles } from "@/components/ui";
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
          style={[styles.languageSwitch, { backgroundColor: palette.pineSoft }]}
          accessibilityRole="radiogroup"
          accessibilityLabel={t("languageLabel")}
        >
          {(["fi", "en"] as const).map((item) => (
            <Pressable
              key={item}
              accessibilityRole="radio"
              accessibilityState={{ checked: language === item }}
              aria-checked={language === item}
              accessibilityLabel={item === "fi" ? t("finnish") : t("english")}
              onPress={() => setLanguage(item)}
              testID={`language-${item}`}
              style={({ pressed }) => [
                styles.languageChoice,
                language === item && { backgroundColor: palette.bgSurface },
                pressed && { opacity: interaction.pressedOpacity },
              ]}
            >
              <AppText
                variant="small"
                style={{
                  color: language === item ? palette.textPrimary : palette.textSecondary,
                  fontFamily: language === item ? "Atkinson_700Bold" : "Atkinson_400Regular",
                }}
              >
                {item.toUpperCase()}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.hero}>
        <AppText variant="display" accessibilityRole="header">
          {t("introTitle")}
        </AppText>
        <AppText muted>{t("introBody")}</AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("scanAction")}
        accessibilityHint={t("cameraPurpose")}
        testID="home-scan-action"
        onPress={() => router.push("/scan")}
        style={({ pressed }) => [
          styles.scanTile,
          {
            backgroundColor: palette.actionPrimary,
            opacity: pressed ? interaction.pressedOpacity : 1,
          },
        ]}
      >
        <View style={styles.scanTop}>
          <AppText variant="small" style={[styles.scanScope, { color: palette.onStrong }]}>
            {t("scanScope")}
          </AppText>
          <BarcodeMark color={palette.onStrong} large />
        </View>
        <View style={styles.scanBottom}>
          <AppText variant="title" style={{ color: palette.onStrong, flex: 1 }}>
            {t("scanAction")}
          </AppText>
          <View
            style={[styles.arrowCircle, { borderColor: palette.onStrong }]}
            accessible={false}
            accessibilityElementsHidden
          >
            <AppText style={{ color: palette.onStrong, fontSize: 26, lineHeight: 30 }}>↗</AppText>
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("manualEntry")}
        accessibilityHint={t("gtinHint")}
        testID="home-manual-action"
        onPress={() => router.push("/manual")}
        style={({ pressed }) => [
          styles.manualRow,
          { borderColor: palette.borderSubtle, opacity: pressed ? interaction.pressedOpacity : 1 },
        ]}
      >
        <AppText variant="label" style={sharedStyles.grow}>
          {t("manualEntry")}
        </AppText>
        <AppText muted accessible={false} accessibilityElementsHidden>
          →
        </AppText>
      </Pressable>
      <AppText variant="small" muted style={styles.privacy}>
        {t("privacySummary")}
      </AppText>

      <View style={styles.utilities}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("materialGuideAction")}
          testID="home-guide-action"
          onPress={() => router.push("/guide")}
          style={({ pressed }) => [
            styles.utilityRow,
            {
              borderColor: palette.borderSubtle,
              opacity: pressed ? interaction.pressedOpacity : 1,
            },
          ]}
        >
          <PackagingMark material="carton" />
          <View style={sharedStyles.grow}>
            <AppText variant="heading">{t("homeGuideTitle")}</AppText>
            <AppText variant="small" muted>
              {t("homeGuideBody")}
            </AppText>
          </View>
          <AppText muted accessible={false} accessibilityElementsHidden>
            →
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("historyTitle")}
          accessibilityHint={historyEnabled ? t("historyOn") : t("historyOff")}
          testID="home-history-action"
          onPress={() => router.push("/history")}
          style={({ pressed }) => [
            styles.utilityRow,
            {
              borderColor: palette.borderSubtle,
              opacity: pressed ? interaction.pressedOpacity : 1,
            },
          ]}
        >
          <View
            style={[styles.historyMark, { backgroundColor: palette.pineSoft }]}
            accessible={false}
            accessibilityElementsHidden
          >
            <View style={[styles.clockFace, { borderColor: palette.textPrimary }]}>
              <View style={[styles.clockHand, { borderColor: palette.textPrimary }]} />
            </View>
          </View>
          <View style={sharedStyles.grow}>
            <AppText variant="heading">{t("historyTitle")}</AppText>
            <AppText variant="small" muted>
              {historyEnabled ? t("homeHistoryOn") : t("homeHistoryOff")}
            </AppText>
          </View>
          <AppText muted accessible={false} accessibilityElementsHidden>
            →
          </AppText>
        </Pressable>
      </View>
      <View style={styles.footer}>
        <InlineLink
          label={t("legalAction")}
          onPress={() => router.push("/legal")}
          role="button"
          testID="home-legal-action"
        />
        <AppText variant="small" muted>
          {t("homeJurisdiction")}
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
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  languageSwitch: { flexDirection: "row", borderRadius: radius.pill, padding: 3 },
  languageChoice: {
    minWidth: controls.minimumTouchTarget,
    minHeight: controls.minimumTouchTarget,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { paddingTop: spacing.xl, paddingBottom: spacing.lg, gap: spacing.sm },
  scanTile: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.lg },
  scanTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  scanScope: { maxWidth: 180, flex: 1 },
  scanBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  manualRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: 4,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  privacy: { paddingTop: spacing.md },
  utilities: { paddingTop: spacing.lg },
  utilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  historyMark: {
    width: 52,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  clockFace: {
    width: 27,
    height: 27,
    borderWidth: 1.5,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  clockHand: {
    width: 7,
    height: 9,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    marginTop: -5,
    marginLeft: 5,
  },
  footer: {
    marginTop: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
});
