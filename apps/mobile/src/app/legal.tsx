import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { AppText, BrandLockup, Button, Eyebrow, InlineLink, Paper, Screen } from "@/components/ui";
import { announceAccessibility } from "@/features/accessibility/announcements";
import { clearAllLocalData } from "@/features/history/storage";
import { useLanguage } from "@/i18n/language-context";
import { spacing, useAppTheme } from "@/theme/tokens";

export default function LegalScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { t } = useLanguage();
  const [deleted, setDeleted] = useState(false);

  const confirmDeletion = () => {
    Alert.alert(t("deleteLocalDataConfirmTitle"), t("deleteLocalDataConfirmBody"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("deleteLocalDataConfirmAction"),
        style: "destructive",
        onPress: () => {
          void clearAllLocalData().then(() => {
            setDeleted(true);
            announceAccessibility(t("localDataDeleted"), "high");
          });
        },
      },
    ]);
  };
  return (
    <Screen>
      <View style={styles.header}>
        <BrandLockup compact />
        <InlineLink label={t("close")} onPress={() => router.back()} />
      </View>
      <View style={styles.intro}>
        <Eyebrow color={palette.brick}>{t("legalReview")}</Eyebrow>
        <AppText variant="title" accessibilityRole="header">
          {t("legalAction")}
        </AppText>
      </View>
      <Paper>
        <AppText variant="heading">{t("privacyTitle")}</AppText>
        <AppText>{t("privacyDraft")}</AppText>
      </Paper>
      <Paper style={{ borderColor: palette.brick }}>
        <AppText variant="heading">{t("deleteLocalData")}</AppText>
        <AppText>{t("deleteLocalDataBody")}</AppText>
        <Button label={t("deleteLocalData")} variant="danger" onPress={confirmDeletion} />
        {deleted && (
          <AppText accessibilityRole="alert" style={{ color: palette.pine }}>
            {t("localDataDeleted")}
          </AppText>
        )}
      </Paper>
      <Paper>
        <AppText variant="heading">{t("termsTitle")}</AppText>
        <AppText>{t("termsDraft")}</AppText>
      </Paper>
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
});
