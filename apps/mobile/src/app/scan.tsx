import { type BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText, Button, InlineLink, Screen, sharedStyles } from "@/components/ui";
import { SUPPORTED_BARCODE_TYPES } from "@/features/scan/barcode-formats";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { radius, spacing, useAppTheme } from "@/theme/tokens";

export default function ScannerScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { t } = useLanguage();
  const { lookupBarcode } = useScanSession();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [locallyLocked, setLocallyLocked] = useState(false);
  const navigating = useRef(false);

  const onScanned = async ({ data }: BarcodeScanningResult) => {
    if (locallyLocked || navigating.current) return;
    setLocallyLocked(true);
    const attempt = await lookupBarcode(data, "camera");
    if (attempt.accepted) {
      navigating.current = true;
      router.replace("/result");
    } else if (attempt.reason !== "busy") {
      setLocallyLocked(false);
    }
  };

  if (!permission?.granted) {
    return (
      <Screen>
        <View style={styles.permissionHeader}>
          <AppText variant="mono" style={{ color: palette.pine }}>
            {t("cameraEyebrow")}
          </AppText>
          <InlineLink label={t("close")} onPress={() => router.back()} />
        </View>
        <View style={styles.permissionBody}>
          <View
            style={[
              styles.permissionGlyph,
              { borderColor: palette.pine, backgroundColor: palette.pineSoft },
            ]}
          >
            <AppText variant="display" style={{ color: palette.pine }}>
              ⌗
            </AppText>
          </View>
          <AppText variant="title" accessibilityRole="header">
            {t("cameraPermissionTitle")}
          </AppText>
          <AppText>
            {permission?.canAskAgain === false ? t("cameraDenied") : t("cameraPermissionBody")}
          </AppText>
          <View style={[sharedStyles.stack, styles.permissionActions]}>
            {permission?.canAskAgain === false ? (
              <Button label={t("openSettings")} onPress={() => void Linking.openSettings()} />
            ) : (
              <Button label={t("cameraAction")} onPress={() => void requestPermission()} />
            )}
            <Button
              label={t("manualEntry")}
              variant="secondary"
              onPress={() => router.replace("/manual")}
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.cameraScreen}>
      <CameraView
        accessibilityLabel={t("cameraTitle")}
        barcodeScannerSettings={{ barcodeTypes: [...SUPPORTED_BARCODE_TYPES] }}
        onBarcodeScanned={locallyLocked ? undefined : onScanned}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.topOverlay,
          { backgroundColor: palette.cameraOverlay, paddingTop: insets.top + spacing.sm },
        ]}
      >
        <InlineLink label={t("close")} onPress={() => router.back()} />
        <AppText variant="label" style={{ color: "#FFFFFF" }}>
          {t("cameraTitle")}
        </AppText>
        <View style={{ width: 44 }} />
      </View>
      <View style={styles.targetArea} pointerEvents="none">
        <View
          accessible
          accessibilityLabel={t("cameraFrameLabel")}
          style={[styles.scanFrame, { borderColor: "#FFFFFF" }]}
        >
          <View style={[styles.scanLine, { backgroundColor: palette.pine }]} />
        </View>
      </View>
      <View
        style={[
          styles.bottomOverlay,
          { backgroundColor: palette.cameraOverlay, paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <AppText variant="heading" style={{ color: "#FFFFFF", textAlign: "center" }}>
          {t("cameraInstruction")}
        </AppText>
        <Button
          label={t("manualEntry")}
          variant="secondary"
          onPress={() => router.replace("/manual")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraScreen: { flex: 1, backgroundColor: "#000000" },
  topOverlay: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  targetArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  scanFrame: {
    width: "82%",
    maxWidth: 440,
    aspectRatio: 1.7,
    borderWidth: 3,
    borderRadius: radius.lg,
    justifyContent: "center",
    overflow: "hidden",
  },
  scanLine: { height: 3, width: "100%" },
  bottomOverlay: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  permissionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  permissionBody: { paddingTop: spacing.xxl, gap: spacing.lg },
  permissionGlyph: {
    width: 86,
    height: 86,
    borderWidth: 2,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionActions: { marginTop: spacing.md },
});
