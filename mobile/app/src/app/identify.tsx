import { useRouter } from "expo-router";
import { View } from "react-native";
import { ActionIcon } from "@/components/action-icon";
import { ActionRow, PageHeader, PageIntro, Paper, Screen, sharedStyles } from "@/components/ui";
import { useLanguage } from "@/i18n/language-context";

export default function IdentifyScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <Screen testID="identify-screen">
      <PageHeader onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
      <PageIntro title={t("identifyTitle")} body={t("identifyBody")} />
      <View style={sharedStyles.stack}>
        <Paper>
          <ActionRow
            label={t("cameraTitle")}
            detail={t("identifyScanDetail")}
            leading={<ActionIcon kind="scan" />}
            onPress={() => router.push("/scan")}
            testID="identify-scan-action"
          />
          <ActionRow
            label={t("manualEntry")}
            detail={t("gtinHint")}
            leading={<ActionIcon kind="manual" />}
            onPress={() => router.push("/manual")}
            testID="identify-manual-action"
          />
        </Paper>
        <Paper>
          <ActionRow
            label={t("photoTitle")}
            detail={t("identifyPhotoDetail")}
            leading={<ActionIcon kind="photo" />}
            onPress={() => router.push("/photo")}
            testID="identify-photo-action"
          />
        </Paper>
      </View>
    </Screen>
  );
}
