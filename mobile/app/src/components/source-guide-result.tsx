import type { GuideLibraryItem } from "@kierratysappi/recycling-engine";
import { useState } from "react";
import { View } from "react-native";
import { guideLibrary } from "@/features/guide/library";
import { recyclingIntent } from "@/features/overview/recording";
import { openExternalUrl } from "@/features/security/external-links";
import { hsyCategoryIcon } from "@/features/sorting/category-icons";
import { useLanguage } from "@/i18n/language-context";
import { MaterialStudy } from "./material-study";
import { RecyclingRecordAction } from "./recycle-action";
import { AppText, GuidanceHeading, InlineLink, Paper, StatusPill, sharedStyles } from "./ui";
export function SourceGuideResult({ item }: { item: GuideLibraryItem }) {
  const { language, t } = useLanguage();
  const [recordingScope] = useState(() => ({}));
  if (!guideLibrary) return null;
  const library = guideLibrary;
  const data = item[language];
  return (
    <Paper testID="source-guide-result">
      <GuidanceHeading>
        <AppText
          variant="heading"
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
          testID="source-guide-title"
        >
          {data.title}
        </AppText>
      </GuidanceHeading>
      <StatusPill label={t("guideSourceRegion")} tone="pine" />
      <AppText variant="small" muted>
        {t("confidenceLabel")}: {t("guideSourceAssumption")}
      </AppText>
      {data.wasteTypes.length > 0 && (
        <View style={sharedStyles.tightStack}>
          <AppText variant="label">{t("guideSourceWasteTypes")}</AppText>
          {data.wasteTypes.map((v) => {
            const category = hsyCategoryIcon(v.id);
            return (
              <View key={v.id} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {category && <MaterialStudy material={category} size={30} />}
                <AppText style={sharedStyles.grow}>{v.title}</AppText>
              </View>
            );
          })}
        </View>
      )}
      {data.instructions.length > 0 && (
        <AppText testID="source-guide-instructions">{data.instructions}</AppText>
      )}
      {data.translationIncomplete && (
        <AppText variant="small">{t("guideTranslationIncomplete")}</AppText>
      )}
      <RecyclingRecordAction
        recordId={recyclingIntent(recordingScope, item.id)}
        label={data.title}
      />
      <AppText variant="label">{t("guideSourceReceivers")}</AppText>
      {data.receivers.map((r) => (
        <View key={r.id} style={sharedStyles.tightStack} testID="source-guide-receiver">
          <AppText variant="label">{r.title}</AppText>
          {r.description.length > 0 && <AppText>{r.description}</AppText>}
          {r.url && (
            <InlineLink
              label={t("sourceLabel")}
              onPress={() =>
                void openExternalUrl(r.url ?? library.source.url).catch(() => undefined)
              }
            />
          )}
        </View>
      ))}
      <AppText variant="small" muted>
        {t("guideSourceCondition")}
      </AppText>
      <InlineLink
        label={t("guideSourceTitle")}
        onPress={() => void openExternalUrl(library.source.url).catch(() => undefined)}
      />
      <AppText variant="small" muted>
        {t("guideSourceAttribution")}
      </AppText>
      <AppText variant="small" muted>
        {t("ruleJurisdictionLabel")}: FI-HSY · {t("checkedLabel")}: {guideLibrary.checkedAt}
      </AppText>
      <AppText variant="small" muted>
        {t("ruleVersionLabel")}: {guideLibrary.version} · {t("ruleVerificationLabel")}:{" "}
        {t("verificationVerified")}
      </AppText>
      <AppText variant="small" muted>
        {t("sourceRecord")}: {item.id}
      </AppText>
    </Paper>
  );
}
