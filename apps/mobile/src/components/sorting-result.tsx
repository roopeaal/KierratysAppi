import type { SortingResult } from "@kierratysappi/recycling-engine";
import { Linking, StyleSheet, View } from "react-native";
import { localizedText } from "@kierratysappi/localization";
import { useLanguage } from "@/i18n/language-context";
import { spacing, useAppTheme } from "@/theme/tokens";
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
      <Paper>
        <View style={styles.statusRow}>
          <StatusPill label={t(confidenceKey[result.confidence.tier])} tone={tone} />
          <AppText variant="mono" muted>
            {Math.round(result.confidence.score * 100)}%
          </AppText>
        </View>
        <View style={sharedStyles.tightStack}>
          <AppText variant="mono" style={{ color: palette.pine }}>
            {t("destinationLabel").toUpperCase()}
          </AppText>
          <AppText variant="title">{localizedText(language, result.destination.label)}</AppText>
        </View>
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
        <View style={sharedStyles.tightStack}>
          <AppText variant="mono" muted>
            {t("ruleSourceLabel").toUpperCase()}
          </AppText>
          <InlineLink
            label={result.rule.sourceName}
            onPress={() => void Linking.openURL(result.rule.sourceUrl)}
          />
          <AppText variant="small" muted>
            {t("checkedLabel")}: {result.rule.checkedAt} · {result.rule.version}
          </AppText>
        </View>
      </Paper>
    );
  }

  if (result.status === "ambiguous") {
    return (
      <Paper style={{ borderColor: palette.amber }}>
        <StatusPill label={t("needsCheckLabel")} tone="amber" />
        <AppText variant="heading">{localizedText(language, result.question)}</AppText>
        <View style={sharedStyles.tightStack}>
          <AppText variant="mono" muted>
            {t("possibleDestinations").toUpperCase()}
          </AppText>
          {result.candidateDestinations.map((destination) => (
            <AppText key={destination}>• {destination.replaceAll("_", " ")}</AppText>
          ))}
        </View>
        {result.sources.map((source) => (
          <InlineLink
            key={source.id}
            label={source.sourceName}
            onPress={() => void Linking.openURL(source.sourceUrl)}
          />
        ))}
      </Paper>
    );
  }

  return (
    <Paper style={{ borderColor: palette.brick }}>
      <StatusPill label={t("confidenceUnknown")} tone="brick" />
      <AppText variant="heading">{localizedText(language, result.nextAction)}</AppText>
      <AppText variant="small" muted>
        {result.reason.replaceAll("_", " ")}
      </AppText>
    </Paper>
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
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  exception: { padding: spacing.md, borderRadius: 12 },
});
