import { type BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarcodeMark } from "@/components/packaging-mark";
import { AppText, Button, InlineLink, Screen, sharedStyles } from "@/components/ui";
import { SUPPORTED_BARCODE_TYPES } from "@/features/scan/barcode-formats";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { controls, interaction, radius, spacing, useAppTheme } from "@/theme/tokens";

export default function ScannerScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { t } = useLanguage();
  const { lookupBarcode } = useScanSession();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [locallyLocked, setLocallyLocked] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
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
      <Screen testID="scanner-permission-screen">
        <View style={styles.permissionHeader}>
          <AppText variant="mono" style={{ color: palette.pine }}>
            {t("cameraEyebrow")}
          </AppText>
          <InlineLink
            label={t("close")}
            onPress={() => router.back()}
            role="button"
            testID="scanner-close-action"
          />
        </View>
        <View style={styles.permissionBody}>
          <View
            style={[
              styles.permissionGlyph,
              { borderColor: palette.pine, backgroundColor: palette.pineSoft },
            ]}
          >
            <BarcodeMark color={palette.actionPrimary} />
          </View>
          <AppText variant="title" accessibilityRole="header">
            {t("cameraPermissionTitle")}
          </AppText>
          <AppText>
            {permission?.canAskAgain === false ? t("cameraDenied") : t("cameraPermissionBody")}
          </AppText>
          <View style={[sharedStyles.stack, styles.permissionActions]}>
            {permission?.canAskAgain === false ? (
              <Button
                label={t("openSettings")}
                onPress={() => void Linking.openSettings()}
                testID="scanner-settings-action"
              />
            ) : (
              <Button
                label={t("cameraAction")}
                onPress={() => void requestPermission()}
                testID="scanner-permission-action"
              />
            )}
            <Button
              label={t("manualEntry")}
              variant="secondary"
              onPress={() => router.replace("/manual")}
              testID="scanner-permission-manual-action"
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.cameraScreen} testID="scanner-camera-screen">
      <CameraView
        accessibilityLabel={t("cameraTitle")}
        barcodeScannerSettings={{ barcodeTypes: [...SUPPORTED_BARCODE_TYPES] }}
        enableTorch={torchEnabled}
        onBarcodeScanned={locallyLocked ? undefined : onScanned}
        style={StyleSheet.absoluteFill}
        testID="scanner-camera"
      />
      <View
        style={[
          styles.topOverlay,
          { backgroundColor: palette.cameraOverlay, paddingTop: insets.top + spacing.sm },
        ]}
      >
        <InlineLink
          label={t("close")}
          onPress={() => router.back()}
          color="#FFFFFF"
          role="button"
          testID="scanner-close-action"
        />
        <AppText variant="label" style={{ color: "#FFFFFF", flex: 1, textAlign: "center" }}>
          {t("cameraTitle")}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={torchEnabled ? t("torchTurnOff") : t("torchTurnOn")}
          accessibilityState={{ selected: torchEnabled }}
          hitSlop={8}
          onPress={() => setTorchEnabled((enabled) => !enabled)}
          testID="scanner-torch-action"
          style={({ pressed }) => [
            styles.torchAction,
            torchEnabled && { backgroundColor: "#FFFFFF" },
            pressed && styles.pressed,
          ]}
        >
          <AppText variant="small" style={{ color: torchEnabled ? "#14221B" : "#FFFFFF" }}>
            {t("torchShort")}
          </AppText>
        </Pressable>
      </View>
      <View style={styles.targetArea} pointerEvents="none">
        <View
          accessible
          accessibilityLabel={t("cameraFrameLabel")}
          style={[styles.scanFrame, { borderColor: "#FFFFFF" }]}
          testID="scanner-frame"
        >
          <View style={styles.frameCenter} />
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
          testID="scanner-camera-manual-action"
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
    gap: spacing.sm,
  },
  torchAction: {
    minWidth: 52,
    minHeight: controls.minimumTouchTarget,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.72)",
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: interaction.pressedOpacity },
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
  frameCenter: {
    height: 1,
    width: 24,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  bottomOverlay: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  permissionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  permissionBody: { paddingTop: spacing.xl, gap: spacing.lg },
  permissionGlyph: {
    width: 86,
    height: 86,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionActions: { marginTop: spacing.md },
});
