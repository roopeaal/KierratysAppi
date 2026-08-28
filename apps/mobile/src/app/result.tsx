import type { ProductLookupResult } from "@kierratysappi/application/lookup-schema";
import type { MaterialFamily, PackagingShape } from "@kierratysappi/domain";
import type { MessageKey } from "@kierratysappi/localization";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Linking, StyleSheet, View } from "react-native";
import {
  AppText,
  BrandLockup,
  Button,
  Eyebrow,
  InlineLink,
  Paper,
  Rule,
  Screen,
  SectionHeader,
  StatusPill,
  sharedStyles,
} from "@/components/ui";
import { SortingResultCard } from "@/components/sorting-result";
import { announceAccessibility } from "@/features/accessibility/announcements";
import { lookupAnnouncement } from "@/features/accessibility/result-announcement";
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { spacing, useAppTheme } from "@/theme/tokens";

export default function ResultScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { language, t } = useLanguage();
  const { state, lookupBarcode, reset } = useScanSession();

  useEffect(() => {
    const announcement = lookupAnnouncement(state, t, language);
    if (announcement) announceAccessibility(announcement.message, announcement.priority);
  }, [language, state, t]);

  const startOver = () => {
    reset();
    router.replace("/");
  };

  if (state.status === "loading") {
    return (
      <Screen scroll={false} style={styles.centered} testID="result-loading-screen">
        <ActivityIndicator size="large" color={palette.pine} accessibilityLabel={t("loading")} />
        <AppText variant="title" style={styles.centerText}>
          {t("loading")}
        </AppText>
        <AppText muted style={styles.centerText}>
          {t("loadingDetail")}
        </AppText>
        <AppText variant="mono" muted>
          {state.gtin}
        </AppText>
      </Screen>
    );
  }

  if (state.status === "offline") {
    return (
      <StateScreen
        eyebrow={t("offlineEyebrow")}
        title={t("offlineTitle")}
        body={t("offlineBody")}
        tone="amber"
        code={state.gtin}
        primary={{ label: t("retry"), onPress: () => void lookupBarcode(state.gtin, "manual") }}
        secondary={{ label: t("materialGuideAction"), onPress: () => router.push("/guide") }}
        close={startOver}
        testID="result-offline-screen"
      />
    );
  }

  if (state.status === "invalid") {
    return (
      <StateScreen
        eyebrow={t("invalidEyebrow")}
        title={t("checkCode")}
        body={t("invalidGtin")}
        tone="brick"
        primary={{ label: t("manualEntry"), onPress: () => router.replace("/manual") }}
        close={startOver}
        testID="result-invalid-screen"
      />
    );
  }

  if (state.status !== "complete") {
    return (
      <StateScreen
        eyebrow={t("emptyScanEyebrow")}
        title={t("cameraTitle")}
        body={t("introBody")}
        tone="cobalt"
        primary={{ label: t("scanAction"), onPress: () => router.replace("/scan") }}
        close={startOver}
        testID="result-empty-screen"
      />
    );
  }

  const { result } = state;
  if (result.status === "not_found") {
    return (
      <StateScreen
        eyebrow={t("unknownProductEyebrow")}
        title={t("notFoundTitle")}
        body={t("notFoundBody")}
        tone="amber"
        code={result.gtin}
        primary={{ label: t("checkCode"), onPress: () => router.replace("/manual") }}
        secondary={{ label: t("materialGuideAction"), onPress: () => router.push("/guide") }}
        close={startOver}
        testID="result-not-found-screen"
      />
    );
  }

  if (result.status === "provider_unavailable") {
    return (
      <StateScreen
        eyebrow={t("unavailableSourceEyebrow")}
        title={t("providerUnavailableTitle")}
        body={t("providerUnavailableBody")}
        tone="brick"
        code={result.gtin}
        primary={{ label: t("retry"), onPress: () => void lookupBarcode(result.gtin, "manual") }}
        secondary={{ label: t("materialGuideAction"), onPress: () => router.push("/guide") }}
        close={startOver}
        testID="result-provider-unavailable-screen"
      />
    );
  }

  return <ProductResult result={result} onClose={startOver} />;
}

