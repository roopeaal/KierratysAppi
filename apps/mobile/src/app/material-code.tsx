import {
  MATERIAL_CODE_INPUT_MAX_LENGTH,
  parseMaterialIdentificationCode,
  type MaterialCodeParseResult,
  type RecognizedMaterialCode,
} from "@kierratysappi/domain";
import { localizedText } from "@kierratysappi/localization";
import type { SortingResult } from "@kierratysappi/recycling-engine";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, Linking, StyleSheet, TextInput, View } from "react-native";
import { SortingResultCard } from "@/components/sorting-result";
import {
  AppText,
  BrandLockup,
  Button,
  Eyebrow,
  InlineLink,
  Paper,
  Rule,
  Screen,
  StatusPill,
  sharedStyles,
} from "@/components/ui";
import { announceAccessibility } from "@/features/accessibility/announcements";
import { sortRecognizedMaterialCode } from "@/features/material-code/sorting";
import { useLanguage } from "@/i18n/language-context";
import { radius, spacing, useAppTheme } from "@/theme/tokens";

export default function MaterialCodeScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { palette } = useAppTheme();
  const [value, setValue] = useState("");
  const [attempt, setAttempt] = useState<MaterialCodeParseResult>();
  const [sorting, setSorting] = useState<SortingResult>();

  const parse = () => {
    Keyboard.dismiss();
    const nextAttempt = parseMaterialIdentificationCode(value);
    setAttempt(nextAttempt);
    setSorting(undefined);
    announceAccessibility(
      nextAttempt.status === "recognized"
        ? t("materialCodeRecognized")
        : nextAttempt.status === "ambiguous"
          ? t("materialCodeAmbiguousTitle")
          : t("materialCodeUnknownTitle"),
      nextAttempt.status === "recognized" ? "default" : "high",
    );
  };

  const confirm = (recognition: RecognizedMaterialCode) => {
    const observedAt = new Date().toISOString();
    const nextSorting = sortRecognizedMaterialCode({
      recognition,
      language,
      observedAt,
      componentId: `material-code-${Date.now()}`,
    });
    setSorting(nextSorting);
    announceAccessibility(sortingAnnouncement(nextSorting, language));
  };

  return (
    <Screen>
      <View style={styles.header}>
        <BrandLockup compact />
        <InlineLink label={t("close")} onPress={() => router.back()} role="button" />
      </View>

      <View style={styles.hero}>
        <Eyebrow>{t("materialCodeEyebrow")}</Eyebrow>
        <AppText variant="title" accessibilityRole="header">
          {t("materialCodeTitle")}
        </AppText>
        <AppText muted>{t("materialCodeBody")}</AppText>
      </View>

      <View style={styles.form}>
        <View style={sharedStyles.tightStack}>
          <AppText variant="label" nativeID="material-code-label">
            {t("materialCodeLabel")}
          </AppText>
          <TextInput
            accessibilityLabel={t("materialCodeLabel")}
            accessibilityLabelledBy="material-code-label"
            accessibilityHint={t("materialCodeHint")}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect={false}
            inputMode="text"
            maxLength={MATERIAL_CODE_INPUT_MAX_LENGTH}
            onChangeText={(text) => {
              setValue(text);
              setAttempt(undefined);
              setSorting(undefined);
            }}
            onSubmitEditing={parse}
            placeholder="05 PP"
            placeholderTextColor={palette.faint}
            returnKeyType="search"
            style={[
              styles.input,
              {
                backgroundColor: palette.surfaceRaised,
                borderColor:
                  attempt && attempt.status !== "recognized" ? palette.brick : palette.line,
                color: palette.ink,
              },
            ]}
            value={value}
          />
          <AppText variant="small" muted>
            {t("materialCodeHint")}
          </AppText>
        </View>
        <Button
          label={t("materialCodeParseAction")}
          onPress={parse}
          disabled={value.trim().length === 0}
        />
        <AppText variant="small" muted style={styles.centerText}>
          {t("materialCodeLocalNote")}
        </AppText>
      </View>

      {attempt && (
        <View accessibilityLiveRegion="polite" style={styles.result}>
          {attempt.status === "recognized" ? (
            <RecognizedCode
              recognition={attempt}
              sorting={sorting}
              onConfirm={() => confirm(attempt)}
            />
          ) : (
            <UnresolvedCode attempt={attempt} onManual={() => router.push("/component")} />
          )}
        </View>
      )}
    </Screen>
  );
}

