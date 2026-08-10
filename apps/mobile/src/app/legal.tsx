import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppText, BrandLockup, Eyebrow, InlineLink, Paper, Screen } from "@/components/ui";
import { useLanguage } from "@/i18n/language-context";
import { spacing, useAppTheme } from "@/theme/tokens";

export default function LegalScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { t } = useLanguage();
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
