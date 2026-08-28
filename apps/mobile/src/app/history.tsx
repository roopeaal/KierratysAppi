import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import {
  AppText,
  BrandLockup,
  Button,
  Eyebrow,
  InlineLink,
  Paper,
  Screen,
  sharedStyles,
} from "@/components/ui";
import {
  clearHistory,
  isHistoryEnabled,
  readHistory,
  setHistoryEnabled,
  type HistoryEntry,
} from "@/features/history/storage";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { spacing, useAppTheme } from "@/theme/tokens";

export default function HistoryScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { t } = useLanguage();
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
      <View style={styles.header}>
        <BrandLockup compact />
        <InlineLink label={t("close")} onPress={() => router.back()} role="button" />
      </View>
      <View style={styles.intro}>
        <Eyebrow>{t("localOnly").toUpperCase()}</Eyebrow>
        <AppText variant="title" accessibilityRole="header">
          {t("historyTitle")}
        </AppText>
        <AppText muted>{enabled ? t("historyOn") : t("historyOff")}</AppText>
      </View>
      <Button
        label={enabled ? t("disableHistory") : t("enableHistory")}
        variant={enabled ? "secondary" : "primary"}
        onPress={() => void toggle()}
      />
      <View style={styles.list}>
        {entries.length === 0 ? (
          <Paper>
            <AppText muted>{t("emptyHistory")}</AppText>
          </Paper>
        ) : (
          entries.map((entry) => (
            <Paper key={`${entry.gtin}-${entry.scannedAt}`}>
              <View style={[sharedStyles.row, { justifyContent: "space-between" }]}>
                <View style={sharedStyles.grow}>
                  <AppText variant="heading">{entry.productName ?? entry.gtin}</AppText>
                  <AppText variant="mono" muted>
                    {entry.gtin}
                  </AppText>
                  <AppText variant="small" muted>
                    {entry.scannedAt.slice(0, 10)} · {entry.resultStatus}
                  </AppText>
                </View>
                <InlineLink
                  label={t("openResult")}
                  onPress={() => void openEntry(entry.gtin)}
                  role="button"
                />
              </View>
            </Paper>
          ))
        )}
      </View>
      {entries.length > 0 && (
        <Button label={t("clearHistory")} variant="danger" onPress={confirmClear} />
      )}
      <AppText variant="small" style={{ color: palette.muted }}>
        {t("privacySummary")}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  intro: { paddingTop: spacing.xxl, paddingBottom: spacing.lg, gap: spacing.sm },
  list: { paddingVertical: spacing.lg, gap: spacing.md },
});