function ProductResult({
  result,
  onClose,
}: {
  readonly result: Extract<ProductLookupResult, { status: "resolved" | "packaging_missing" }>;
  readonly onClose: () => void;
}) {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { language, t } = useLanguage();
  const name = result.product.name?.value ?? result.gtin;
  const brand = result.product.brands?.value.join(", ");
  const provenance = result.product.packagingCompleteness.provenance;

  return (
    <Screen testID="product-result-screen">
      <View style={styles.header}>
        <BrandLockup compact />
        <InlineLink
          label={t("close")}
          onPress={onClose}
          role="button"
          testID="result-close-action"
        />
      </View>

      <View style={styles.answerIntro}>
        <Eyebrow>{t("resultEyebrow")}</Eyebrow>
        <AppText variant="title" accessibilityRole="header">
          {t("resultTitle")}
        </AppText>
      </View>

      {result.status === "packaging_missing" ? (
        <View style={styles.resultStack}>
          <Paper style={{ borderColor: palette.amber }} testID="packaging-missing-result">
            <StatusPill label={t("confidenceUnknown")} tone="amber" />
            <AppText variant="heading">{t("packagingMissingTitle")}</AppText>
            <AppText>{t("packagingMissingBody")}</AppText>
          </Paper>
          <Button
            label={t("materialCodeAction")}
            onPress={() => router.push("./material-code")}
            testID="result-material-code-action"
          />
          <Button
            label={t("manualComponentAction")}
            variant="secondary"
            onPress={() => router.push("/component")}
            testID="result-manual-component-action"
          />
          <Button
            label={t("feedbackMissing")}
            variant="secondary"
            onPress={() => router.push("/feedback?category=missing_data")}
            testID="result-missing-feedback-action"
          />
          <AppText variant="small" muted style={styles.centerText}>
            {t("materialCodeLocalNote")}
          </AppText>
        </View>
      ) : (
        <View style={styles.resultStack}>
          <SectionHeader title={t("packagingParts")} />
          {result.components.map(({ observation, sorting }, index) => (
            <View key={observation.id} style={styles.componentBlock}>
              <View style={sharedStyles.tightStack}>
                <AppText variant="mono" style={{ color: palette.cobalt }}>
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {materialLabel(observation.materialFamily?.value, t).toUpperCase()}
                </AppText>
                <AppText variant="heading">{componentLabel(observation, t)}</AppText>
              </View>
              <SortingResultCard result={sorting} />
            </View>
          ))}
        </View>
      )}

      <View style={styles.nextActions}>
        <Button label={t("scanAnother")} onPress={onClose} testID="result-scan-another-action" />
        <Button
          label={t("correctionAction")}
          variant="secondary"
          onPress={() => router.push({ pathname: "/feedback", params: { gtin: result.gtin } })}
          testID="result-feedback-action"
        />
      </View>

      <View style={styles.productSummary}>
        <Rule />
        <SectionHeader title={t("productDetailsTitle")} />
        <View style={sharedStyles.tightStack}>
          <AppText variant="heading">{name}</AppText>
          {brand && <AppText muted>{brand}</AppText>}
          <AppText variant="mono" muted>
            {result.gtin}
          </AppText>
        </View>
        <View style={styles.sourceRow}>
          <StatusPill label={result.cache.hit ? t("cachedLabel") : t("liveLabel")} tone="cobalt" />
          <AppText variant="small" muted>
            {result.provider.name}
          </AppText>
        </View>
        <View style={sharedStyles.tightStack}>
          <AppText variant="small" muted>
            {t("communityDataLabel")} · {t("lastRetrievedLabel")}:{" "}
            {formatDate(provenance.retrievedAt, language)}
          </AppText>
          <View style={styles.disclosureRow}>
            <AppText variant="small" muted>
              {t("dataSourceLabel")}:
            </AppText>
            <InlineLink
              label={result.provider.name}
              onPress={() => void Linking.openURL(provenance.sourceUrl)}
            />
          </View>
          {provenance.license.url && (
            <View style={styles.disclosureRow}>
              <AppText variant="small" muted>
                {t("dataLicenseLabel")}:
              </AppText>
              <InlineLink
                label={provenance.license.name}
                onPress={() => void Linking.openURL(provenance.license.url ?? "")}
              />
            </View>
          )}
          <AppText variant="small" muted>
            {t("dataAttributionLabel")}: {provenance.license.attributionText}
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

type StateScreenProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly tone: "amber" | "brick" | "cobalt";
  readonly code?: string;
  readonly primary: { readonly label: string; readonly onPress: () => void };
  readonly secondary?: { readonly label: string; readonly onPress: () => void };
  readonly close: () => void;
  readonly testID: string;
};

function StateScreen({
  eyebrow,
  title,
  body,
  tone,
  code,
  primary,
  secondary,
  close,
  testID,
}: StateScreenProps) {
  const { t } = useLanguage();
  return (
    <Screen testID={testID}>
      <View style={styles.header}>
        <BrandLockup compact />
        <InlineLink label={t("close")} onPress={close} role="button" testID="result-close-action" />
      </View>
      <View style={styles.stateBody}>
        <StatusPill label={eyebrow} tone={tone} />
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        <AppText>{body}</AppText>
        {code && (
          <AppText variant="mono" muted>
            {code}
          </AppText>
        )}
        <View style={[sharedStyles.stack, styles.stateActions]}>
          <Button label={primary.label} onPress={primary.onPress} testID="result-primary-action" />
          {secondary && (
            <Button
              label={secondary.label}
              variant="secondary"
              onPress={secondary.onPress}
              testID="result-secondary-action"
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

function formatDate(value: string, language: "fi" | "en") {
  return new Intl.DateTimeFormat(language === "fi" ? "fi-FI" : "en-GB", {
    dateStyle: "medium",
  }).format(new Date(value));
}

type Translator = (key: MessageKey) => string;

function materialLabel(value: MaterialFamily | undefined, t: Translator): string {
  if (!value || value === "unknown") return t("materialUnknown");
  if (value === "plastic") return t("materialPlastic");
  if (value === "carton") return t("materialCarton");
  if (value === "paper") return t("materialPaper");
  if (value === "glass") return t("materialGlass");
  if (value === "metal") return t("materialMetal");
  if (value === "wood") return t("materialWood");
  if (value === "composite") return t("materialComposite");
  return t("materialOther");
}

function componentLabel(
  observation: {
    readonly shape?: { readonly value: PackagingShape };
    readonly materialFamily?: { readonly value: MaterialFamily };
    readonly displayName?: { readonly value: string };
  },
  t: Translator,
): string {
  if (observation.shape?.value === "bottle") return t("shapeBottle");
  if (observation.shape?.value === "can") return t("shapeCan");
  if (observation.shape?.value === "jar") return t("shapeJar");
  return observation.displayName?.value ?? materialLabel(observation.materialFamily?.value, t);
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  centered: { justifyContent: "center", alignItems: "center", gap: spacing.md },
  centerText: { textAlign: "center" },
  stateBody: { paddingTop: spacing.xxl, gap: spacing.lg },
  stateActions: { marginTop: spacing.md },
  answerIntro: { paddingTop: spacing.xl, gap: spacing.sm },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  resultStack: { paddingTop: spacing.xl, gap: spacing.md },
  nextActions: { paddingTop: spacing.xl, gap: spacing.md },
  productSummary: { paddingTop: spacing.xl, gap: spacing.md },
  disclosureRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.xs },
  componentBlock: { gap: spacing.sm },
});
