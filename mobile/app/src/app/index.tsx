import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionIcon } from "@/components/action-icon";
import { LeafBrandMark, ScanIllustration } from "@/components/reference-artwork";
import { ActionRow, AppText, Chevron, InlineLink, NavigationTile } from "@/components/ui";
import { isHistoryEnabled } from "@/features/history/storage";
import { useNearbySearch } from "@/features/nearby/search-context";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { controls, interaction, radius, spacing, useAppTheme } from "@/theme/tokens";

export default function HomeScreen() {
  const router = useRouter();
  const { palette, isDark } = useAppTheme();
  const { language, setLanguage, t } = useLanguage();
  const { reset } = useScanSession();
  const { requestSearch } = useNearbySearch();
  const [historyEnabled, setHistoryState] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  const canvasWidth = Math.min(width, 560);
  const expandedText = fontScale > 1.2;

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
    <SafeAreaView
      nativeID="app-screen-surface"
      testID="home-screen"
      edges={["top"]}
      accessibilityLanguage={language === "fi" ? "fi-FI" : "en"}
      style={{ flex: 1, backgroundColor: palette.bgCanvas }}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View testID="home-canvas" style={{ width: canvasWidth }}>
          <View
            style={[
              styles.hero,
              expandedText ? styles.heroExpanded : { minHeight: canvasWidth * 0.402 },
            ]}
          >
            {!expandedText && (
              <Image
                source={require("../../assets/backgrounds/home-background.png")}
                accessible={false}
                aria-hidden
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: canvasWidth,
                  height: (canvasWidth * 1672) / 941,
                  opacity: isDark ? 0.3 : 1,
                }}
              />
            )}
            <View style={[styles.branding, expandedText && styles.brandingExpanded]}>
              <View style={styles.leafFrame}>
                <LeafBrandMark size={48} />
              </View>
              <AppText
                accessibilityRole="header"
                variant="title"
                style={[
                  styles.wordmark,
                  { fontSize: canvasWidth < 360 ? 23 : 27, color: palette.textPrimary },
                ]}
              >
                {t("appName").slice(0, -5)}
                <AppText
                  variant="title"
                  style={[
                    styles.wordmark,
                    {
                      fontSize: canvasWidth < 360 ? 23 : 27,
                      color: isDark ? palette.actionLink : "#358751",
                    },
                  ]}
                >
                  {t("appName").slice(-5)}
                </AppText>
              </AppText>
              <AppText
                variant="small"
                style={{
                  textAlign: "center",
                  color: palette.textPrimary,
                  backgroundColor: palette.bgCanvas,
                  borderRadius: 8,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                {t("homeQuestion")}
              </AppText>
            </View>
          </View>

          <View style={styles.content}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("scanAction")}
              accessibilityHint={t("homeScanDetail")}
              testID="home-scan-action"
              onPress={() => router.push("/scan")}
              style={({ pressed }) => [
                styles.scanAction,
                {
                  backgroundColor: palette.pineSoft,
                  borderColor: palette.bgSurface,
                  opacity: pressed ? interaction.pressedOpacity : 1,
                },
              ]}
            >
              <View style={{ flex: 1, gap: spacing.xs, paddingRight: expandedText ? 0 : 106 }}>
                <AppText variant="title" style={{ color: palette.actionLink }}>
                  {t("scanAction")}
                </AppText>
                <AppText variant="small">{t("homeScanDetail")}</AppText>
              </View>
              {!expandedText && <ScanIllustration />}
              {expandedText && <Chevron />}
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
              leading={<ActionIcon kind="photo" />}
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
              <InlineLink
                label={t("legalAction")}
                onPress={() => router.push("/legal")}
                role="button"
                testID="home-legal-action"
              />
            </View>
            <AppText variant="small" muted>
              {t("homeJurisdiction")}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: "center" },
  hero: { overflow: "hidden", justifyContent: "center" },
  heroExpanded: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  branding: { marginLeft: "37%", paddingRight: 12, alignItems: "center", gap: 4 },
  brandingExpanded: { marginLeft: 0, paddingRight: 0, alignItems: "center" },
  leafFrame: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: { letterSpacing: -0.8, lineHeight: 33 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  scanAction: {
    minHeight: 142,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 26,
    padding: 18,
    gap: spacing.md,
    overflow: "hidden",
  },
  scope: { paddingTop: spacing.xs, paddingBottom: spacing.xs },
  utilities: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  footer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  languageSwitch: { flexDirection: "row", borderRadius: radius.pill, borderWidth: 1, padding: 2 },
  languageChoice: {
    minWidth: controls.minimumTouchTarget,
    minHeight: controls.minimumTouchTarget,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
