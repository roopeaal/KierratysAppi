import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import {
  ActionRow,
  AppText,
  Button,
  DocumentSection,
  PageHeader,
  PageIntro,
  Screen,
} from "@/components/ui";
import { formatHistoryDate, historyStatusMessageKey } from "@/features/history/presentation";
import {
  clearHistory,
  type HistoryEntry,
  isHistoryEnabled,
  readHistory,
  setHistoryEnabled,
} from "@/features/history/storage";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { spacing } from "@/theme/tokens";

export default function HistoryScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { lookupBarcode } = useScanSession();
  const [enabled, setEnabled] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  const refresh = useCallback(() => {
    void Promise.all([isHistoryEnabled(), readHistory()]).then(([nextEnabled, nextEntries]) => {
      setEnabled(nextEnabled);
      setEntries(nextEntries);
    });
  }, []);
  useFocusEffect(refresh);

  const toggle = async () => {
    await setHistoryEnabled(!enabled);
    refresh();
  };
  const confirmClear = () => {
    Alert.alert(t("clearHistoryConfirmTitle"), t("clearHistoryConfirmBody"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("clearHistoryConfirmAction"),
        style: "destructive",
        onPress: () => {
          void clearHistory().then(refresh);
        },
      },
    ]);
  };
  const openEntry = async (gtin: string) => {
    const attempt = await lookupBarcode(gtin, "history");
    if (attempt.accepted) router.push("/result");
  };

  return (
    <Screen>
      <PageHeader onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
      <PageIntro title={t("historyTitle")} body={enabled ? t("historyOn") : t("historyOff")} />
      <Button
        label={enabled ? t("disableHistory") : t("enableHistory")}
        variant={enabled ? "danger" : "primary"}
        onPress={() => void toggle()}
      />
      <View style={styles.list}>
        {entries.length === 0 ? (
          <DocumentSection>
            <AppText muted>{t("emptyHistory")}</AppText>
          </DocumentSection>
        ) : (
          entries.map((entry) => (
            <ActionRow
              key={`${entry.gtin}-${entry.scannedAt}`}
              label={entry.productName ?? entry.gtin}
              detail={`${formatHistoryDate(entry.scannedAt, language) ?? t("historyDateUnknown")} · ${t(historyStatusMessageKey(entry.resultStatus))}\n${entry.gtin}`}
              onPress={() => void openEntry(entry.gtin)}
            />
          ))
        )}
      </View>
      {entries.length > 0 && (
        <Button label={t("clearHistory")} variant="danger" onPress={confirmClear} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: spacing.lg },
});
