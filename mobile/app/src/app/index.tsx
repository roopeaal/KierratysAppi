import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ActionIcon, ScanPackageMark } from "@/components/action-icon";
import {
  ActionRow,
  AppText,
  BrandLockup,
  InlineLink,
  NavigationTile,
  Screen,
  sharedStyles,
} from "@/components/ui";
import { isHistoryEnabled } from "@/features/history/storage";
import { useNearbySearch } from "@/features/nearby/search-context";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { controls, interaction, radius, spacing, useAppTheme } from "@/theme/tokens";

export default function HomeScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { language, setLanguage, t } = useLanguage();
  const { reset } = useScanSession();
  const { requestSearch } = useNearbySearch();
  const [historyEnabled, setHistoryState] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      reset();
      isHistoryEnabled()
        .then((enabled) => {
          if (!cancelled) setHistoryState(enabled);
        })
        .catch(() => {
          if (!cancelled) setHistoryState(false);
        });
      return () => {
        cancelled = true;
      };
    }, [reset]),
  );

  return (
    <Screen testID="home-screen">
      <View style={styles.topbar}>
        <BrandLockup compact />
        <View
          style={[styles.languageSwitch, { borderColor: palette.borderSubtle }]}
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
                language === item && { backgroundColor: palette.pineSoft },
                pressed && { opacity: interaction.pressedOpacity },
              ]}
            >
              <AppText
                variant="small"
                style={{
                  fontFamily: language === item ? "Atkinson_700Bold" : "Atkinson_400Regular",
                }}
              >
                {item.toUpperCase()}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.intro}>
        <AppText variant="display" accessibilityRole="header">
          {t("introTitle")}
        </AppText>
        <AppText muted>{t("introBody")}</AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("scanAction")}
        testID="home-scan-action"
        onPress={() => router.push("/scan")}
        style={({ pressed }) => [
          styles.scanAction,
          {
            backgroundColor: palette.actionPrimary,
            opacity: pressed ? interaction.pressedOpacity : 1,
          },
        ]}
      >
        <View style={sharedStyles.grow}>
          <AppText variant="title" style={{ color: palette.onStrong }}>
            {t("scanAction")}
          </AppText>
        </View>
        <ScanPackageMark color={palette.onStrong} />
      </Pressable>
      <ActionRow
        label={t("manualEntry")}
        detail={t("gtinHint")}
        leading={<ActionIcon kind="manual" />}
        onPress={() => router.push("/manual")}
        testID="home-manual-action"
      />
      <AppText variant="small" muted style={styles.scope}>
        {t("scanScope")}
      </AppText>
      <ActionRow
        label={t("photoTitle")}
        detail={t("photoHome")}
        onPress={() => router.push("/photo")}
        testID="home-photo-action"
      />

      <View style={styles.utilities}>
        <NavigationTile
          label={t("nearbyHomeTitle")}
          detail={t("nearbyHomeBody")}
          icon={<ActionIcon kind="nearby" />}
          onPress={() => {
            requestSearch();
            router.push("/nearby");
          }}
          testID="home-nearby-action"
        />
        <NavigationTile
          label={t("homeGuideTitle")}
          detail={t("homeGuideBody")}
          icon={<ActionIcon kind="guide" />}
          onPress={() => router.push("/guide")}
          testID="home-guide-action"
        />
      </View>
      <ActionRow
        label={t("historyTitle")}
        detail={historyEnabled ? t("homeHistoryOn") : t("homeHistoryOff")}
        leading={<ActionIcon kind="history" />}
        onPress={() => router.push("/history")}
        testID="home-history-action"
      />

      <View style={styles.footer}>
        <View style={styles.footerLinks}>
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
  languageSwitch: { flexDirection: "row", borderRadius: radius.md, borderWidth: 1, padding: 2 },
  languageChoice: {
    minWidth: controls.minimumTouchTarget,
    minHeight: controls.minimumTouchTarget,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  intro: { paddingTop: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
  scanAction: {
    minHeight: 134,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    padding: 20,
    gap: spacing.md,
  },
  scope: { paddingTop: spacing.sm },
  utilities: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  footer: { marginTop: spacing.lg, gap: spacing.xs },
  footerLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
});
