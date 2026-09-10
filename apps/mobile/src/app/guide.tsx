import { useRouter } from "expo-router";
import { Linking, StyleSheet, View } from "react-native";
import { PackagingMark } from "@/components/packaging-mark";
import {
  AppText,
  BrandLockup,
  Eyebrow,
  InlineLink,
  Paper,
  Screen,
  sharedStyles,
} from "@/components/ui";
import { useLanguage } from "@/i18n/language-context";
import { spacing, useAppTheme } from "@/theme/tokens";

const GUIDE = [
  ["materialPlastic", "guidePlastic", "plastic"],
  ["materialCarton", "guideCarton", "carton"],
  ["materialGlass", "guideGlass", "glass"],
  ["materialMetal", "guideMetal", "metal"],
] as const;

export default function GuideScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { t } = useLanguage();
  return (
    <Screen>
      <View style={styles.header}>
        <BrandLockup compact />
        <InlineLink label={t("close")} onPress={() => router.back()} role="button" />
      </View>
      <View style={styles.intro}>
        <Eyebrow>{t("materialGuideEyebrow")}</Eyebrow>
        <AppText variant="title" accessibilityRole="header">
          {t("materialGuideTitle")}
        </AppText>
        <AppText muted>{t("materialGuideBody")}</AppText>
      </View>
      <View style={styles.grid}>
        {GUIDE.map(([title, body, material]) => (
          <Paper key={title} style={styles.guideCard}>
            <View style={sharedStyles.row}>
              <PackagingMark material={material} />
              <AppText variant="heading" style={sharedStyles.grow}>
                {t(title)}
              </AppText>
            </View>
            <AppText>{t(body)}</AppText>
          </Paper>
        ))}
      </View>
      <Paper
        style={{ backgroundColor: palette.amberSoft, borderWidth: 0, marginBottom: spacing.lg }}
      >
        <AppText style={{ color: palette.amber }}>{t("depositCaution")}</AppText>
      </Paper>
      <View style={sharedStyles.tightStack}>
        <AppText variant="mono" muted>
          {t("ruleSourceLabel").toUpperCase()}
        </AppText>
        <InlineLink
          label="Suomen Pakkauskierrätys RINKI Oy"
          onPress={() =>
            void Linking.openURL("https://rinkiin.fi/lajittelu-kotona/lajitteluohjeet/")
          }
        />
        <AppText variant="small" muted>
          {t("checkedLabel")}: 2026-08-10
        </AppText>
      </View>
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
  intro: { paddingTop: spacing.xl, paddingBottom: spacing.lg, gap: spacing.sm },
  grid: { gap: spacing.md, paddingBottom: spacing.md },
  guideCard: { borderWidth: 0 },
});
