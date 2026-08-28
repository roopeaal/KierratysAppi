import { useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, StyleSheet, TextInput, View } from "react-native";
import { AppText, BrandLockup, Button, InlineLink, Screen, sharedStyles } from "@/components/ui";
import { announceAccessibility } from "@/features/accessibility/announcements";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { controls, radius, spacing, useAppTheme } from "@/theme/tokens";

export default function ManualEntryScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { t } = useLanguage();
  const { lookupBarcode } = useScanSession();
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);

  const submit = async () => {
    Keyboard.dismiss();
    const attempt = await lookupBarcode(value, "manual");
    if (!attempt.accepted && attempt.reason === "invalid") {
      setInvalid(true);
      announceAccessibility(t("invalidGtin"), "high");
      return;
    }
    if (attempt.accepted) router.replace("/result");
  };

  return (
    <Screen testID="manual-entry-screen">
      <View style={styles.header}>
        <BrandLockup compact />
        <InlineLink
          label={t("close")}
          onPress={() => router.back()}
          role="button"
          testID="manual-close-action"
        />
      </View>
      <View style={styles.body}>
        <AppText variant="title" accessibilityRole="header">
          {t("manualEntry")}
        </AppText>
        <AppText muted>{t("gtinHint")}</AppText>
        <View style={sharedStyles.tightStack}>
          <AppText variant="label" nativeID="gtin-label">
            {t("gtinLabel")}
          </AppText>
          <TextInput
            accessibilityLabel={t("gtinLabel")}
            accessibilityLabelledBy="gtin-label"
            accessibilityHint={t("gtinHint")}
            autoComplete="off"
            autoCorrect={false}
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={32}
            onChangeText={(text) => {
              setValue(text);
              setInvalid(false);
            }}
            onSubmitEditing={() => void submit()}
            placeholder="3017 6204 22003"
            placeholderTextColor={palette.faint}
            returnKeyType="search"
            style={[
              styles.input,
              {
                backgroundColor: palette.surfaceRaised,
                borderColor: invalid ? palette.brick : palette.line,
                color: palette.ink,
              },
            ]}
            value={value}
            testID="manual-gtin-input"
          />
          {invalid && (
            <AppText style={{ color: palette.brick }} accessibilityRole="alert">
              {t("invalidGtin")}
            </AppText>
          )}
        </View>
        <Button
          label={t("lookupAction")}
          onPress={() => void submit()}
          disabled={value.trim().length === 0}
          testID="manual-submit-action"
        />
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
  body: { paddingTop: spacing.xxl, gap: spacing.lg },
  input: {
    minHeight: controls.inputMinHeight,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontFamily: "IBMPlexMono_600SemiBold",
    fontSize: 20,
    letterSpacing: 1.2,
  },
});
