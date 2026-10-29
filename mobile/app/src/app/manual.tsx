import { useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, StyleSheet, TextInput, View } from "react-native";
import {
  AppText,
  Button,
  PageHeader,
  PageIntro,
  Paper,
  Screen,
  sharedStyles,
} from "@/components/ui";
import { announceAccessibility } from "@/features/accessibility/announcements";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { codeFontFamily } from "@/theme/fonts";
import { controls, radius, spacing, useAppTheme } from "@/theme/tokens";

export default function ManualEntryScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { t } = useLanguage();
  const { lookupBarcode } = useScanSession();
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [focused, setFocused] = useState(false);

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
      <PageHeader onBack={() => router.back()} testID="manual-close-action" />
      <PageIntro title={t("manualEntry")} body={t("manualLocation")} />
      <Paper style={styles.body}>
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
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="3017 6204 22003"
            placeholderTextColor={palette.faint}
            returnKeyType="search"
            style={[
              styles.input,
              {
                backgroundColor: palette.surfaceRaised,
                borderColor: invalid
                  ? palette.brick
                  : focused
                    ? palette.actionPrimary
                    : palette.borderStrong,
                color: palette.ink,
              },
            ]}
            value={value}
            testID="manual-gtin-input"
          />
          <AppText variant="small" muted>
            {t("gtinHint")}
          </AppText>
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
      </Paper>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
  input: {
    minHeight: controls.inputMinHeight,
    borderWidth: 2,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: codeFontFamily,
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