function sortingAnnouncement(result: SortingResult, language: "fi" | "en"): string {
  if (result.status === "resolved") return localizedText(language, result.destination.label);
  if (result.status === "ambiguous") return localizedText(language, result.question);
  return localizedText(language, result.nextAction);
}

function RecognizedCode({
  recognition,
  sorting,
  onConfirm,
}: {
  readonly recognition: RecognizedMaterialCode;
  readonly sorting?: SortingResult;
  readonly onConfirm: () => void;
}) {
  const { language, t } = useLanguage();
  const { palette } = useAppTheme();

  return (
    <View style={sharedStyles.stack}>
      <Paper style={{ borderColor: sorting ? palette.pine : palette.amber }}>
        <StatusPill
          label={sorting ? t("localObservation") : t("materialCodeRecognized")}
          tone={sorting ? "pine" : "amber"}
        />
        <View
          style={[
            styles.codePlate,
            { backgroundColor: palette.surfaceRaised, borderColor: palette.ink },
          ]}
        >
          <AppText variant="mono" muted>
            {recognition.precision === "exact" ? t("identifierExact") : t("identifierGroup")}
          </AppText>
          <AppText style={styles.code} adjustsFontSizeToFit numberOfLines={1}>
            {recognition.canonicalCode}
          </AppText>
          <AppText variant="heading">{localizedText(language, recognition.materialName)}</AppText>
        </View>
        <AppText>{t("materialCodeRecognizedBody")}</AppText>
        <Rule />
        <View style={sharedStyles.tightStack}>
          <AppText variant="mono" muted>
            {t("materialCodeSource").toUpperCase()}
          </AppText>
          <InlineLink
            label={recognition.source.sourceName}
            onPress={() => void Linking.openURL(recognition.source.sourceUrl)}
          />
          <AppText variant="small" muted>
            {recognition.source.jurisdiction} · {recognition.source.version} · {t("checkedLabel")}:{" "}
            {recognition.source.checkedAt}
          </AppText>
        </View>
        {!sorting && <Button label={t("materialCodeConfirmAction")} onPress={onConfirm} />}
      </Paper>
      {sorting && <SortingResultCard result={sorting} />}
    </View>
  );
}

function UnresolvedCode({
  attempt,
  onManual,
}: {
  readonly attempt: Exclude<MaterialCodeParseResult, { status: "recognized" }>;
  readonly onManual: () => void;
}) {
  const { t } = useLanguage();
  const { palette } = useAppTheme();
  const ambiguous = attempt.status === "ambiguous";

  return (
    <Paper style={{ borderColor: ambiguous ? palette.amber : palette.brick }}>
      <StatusPill
        label={ambiguous ? t("needsCheckLabel") : t("confidenceUnknown")}
        tone={ambiguous ? "amber" : "brick"}
      />
      <AppText variant="heading" accessibilityRole="alert">
        {ambiguous ? t("materialCodeAmbiguousTitle") : t("materialCodeUnknownTitle")}
      </AppText>
      <AppText>{ambiguous ? t("materialCodeAmbiguousBody") : t("materialCodeUnknownBody")}</AppText>
      {ambiguous && attempt.candidateCodes.length > 0 && (
        <View style={sharedStyles.tightStack}>
          <AppText variant="mono" muted>
            {t("materialCodeCandidates").toUpperCase()}
          </AppText>
          <AppText>{attempt.candidateCodes.join(" · ")}</AppText>
        </View>
      )}
      <Button label={t("manualComponentAction")} variant="secondary" onPress={onManual} />
    </Paper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  hero: { paddingTop: spacing.xxl, gap: spacing.sm },
  form: { paddingTop: spacing.xl, gap: spacing.md },
  input: {
    minHeight: 60,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontFamily: "IBMPlexMono_600SemiBold",
    fontSize: 20,
    letterSpacing: 1.2,
  },
  centerText: { textAlign: "center" },
  result: { paddingTop: spacing.xl },
  codePlate: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  code: {
    fontFamily: "IBMPlexMono_600SemiBold",
    fontSize: 36,
    lineHeight: 43,
    letterSpacing: -1,
  },
});
