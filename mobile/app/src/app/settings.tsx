import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ActionIcon } from "@/components/action-icon";
import {
  ActionRow,
  AppText,
  DocumentSection,
  PageHeader,
  PageIntro,
  Screen,
} from "@/components/ui";
import { isHistoryEnabled } from "@/features/history/storage";
import { useLanguage } from "@/i18n/language-context";
import { controls, interaction, radius, spacing, useAppTheme } from "@/theme/tokens";

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { palette } = useAppTheme();
  const [history, setHistory] = useState<boolean | "loading" | "error">("loading");
  useFocusEffect(
    useCallback(() => {
      let active = true;
      isHistoryEnabled()
        .then((enabled) => {
          if (active) setHistory(enabled);
        })
        .catch(() => {
          if (active) setHistory("error");
        });
      return () => {
        active = false;
      };
    }, []),
  );
  return (
    <Screen testID="settings-screen">
      <PageHeader onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
      <PageIntro title={t("settingsTitle")} />
      <DocumentSection>
        <AppText variant="heading" accessibilityRole="header">
          {t("settingsLanguage")}
        </AppText>
        <View
          style={styles.languages}
          accessibilityRole="radiogroup"
          accessibilityLabel={t("languageLabel")}
        >
          {(["fi", "en"] as const).map((item) => (
            <Pressable
              key={item}
              accessibilityRole="radio"
              accessibilityLabel={item === "fi" ? t("finnish") : t("english")}
              accessibilityState={{ checked: language === item }}
              aria-checked={language === item}
              onPress={() => setLanguage(item)}
              testID={`settings-language-${item}`}
              style={({ pressed }) => [
                styles.language,
                {
                  backgroundColor: language === item ? palette.pineSoft : palette.bgSurface,
                  borderColor: language === item ? palette.actionLink : palette.borderSubtle,
                  opacity: pressed ? interaction.pressedOpacity : 1,
                },
              ]}
            >
              <AppText variant="label">{item === "fi" ? t("finnish") : t("english")}</AppText>
            </Pressable>
          ))}
        </View>
      </DocumentSection>
      <ActionRow
        label={t("settingsHistory")}
        detail={t(
          history === "loading"
            ? "settingsLoading"
            : history === "error"
              ? "settingsReadError"
              : history
                ? "homeHistoryOn"
                : "homeHistoryOff",
        )}
        leading={<ActionIcon kind="history" />}
        onPress={() => router.push("/history")}
        testID="settings-history-action"
      />
      <ActionRow
        label={t("settingsGuidance")}
        detail={t("homeJurisdiction")}
        leading={<ActionIcon kind="guide" />}
        onPress={() => router.push("/guide")}
        testID="settings-guide-action"
      />
      <ActionRow
        label={t("legalAction")}
        onPress={() => router.push("/legal")}
        testID="settings-legal-action"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  languages: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  language: {
    minHeight: controls.minimumTouchTarget,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: "center",
  },
});
