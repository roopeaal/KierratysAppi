import type { SortingResult, SortingRuleReference } from "@kierratysappi/recycling-engine";
import { Linking, StyleSheet, View } from "react-native";
import { localizedText } from "@kierratysappi/localization";
import { destinationMessageKey, unknownReasonMessageKey } from "@/features/sorting/presentation";
import { useLanguage } from "@/i18n/language-context";
import { radius, spacing, useAppTheme } from "@/theme/tokens";
import { AppText, InlineLink, Paper, Rule, StatusPill, sharedStyles } from "./ui";

export function SortingResultCard({ result }: { readonly result: SortingResult }) {
  const { language, t } = useLanguage();
  const { palette } = useAppTheme();
  const confidenceKey = {
    verified: "confidenceVerified",
    high: "confidenceHigh",
    medium: "confidenceMedium",
    low: "confidenceLow",
    unknown: "confidenceUnknown",
  } as const;
  const tone =
    result.confidence.tier === "verified" || result.confidence.tier === "high"
      ? "pine"
      : result.confidence.tier === "medium"
        ? "amber"
        : "brick";

  if (result.status === "resolved") {
    return (
      <Paper testID="sorting-result-resolved">
        <View style={[styles.destination, { backgroundColor: palette.pineSoft }]}>
          <AppText variant="mono" style={{ color: palette.pine }}>
            {t("destinationLabel").toUpperCase()}
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            {localizedText(language, result.destination.label)}
          </AppText>
        </View>
        <ConfidenceRow
          label={t(confidenceKey[result.confidence.tier])}
          score={result.confidence.score}
          tone={tone}
          accessibilityLabel={t("confidenceLabel")}
        />
        <Rule />
        <GuidanceBlock
          label={t("preparationLabel")}
          body={localizedText(language, result.preparation)}
        />
        <GuidanceBlock label={t("whyLabel")} body={localizedText(language, result.explanation)} />
        {result.exceptions.map((exception) => (
          <View
            key={exception.en}
            style={[styles.exception, { backgroundColor: palette.amberSoft }]}
          >
            <AppText style={{ color: palette.amber }}>{localizedText(language, exception)}</AppText>
          </View>
        ))}
        <Rule />
        <RuleReferences sources={[result.rule]} />
      </Paper>
    );
  }

  if (result.status === "ambiguous") {
    return (
      <Paper style={{ borderColor: palette.amber }} testID="sorting-result-ambiguous">
        <ConfidenceRow
          label={t("needsCheckLabel")}
          score={result.confidence.score}
          tone="amber"
          accessibilityLabel={t("confidenceLabel")}
        />
        <AppText variant="heading" accessibilityRole="header">
          {localizedText(language, result.question)}
        </AppText>
        <View style={sharedStyles.tightStack}>
          <AppText variant="mono" muted>
            {t("possibleDestinations").toUpperCase()}
          </AppText>
          {result.candidateDestinations.map((destination) => (
            <AppText key={destination}>• {t(destinationMessageKey(destination))}</AppText>
          ))}
        </View>
        <Rule />
        <RuleReferences sources={result.sources} />
      </Paper>
    );
  }

  return (
    <Paper style={{ borderColor: palette.brick }} testID="sorting-result-unknown">
      <ConfidenceRow
        label={t("confidenceUnknown")}
        score={result.confidence.score}
        tone="brick"
        accessibilityLabel={t("confidenceLabel")}
      />
      <AppText variant="heading" accessibilityRole="header">
        {localizedText(language, result.nextAction)}
      </AppText>
      <AppText muted>{t(unknownReasonMessageKey(result.reason))}</AppText>
      <Rule />
      {result.sources.length > 0 ? (
        <RuleReferences sources={result.sources} />
      ) : (
        <AppText variant="small" muted>
          {t("noApplicableRuleSource")}
        </AppText>
      )}
    </Paper>
  );
}

function ConfidenceRow({
  label,
  score,
  tone,
  accessibilityLabel,
}: {
  readonly label: string;
  readonly score: number;
  readonly tone: "pine" | "amber" | "brick" | "cobalt";
  readonly accessibilityLabel: string;
}) {
  const percentage = Math.round(score * 100);
  return (
    <View style={styles.statusRow}>
      <StatusPill label={label} tone={tone} />
      <AppText
        variant="mono"
        muted
        accessibilityLabel={`${accessibilityLabel}: ${label}, ${percentage}%`}
      >
        {percentage}%
      </AppText>
    </View>
  );
}

function RuleReferences({ sources }: { readonly sources: readonly SortingRuleReference[] }) {
  const { t } = useLanguage();
  return (
    <View style={sharedStyles.stack}>
      <AppText variant="mono" muted>
        {t("ruleSourceLabel").toUpperCase()}
      </AppText>
      {sources.map((source) => (
        <View key={source.id} style={sharedStyles.tightStack}>
          <InlineLink
            label={source.sourceName}
            onPress={() => void Linking.openURL(source.sourceUrl)}
          />
          <AppText variant="small" muted>
            {t("ruleJurisdictionLabel")}: {source.jurisdiction} · {t("checkedLabel")}:{" "}
            {source.checkedAt}
          </AppText>
          <AppText variant="small" muted>
            {t("ruleVersionLabel")}: {source.version} · {t("ruleVerificationLabel")}:{" "}
            {t("verificationVerified")}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function GuidanceBlock({ label, body }: { readonly label: string; readonly body: string }) {
  return (
    <View style={sharedStyles.tightStack}>
      <AppText variant="mono" muted>
        {label.toUpperCase()}
      </AppText>
      <AppText>{body}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  destination: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.md },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  exception: { padding: spacing.md, borderRadius: radius.md },
});
