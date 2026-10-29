import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { IconDisc } from "@/components/home-elements";
import {
  ActionRow,
  AppText,
  Chevron,
  PageHeader,
  PageIntro,
  Paper,
  Screen,
  sharedStyles,
} from "@/components/ui";
import { useLanguage } from "@/i18n/language-context";
import { interaction, radius, spacing, useAppTheme } from "@/theme/tokens";

export default function IdentifyScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { palette } = useAppTheme();
  const { width, fontScale } = useWindowDimensions();
  const stackPhoto = fontScale > 1.2 || width < 360;
  const [photoFocused, setPhotoFocused] = useState(false);
  return (
    <Screen testID="identify-screen">
      <PageHeader onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
      <PageIntro title={t("identifyTitle")} body={t("identifyBody")} />
      <View style={sharedStyles.stack}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("photoTitle")}
          accessibilityHint={t("identifyPhotoDetail")}
          onPress={() => router.push("/photo")}
          onFocus={() => setPhotoFocused(true)}
          onBlur={() => setPhotoFocused(false)}
          testID="identify-photo-action"
          style={({ pressed }) => [
            styles.photoAction,
            stackPhoto && styles.photoStack,
            {
              backgroundColor: palette.pineSoft,
              borderColor: photoFocused ? palette.actionLink : "transparent",
              opacity: pressed ? interaction.pressedOpacity : 1,
            },
          ]}
        >
          <IconDisc kind="photo" blue />
          <View style={[styles.photoCopy, !stackPhoto && sharedStyles.grow]}>
            <AppText variant="heading">{t("photoTitle")}</AppText>
            <AppText variant="small" muted>
              {t("identifyPhotoDetail")}
            </AppText>
          </View>
          {!stackPhoto && <Chevron />}
        </Pressable>
        <Paper>
          <ActionRow
            label={t("cameraTitle")}
            detail={t("identifyScanDetail")}
            leading={<IconDisc kind="scan" compact />}
            onPress={() => router.push("/scan")}
            testID="identify-scan-action"
          />
          <ActionRow
            label={t("manualEntry")}
            detail={t("gtinHint")}
            leading={<IconDisc kind="manual" compact />}
            onPress={() => router.push("/manual")}
            testID="identify-manual-action"
          />
        </Paper>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photoAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 148,
    padding: 20,
    borderWidth: 2,
    borderRadius: radius.lg,
  },
  photoStack: { flexDirection: "column", alignItems: "flex-start" },
  photoCopy: { minWidth: 0, flexShrink: 1, gap: spacing.xs },
});
