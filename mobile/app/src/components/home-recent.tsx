import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { homeHistoryPreview } from "@/features/history/home-preview";
import { historyStatusMessageKey } from "@/features/history/presentation";
import { type HistoryEntry, isHistoryEnabled, readHistory } from "@/features/history/storage";
import { useScanSession } from "@/features/scan/session-context";
import { localDataGeneration } from "@/features/security/local-data-generation";
import { useLanguage } from "@/i18n/language-context";
import { HomeSectionHeading, HomeText } from "./home-elements";
import { HomePreviewNotice, HomePreviewRow } from "./home-reference-elements";
import { RecentProductArtwork } from "./recent-product-artwork";

type HistoryState =
  | { kind: "loading" | "disabled" | "error" }
  | { kind: "ready"; items: HistoryEntry[] };

export function HomeRecent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { lookupBarcode } = useScanSession();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.2;
  const [history, setHistory] = useState<HistoryState>({ kind: "loading" });
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const generation = localDataGeneration();
      setHistory({ kind: "loading" });
      const accept = (state: HistoryState) => {
        if (active && generation === localDataGeneration()) setHistory(state);
      };
      void isHistoryEnabled()
        .then(async (enabled) => {
          if (!active) return;
          if (!enabled) return accept({ kind: "disabled" });
          accept({ kind: "ready", items: homeHistoryPreview(await readHistory(), true) });
        })
        .catch(() => accept({ kind: "error" }));
      return () => {
        active = false;
        setHistory({ kind: "loading" });
      };
    }, []),
  );
  return (
    <View testID="home-recent-section">
      <HomeSectionHeading
        title={t("homeRecent")}
        action={t("homeShowAll")}
        testID="home-history-action"
        onPress={() => router.push("/history")}
      />
      {history.kind === "ready" && history.items.length > 0 ? (
        <View style={[styles.group, stacked && styles.stack]}>
          {history.items.map((item) => (
            <View key={item.gtin} style={styles.item}>
              <HomePreviewRow
                compact={!stacked}
                icon="history"
                thumbnail={{ image: <RecentProductArtwork artwork={item.artwork} /> }}
                label={item.productName ?? item.gtin}
                detail={t(historyStatusMessageKey(item.resultStatus))}
                testID={`home-recent-${item.gtin}`}
                onPress={() => {
                  void lookupBarcode(item.gtin, "history").then((attempt) => {
                    if (attempt.accepted) router.push("/result");
                  });
                }}
              />
            </View>
          ))}
        </View>
      ) : (
        <HomePreviewNotice>
          <HomeText variant="small" muted testID="home-history-state">
            {t(
              history.kind === "disabled"
                ? "homeHistoryDisabled"
                : history.kind === "error"
                  ? "homeHistoryError"
                  : history.kind === "loading"
                    ? "settingsLoading"
                    : "homeHistoryEmpty",
            )}
          </HomeText>
        </HomePreviewNotice>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  group: { flexDirection: "row", gap: 8 },
  stack: { flexDirection: "column" },
  item: { flex: 1, minWidth: 0 },
});
