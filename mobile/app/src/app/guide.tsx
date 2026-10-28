import { useRouter } from "expo-router";
import { Linking, StyleSheet, View } from "react-native";
import {
  AppText,
  DocumentSection,
  InlineLink,
  PageHeader,
  PageIntro,
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
      <PageHeader onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
      <PageIntro title={t("materialGuideTitle")} body={t("materialGuideBody")} />
      <View style={styles.grid}>
        {GUIDE.map(([title, body]) => (
          <DocumentSection key={title}>
            <AppText variant="heading" accessibilityRole="header">
              {t(title)}
            </AppText>
            <AppText>{t(body)}</AppText>
          </DocumentSection>
        ))}
      </View>
      <Paper
        style={{ backgroundColor: palette.amberSoft, borderWidth: 0, marginBottom: spacing.lg }}
      >
        <AppText style={{ color: palette.amber }}>{t("depositCaution")}</AppText>
      </Paper>
      <View style={sharedStyles.tightStack}>
        <AppText variant="small" muted>
          {t("ruleSourceLabel")}
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
  grid: { paddingBottom: spacing.sm },
});
