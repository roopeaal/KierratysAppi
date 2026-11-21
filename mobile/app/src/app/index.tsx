import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionIcon } from "@/components/action-icon";
import {
  HomeText as AppText,
  HomeSectionHeading,
  HomeTile,
  homeFont,
  IconDisc,
} from "@/components/home-elements";
import { homeReferenceLayout, homeShortcutGrid } from "@/components/home-layout";
import { HomeNearbyPreview } from "@/components/home-nearby-preview";
import { HomeRecent } from "@/components/home-recent";
import { HomeQueryChip } from "@/components/home-reference-elements";
import { screenLayout } from "@/components/navigation-layout";
import { LeafBrandMark, PhotoCardBackdrop, ScanIllustration } from "@/components/reference-artwork";
import { TactilePressable as Pressable } from "@/components/tactile-pressable";
import { AppInput, Chevron } from "@/components/ui";
import { GUIDE_SEARCH_MAX_LENGTH } from "@/features/guide/search";
import { useNearbySearch } from "@/features/nearby/search-context";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { homeColors } from "@/theme/home-colors";
import { fieldGuideColors, interaction, spacing, useAppTheme } from "@/theme/tokens";

const POPULAR = [
  ["plastic", "homeQueryBottle", "muovipullo"],
  ["battery", "homeQueryBatteries", "paristot"],
  ["carton", "homeQueryCardboard", "pahvi"],
  ["electronics", "homeQueryElectronics", "elektroniikka"],
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { language, t } = useLanguage();
  const { reset } = useScanSession();
  const { requestSearch } = useNearbySearch();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [identifyFocused, setIdentifyFocused] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  const canvasWidth = Math.min(width, screenLayout.maxWidth);
  const { expandedText, showMotto, showCamera, scanHeight, scanArtScale } = homeReferenceLayout(
    canvasWidth,
    fontScale,
  );

  useFocusEffect(
    useCallback(() => {
      reset();
      setQuery("");
    }, [reset]),
  );

  const search = () => {
    Keyboard.dismiss();
    router.push({
      pathname: "/guide",
      params: { query: query.trim().slice(0, GUIDE_SEARCH_MAX_LENGTH) },
    });
  };

  return (
    <SafeAreaView
      nativeID="app-screen-surface"
      testID="home-screen"
      edges={["top"]}
      accessibilityLanguage={language === "fi" ? "fi-FI" : "en"}
      style={{ flex: 1, backgroundColor: homeColors.canvas }}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View testID="home-canvas" style={{ width: canvasWidth }}>
          <View
            style={[
              styles.hero,
              { backgroundColor: fieldGuideColors.introduction },
              !expandedText && { minHeight: canvasWidth * 0.405 },
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
                testID="home-landscape"
                style={[
                  styles.landscape,
                  {
                    width: canvasWidth,
                    height: (canvasWidth * 1672) / 941,
                  },
                ]}
              />
            )}
            <View
              style={[
                styles.branding,
                showMotto && styles.brandingWithMotto,
                expandedText && styles.brandingExpanded,
              ]}
            >
              <View style={expandedText ? styles.mastheadExpanded : styles.masthead}>
                <LeafBrandMark size={expandedText ? 30 : canvasWidth < 360 ? 36 : 44} />
                <AppText style={[styles.wordmark, expandedText && styles.wordmarkExpanded]}>
                  {t("appName").slice(0, -5)}
                  <AppText
                    style={[
                      styles.wordmark,
                      expandedText && styles.wordmarkExpanded,
                      { color: palette.pine },
                    ]}
                  >
                    {t("appName").slice(-5)}
                  </AppText>
                </AppText>
              </View>
              <AppText
                accessibilityRole="header"
                style={[styles.question, expandedText && styles.questionExpanded]}
              >
                {t("homeSlogan")}
              </AppText>
            </View>
            {showMotto && (
              <View
                aria-hidden
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                pointerEvents="none"
                style={styles.corner}
              >
                <AppText testID="home-corner-motto" style={styles.cornerText}>
                  {t("homeCornerMotto")}
                  {"\n"}♡
                </AppText>
              </View>
            )}
          </View>
          <View style={[styles.content, !expandedText && styles.overlapContent]}>
            <View
              style={[
                styles.search,
                {
                  backgroundColor: palette.bgSurface,
                  borderColor: searchFocused ? palette.actionLink : palette.bgSurface,
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("homeSearchSubmit")}
                onPress={search}
                style={styles.searchButton}
                testID="home-search-submit"
              >
                <View
                  accessible={false}
                  aria-hidden
                  style={[styles.magnifier, { borderColor: palette.textSecondary }]}
                >
                  <View style={[styles.handle, { backgroundColor: palette.textSecondary }]} />
                </View>
              </Pressable>
              <AppInput
                accessibilityLabel={t("homeSearchLabel")}
                accessibilityHint={t("homeSearchHint")}
                placeholder={t("homeSearchPlaceholder")}
                placeholderTextColor={homeColors.muted}
                value={query}
                maxLength={GUIDE_SEARCH_MAX_LENGTH}
                onChangeText={setQuery}
                onSubmitEditing={search}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                returnKeyType="search"
                autoComplete="off"
                autoCorrect={false}
                testID="home-search-input"
                style={[styles.searchInput, { color: homeColors.ink }]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("scanAction")}
                accessibilityHint={t("homeScanDetail")}
                onPress={() => router.push("/scan")}
                testID="home-scan-action"
                style={({ pressed }) => [
                  styles.searchButton,
                  {
                    borderRadius: 24,
                    backgroundColor: palette.pineSoft,
                    opacity: pressed ? interaction.pressedOpacity : 1,
                  },
                ]}
              >
                <ActionIcon kind="scan" />
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("homeIdentifyTitle")}
              accessibilityHint={t("homeIdentifyDetail")}
              testID="home-identify-action"
              onPress={() => router.push("/identify")}
              onFocus={() => setIdentifyFocused(true)}
              onBlur={() => setIdentifyFocused(false)}
              style={({ pressed }) => [
                styles.identifyAction,
                {
                  minHeight: scanHeight,
                  backgroundColor: palette.pineSoft,
                  borderColor: identifyFocused ? palette.actionLink : palette.bgSurface,
                  opacity: pressed ? interaction.pressedOpacity : 1,
                },
              ]}
            >
              {!expandedText && <PhotoCardBackdrop width={canvasWidth - 32} height={scanHeight} />}
              {showCamera && <IconDisc kind="photo" blue compact />}
              <View
                style={[
                  styles.identifyContent,
                  !expandedText && { paddingRight: (showCamera ? 100 : 88) * scanArtScale },
                ]}
              >
                <View style={styles.grow}>
                  <AppText style={styles.identifyTitle}>{t("homeIdentifyTitle")}</AppText>
                  <AppText muted style={styles.identifyBody}>
                    {t("homeIdentifyDetail")}
                  </AppText>
                </View>
              </View>
              {!expandedText && <ScanIllustration scale={scanArtScale} />}
              {!expandedText && (
                <View style={[styles.identifyChevron, { backgroundColor: palette.bgSurface }]}>
                  <Chevron />
                </View>
              )}
            </Pressable>
            <View
              style={[
                styles.shortcuts,
                (expandedText || canvasWidth < homeShortcutGrid.singleColumnBelow) && styles.stack,
              ]}
            >
              <HomeTile
                kind="nearby"
                label={t("nearbyHomeTitle")}
                detail={t("homePointsDetail")}
                testID="home-nearby-action"
                onPress={() => {
                  requestSearch();
                  router.push("/nearby");
                }}
              />
              <HomeTile
                kind="guide"
                label={t("homeGuideShortcut")}
                detail={t("homeGuideDetail")}
                testID="home-guide-action"
                onPress={() => router.push("/guide")}
              />
            </View>
            <View>
              <HomeSectionHeading
                title={t("homeMaterials")}
                action={t("homeShowAll")}
                onPress={() => router.push("/guide")}
                testID="home-guide-all"
              />
              <View style={styles.chips}>
                {POPULAR.map(([icon, label, term]) => (
                  <HomeQueryChip
                    key={icon}
                    icon={icon}
                    label={t(label)}
                    onPress={() => router.push({ pathname: "/guide", params: { query: term } })}
                  />
                ))}
              </View>
            </View>
            <View style={styles.overviewSection} testID="home-overview-section">
              <HomeSectionHeading title={t("overviewTitle")} />
              <View style={styles.shortcuts}>
                <HomeTile
                  kind="overview"
                  label={t("homeOverviewAction")}
                  detail={t("homeOverviewDetail")}
                  testID="home-overview-action"
                  onPress={() => router.push("/overview")}
                />
              </View>
            </View>
            <HomeNearbyPreview />
            <HomeRecent />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: "center" },
  hero: {
    overflow: "hidden",
    justifyContent: "center",
    paddingVertical: 12,
  },
  landscape: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  masthead: { alignItems: "center", gap: 2 },
  mastheadExpanded: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  branding: { marginLeft: "37%", marginRight: "4%", gap: 3 },
  brandingWithMotto: { marginLeft: "33%", marginRight: "18%" },
  brandingExpanded: { marginHorizontal: 18, gap: 12 },
  wordmark: {
    fontFamily: homeFont,
    fontWeight: "700",
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -1,
  },
  wordmarkExpanded: { fontSize: 18, lineHeight: 24 },
  question: {
    fontFamily: homeFont,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
  },
  questionExpanded: {
    textAlign: "left",
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "700",
    letterSpacing: -1.4,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + spacing.xxs,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  overlapContent: { marginTop: -8, paddingTop: 0 },
  corner: {
    position: "absolute",
    right: 12,
    top: 16,
    width: 63,
    transform: [{ rotate: "-11deg" }],
  },
  cornerText: {
    textAlign: "center",
    color: "#4B7B65",
    fontFamily: Platform.select({
      ios: "Snell Roundhand",
      android: "cursive",
      web: '"Snell Roundhand", "Bradley Hand", cursive',
    }),
    fontSize: 14,
    lineHeight: 16,
  },
  search: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 32,
    padding: 3,
    boxShadow: "0px 5px 18px rgba(40, 110, 78, 0.07)",
  },
  searchButton: { width: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    paddingHorizontal: 6,
    paddingVertical: 8,
    fontFamily: homeFont,
    fontSize: 15,
    lineHeight: 21,
  },
  magnifier: {
    width: 17,
    height: 17,
    borderWidth: 2,
    borderRadius: 9,
    marginRight: 4,
    marginBottom: 4,
  },
  handle: {
    width: 10,
    height: 2,
    position: "absolute",
    right: -7,
    bottom: -4,
    transform: [{ rotate: "45deg" }],
  },
  identifyAction: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 22,
    overflow: "hidden",
    paddingVertical: 14,
    paddingLeft: 10,
    paddingRight: 16,
    gap: 8,
  },
  identifyContent: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10 },
  identifyTitle: {
    fontFamily: homeFont,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.8,
    fontWeight: "700",
  },
  identifyBody: { fontFamily: homeFont, fontSize: 14, lineHeight: 20 },
  identifyChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 10,
  },
  grow: { flex: 1, minWidth: 0, gap: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  overviewSection: { gap: 6 },
  shortcuts: { flexDirection: "row", flexWrap: "wrap", gap: homeShortcutGrid.gap },
  stack: { flexDirection: "column", flexWrap: "nowrap", alignItems: "stretch" },
});
