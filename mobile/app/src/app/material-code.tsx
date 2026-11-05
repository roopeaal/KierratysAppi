import {
  MATERIAL_CODE_INPUT_MAX_LENGTH,
  type MaterialCodeParseResult,
  parseMaterialIdentificationCode,
  type RecognizedMaterialCode,
} from "@kierratysappi/domain";
import { localizedText } from "@kierratysappi/localization";
import type { SortingResult } from "@kierratysappi/recycling-engine";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, Linking, StyleSheet, TextInput, View } from "react-native";
import { SortingResultCard } from "@/components/sorting-result";
import { RecycleAction } from "@/components/recycle-action";
import {
  AppText,
  Button,
  InlineLink,
  PageHeader,
  PageIntro,
  Paper,
  Rule,
  Screen,
  StatusPill,
  sharedStyles,
} from "@/components/ui";
import { announceAccessibility } from "@/features/accessibility/announcements";
import { sortRecognizedMaterialCode } from "@/features/material-code/sorting";
import { recyclingIntent } from "@/features/overview/recording";
import { useLanguage } from "@/i18n/language-context";
import { codeFontFamily } from "@/theme/fonts";
import { radius, spacing, useAppTheme } from "@/theme/tokens";

export default function MaterialCodeScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { palette } = useAppTheme();
  const [value, setValue] = useState("");
  const [attempt, setAttempt] = useState<MaterialCodeParseResult>();
  const [sorting, setSorting] = useState<SortingResult>();
  const [focused, setFocused] = useState(false);
  const [recordingScope] = useState(() => ({}));

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
      <PageHeader onBack={() => router.back()} />
      <PageIntro title={t("materialCodeTitle")} body={t("materialCodeBody")} />

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
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="05 PP"
            placeholderTextColor={palette.faint}
            returnKeyType="search"
            style={[
              styles.input,
              {
                backgroundColor: palette.surfaceRaised,
                borderColor:
                  attempt && attempt.status !== "recognized"
                    ? palette.brick
                    : focused
                      ? palette.actionPrimary
                      : palette.borderStrong,
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
        <AppText variant="small" muted>
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
              recordId={recyclingIntent(recordingScope, "material-code")}
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
  recordId,
}: {
  readonly recognition: RecognizedMaterialCode;
  readonly sorting?: SortingResult;
  readonly onConfirm: () => void;
  readonly recordId: string;
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
          <AppText variant="small" muted>
            {recognition.precision === "exact" ? t("identifierExact") : t("identifierGroup")}
          </AppText>
          <AppText style={styles.code}>{recognition.canonicalCode}</AppText>
          <AppText variant="heading">{localizedText(language, recognition.materialName)}</AppText>
        </View>
        <AppText>{t("materialCodeRecognizedBody")}</AppText>
        <Rule />
        <View style={sharedStyles.tightStack}>
          <AppText variant="small" muted>
            {t("materialCodeSource")}
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
      {sorting && (
        <>
          <SortingResultCard result={sorting} />
          <RecycleAction
            sorting={sorting}
            material={recognition.materialFamily}
            recordId={recordId}
            label={recognition.canonicalCode}
          />
        </>
      )}
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
          <AppText variant="small" muted>
            {t("materialCodeCandidates")}
          </AppText>
          <AppText>{attempt.candidateCodes.join(" · ")}</AppText>
        </View>
      )}
      <Button label={t("manualComponentAction")} variant="secondary" onPress={onManual} />
    </Paper>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  input: {
    minHeight: 60,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontFamily: codeFontFamily,
    fontSize: 20,
    letterSpacing: 1.2,
  },
  result: { paddingTop: spacing.xl },
  codePlate: {
    borderLeftWidth: 3,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  code: {
    fontFamily: codeFontFamily,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -1,
  },
});
