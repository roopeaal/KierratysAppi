import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionIcon } from "@/components/action-icon";
import {
  HomeSectionHeading,
  HomeSurface,
  HomeTile,
  homeFont,
  IconDisc,
  MaterialChip,
} from "@/components/home-elements";
import { LeafBrandMark, ScanIllustration } from "@/components/reference-artwork";
import { AppText, Chevron, InlineLink } from "@/components/ui";
import { GUIDE_SEARCH_MAX_LENGTH } from "@/features/guide/search";
import { homeHistoryPreview } from "@/features/history/home-preview";
import { historyStatusMessageKey } from "@/features/history/presentation";
import { type HistoryEntry, isHistoryEnabled, readHistory } from "@/features/history/storage";
import { useNearbySearch } from "@/features/nearby/search-context";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { controls, interaction, useAppTheme } from "@/theme/tokens";

const MATERIALS = [
  ["plastic", "homeMaterialPlastic"],
  ["carton", "homeMaterialCarton"],
  ["glass", "homeMaterialGlass"],
  ["metal", "homeMaterialMetal"],
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { palette, isDark } = useAppTheme();
  const { language, setLanguage, t } = useLanguage();
  const { reset, lookupBarcode } = useScanSession();
  const { requestSearch } = useNearbySearch();
  const [historyEnabled, setHistoryState] = useState(false);
  const [recent, setRecent] = useState<HistoryEntry[]>([]);
  const [historyError, setHistoryError] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [photoFocused, setPhotoFocused] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  const canvasWidth = Math.min(width, 560);
  const expandedText = fontScale > 1.2;
  const stacked = canvasWidth < 360 || expandedText;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      reset();
      setQuery("");
      setRecent([]);
      setHistoryError(false);
      void Promise.all([isHistoryEnabled(), readHistory()])
        .then(([enabled, entries]) => {
          if (cancelled) return;
          setHistoryState(enabled);
          setRecent(homeHistoryPreview(entries, enabled));
          setHistoryError(false);
        })
        .catch(() => {
          if (cancelled) return;
          setHistoryState(false);
          setRecent([]);
          setHistoryError(true);
        });
      return () => {
        cancelled = true;
      };
    }, [reset]),
  );

  const search = () => {
    Keyboard.dismiss();
    router.push({
      pathname: "/guide",
      params: { query: query.trim().slice(0, GUIDE_SEARCH_MAX_LENGTH) },
    });
  };
  const nearby = () => {
    requestSearch();
    router.push("/nearby");
  };
  const reopen = async (gtin: string) => {
    const attempt = await lookupBarcode(gtin, "history");
    if (attempt.accepted) router.push("/result");
  };

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
              expandedText ? styles.heroExpanded : { minHeight: canvasWidth * 0.49 },
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
                  opacity: isDark ? 0.25 : 1,
                }}
              />
            )}
            <View style={[styles.branding, expandedText && styles.brandingExpanded]}>
              <LeafBrandMark size={canvasWidth < 360 ? 44 : 52} />
              <AppText
                accessibilityRole="header"
                style={[styles.wordmark, { fontSize: canvasWidth < 360 ? 27 : 31 }]}
              >
                {t("appName").slice(0, -5)}
                <AppText
                  style={[
                    styles.wordmark,
                    {
                      fontSize: canvasWidth < 360 ? 27 : 31,
                      color: isDark ? palette.actionLink : "#358751",
                    },
                  ]}
                >
                  {t("appName").slice(-5)}
                </AppText>
              </AppText>
              <AppText
                style={[
                  styles.question,
                  {
                    color: isDark ? palette.textSecondary : "#455B76",
                    backgroundColor: isDark ? palette.bgCanvas : "rgba(245, 252, 249, 0.86)",
                  },
                ]}
              >
                {t("homeQuestion")}
              </AppText>
            </View>
          </View>
          <View style={styles.content}>
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
              <TextInput
                accessibilityLabel={t("homeSearchLabel")}
                accessibilityHint={t("homeSearchHint")}
                placeholder={t("homeSearchPlaceholder")}
                placeholderTextColor={palette.textSecondary}
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
                style={[styles.searchInput, { color: palette.textPrimary }]}
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
              accessibilityLabel={t("photoTitle")}
              accessibilityHint={t("homePhotoDetail")}
              testID="home-photo-action"
              onPress={() => router.push("/photo")}
              onFocus={() => setPhotoFocused(true)}
              onBlur={() => setPhotoFocused(false)}
              style={({ pressed }) => [
                styles.photoAction,
                {
                  backgroundColor: palette.pineSoft,
                  borderColor: photoFocused ? palette.actionLink : palette.bgSurface,
                  opacity: pressed ? interaction.pressedOpacity : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.photoContent,
                  !expandedText && { paddingRight: canvasWidth < 360 ? 92 : 102 },
                ]}
              >
                <IconDisc kind="photo" blue />
                <View style={styles.grow}>
                  <AppText style={styles.photoTitle}>{t("homePhotoTitle")}</AppText>
                  <AppText style={[styles.photoBody, { color: palette.textSecondary }]}>
                    {t("homePhotoDetail")}
                  </AppText>
                </View>
              </View>
              {!expandedText && <ScanIllustration />}
              {!expandedText && (
                <View style={[styles.photoChevron, { backgroundColor: palette.bgSurface }]}>
                  <Chevron />
                </View>
              )}
            </Pressable>
            <View style={[styles.utilities, stacked && { flexDirection: "column" }]}>
              <HomeTile
                label={t("nearbyHomeTitle")}
                detail={t("homePointsDetail")}
                kind="nearby"
                onPress={nearby}
                testID="home-nearby-action"
              />
              <HomeTile
                label={t("homeGuideTitle")}
                detail={t("homeGuideDetail")}
                kind="guide"
                onPress={() => router.push("/guide")}
                testID="home-guide-action"
              />
            </View>
            <HomeSectionHeading
              title={t("homeMaterials")}
              action={t("homeShowAll")}
              onPress={() => router.push("/guide")}
            />
            <View style={styles.chips}>
              {MATERIALS.map(([material, label]) => (
                <MaterialChip
                  key={material}
                  material={material}
                  label={t(label)}
                  onPress={() => router.push({ pathname: "/guide", params: { material } })}
                />
              ))}
            </View>
            <HomeSectionHeading
              title={t("homeNearbySection")}
              action={t("homeFindPoints")}
              onPress={nearby}
            />
            <HomeSurface>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("homeNearbyStart")}
                accessibilityHint={t("nearbyHomeBody")}
                onPress={nearby}
                testID="home-nearby-preview"
                style={({ pressed }) => [
                  styles.previewRow,
                  { opacity: pressed ? interaction.pressedOpacity : 1 },
                ]}
              >
                <View
                  style={[styles.mapPreview, { backgroundColor: palette.pineSoft }]}
                  accessible={false}
                  aria-hidden
                >
                  <View style={[styles.mapRoad, { backgroundColor: palette.bgSurface }]} />
                  <ActionIcon kind="nearby" />
                </View>
                <View style={styles.grow}>
                  <AppText style={styles.rowTitle}>{t("homeNearbyStart")}</AppText>
                  <AppText style={[styles.caption, { color: palette.textSecondary }]}>
                    {t("homeNearbyEmpty")}
                  </AppText>
                </View>
                <Chevron />
              </Pressable>
            </HomeSurface>
            <HomeSectionHeading
              title={t("homeRecent")}
              action={t("homeShowAll")}
              onPress={() => router.push("/history")}
              testID="home-history-action"
            />
            {recent.length > 0 ? (
              <View style={[styles.recent, stacked && { flexDirection: "column" }]}>
                {recent.map((entry) => (
                  <Pressable
                    key={entry.gtin}
                    accessibilityRole="button"
                    accessibilityLabel={entry.productName ?? entry.gtin}
                    accessibilityHint={t("homeHistoryReopen")}
                    onPress={() => void reopen(entry.gtin)}
                    testID={`home-recent-${entry.gtin}`}
                    style={({ pressed }) => [
                      styles.recentCard,
                      {
                        backgroundColor: palette.bgSurface,
                        opacity: pressed ? interaction.pressedOpacity : 1,
                      },
                    ]}
                  >
                    <ActionIcon kind="history" />
                    <View style={styles.grow}>
                      <AppText style={styles.rowTitle}>{entry.productName ?? entry.gtin}</AppText>
                      <AppText style={[styles.caption, { color: palette.textSecondary }]}>
                        {t(historyStatusMessageKey(entry.resultStatus))}
                      </AppText>
                    </View>
                    <Chevron />
                  </Pressable>
                ))}
              </View>
            ) : (
              <HomeSurface>
                <View style={styles.previewRow}>
                  <ActionIcon kind="history" />
                  <AppText
                    testID="home-history-empty"
                    style={[styles.caption, styles.grow, { color: palette.textSecondary }]}
                  >
                    {historyError
                      ? t("homeHistoryError")
                      : historyEnabled
                        ? t("homeHistoryEmpty")
                        : t("homeHistoryDisabled")}
                  </AppText>
                </View>
              </HomeSurface>
            )}
            <View style={styles.manualRow}>
              <InlineLink
                label={t("manualEntry")}
                onPress={() => router.push("/manual")}
                role="button"
                testID="home-manual-action"
              />
              <View accessible={false} aria-hidden>
                <ActionIcon kind="manual" />
              </View>
            </View>
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
                      style={[styles.caption, { fontWeight: language === item ? "700" : "400" }]}
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
            <AppText variant="small" muted style={{ textAlign: "center" }}>
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
  hero: { overflow: "hidden", justifyContent: "center", paddingBottom: 24 },
  heroExpanded: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 36 },
  branding: { marginLeft: "35%", paddingRight: 12, alignItems: "center", gap: 5 },
  brandingExpanded: { marginLeft: 0, paddingRight: 0 },
  wordmark: { fontFamily: homeFont, fontWeight: "800", letterSpacing: -1.3, lineHeight: 38 },
  question: {
    fontFamily: homeFont,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    borderRadius: 8,
    paddingHorizontal: 3,
  },
  content: { paddingHorizontal: 14, marginTop: -26, paddingBottom: 24, gap: 12 },
  search: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 32,
    padding: 4,
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
  photoAction: {
    minHeight: 116,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 22,
    overflow: "hidden",
    paddingVertical: 16,
    paddingLeft: 10,
    paddingRight: 16,
  },
  photoContent: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10 },
  photoTitle: {
    fontFamily: homeFont,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.8,
    fontWeight: "700",
  },
  photoBody: { fontFamily: homeFont, fontSize: 14, lineHeight: 19 },
  photoChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 10,
  },
  grow: { flex: 1, minWidth: 0, gap: 4 },
  utilities: { flexDirection: "row", gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: -8 },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, minHeight: 72 },
  rowTitle: { fontFamily: homeFont, fontSize: 15, lineHeight: 20, fontWeight: "600" },
  caption: { fontFamily: homeFont, fontSize: 13, lineHeight: 18 },
  mapPreview: {
    width: 58,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  mapRoad: { position: "absolute", width: 90, height: 10, transform: [{ rotate: "-35deg" }] },
  recent: { flexDirection: "row", gap: 8 },
  recentCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    minHeight: 82,
    borderRadius: 20,
    padding: 12,
    gap: 8,
  },
  manualRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  languageSwitch: { flexDirection: "row", borderRadius: 24, borderWidth: 1, padding: 2 },
  languageChoice: {
    minWidth: controls.minimumTouchTarget,
    minHeight: controls.minimumTouchTarget,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
