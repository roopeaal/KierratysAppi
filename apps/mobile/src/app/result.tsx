import type { ProductLookupResult } from "@kierratysappi/application/lookup-schema";
import { useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
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
import { useScanSession } from "@/features/scan/session-context";
import { useLanguage } from "@/i18n/language-context";
import { spacing, useAppTheme } from "@/theme/tokens";

export default function ResultScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { t } = useLanguage();
  const { state, lookupBarcode, reset } = useScanSession();

  const startOver = () => {
    reset();
    router.replace("/");
  };

  if (state.status === "loading") {
    return (
      <Screen scroll={false} style={styles.centered}>
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
        eyebrow="OFFLINE / SAVED LOCAL"
        title={t("offlineTitle")}
        body={t("offlineBody")}
        tone="amber"
        code={state.gtin}
        primary={{ label: t("retry"), onPress: () => void lookupBarcode(state.gtin, "manual") }}
        secondary={{ label: t("materialGuideAction"), onPress: () => router.push("/guide") }}
        close={startOver}
      />
    );
  }

  if (state.status === "invalid") {
    return (
      <StateScreen
        eyebrow="GTIN / INVALID"
        title={t("checkCode")}
        body={t("invalidGtin")}
        tone="brick"
        primary={{ label: t("manualEntry"), onPress: () => router.replace("/manual") }}
        close={startOver}
      />
    );
  }

  if (state.status !== "complete") {
    return (
      <StateScreen
        eyebrow="SCAN / EMPTY"
        title={t("cameraTitle")}
        body={t("introBody")}
        tone="cobalt"
        primary={{ label: t("scanAction"), onPress: () => router.replace("/scan") }}
        close={startOver}
      />
    );
  }

  const { result } = state;
  if (result.status === "not_found") {
    return (
      <StateScreen
        eyebrow="PRODUCT / UNKNOWN"
        title={t("notFoundTitle")}
        body={t("notFoundBody")}
        tone="amber"
        code={result.gtin}
        primary={{ label: t("checkCode"), onPress: () => router.replace("/manual") }}
        secondary={{ label: t("materialGuideAction"), onPress: () => router.push("/guide") }}
        close={startOver}
      />
    );
  }

  if (result.status === "provider_unavailable") {
    return (
      <StateScreen
        eyebrow="SOURCE / UNAVAILABLE"
        title={t("providerUnavailableTitle")}
        body={t("providerUnavailableBody")}
        tone="brick"
        code={result.gtin}
        primary={{ label: t("retry"), onPress: () => void lookupBarcode(result.gtin, "manual") }}
        secondary={{ label: t("materialGuideAction"), onPress: () => router.push("/guide") }}
        close={startOver}
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
  const { t } = useLanguage();
  const name = result.product.name?.value ?? result.gtin;
  const brand = result.product.brands?.value.join(", ");

  return (
    <Screen>
      <View style={styles.header}>
        <BrandLockup compact />
        <InlineLink label={t("close")} onPress={onClose} />
      </View>
      <View style={styles.productHero}>
        <Eyebrow>{t("productLabel")}</Eyebrow>
        <AppText variant="title" accessibilityRole="header">
          {name}
        </AppText>
        {brand && <AppText muted>{brand}</AppText>}
        <AppText variant="mono" muted>
          {result.gtin}
        </AppText>
        <View style={styles.sourceRow}>
          <StatusPill label={result.cache.hit ? t("cachedLabel") : t("liveLabel")} tone="cobalt" />
          <AppText variant="small" muted>
            {result.provider.name}
          </AppText>
        </View>
      </View>

      {result.status === "packaging_missing" ? (
        <View style={styles.resultStack}>
          <Paper style={{ borderColor: palette.amber }}>
            <StatusPill label={t("confidenceUnknown")} tone="amber" />
            <AppText variant="heading">{t("packagingMissingTitle")}</AppText>
            <AppText>{t("packagingMissingBody")}</AppText>
          </Paper>
          <Button label={t("manualComponentAction")} onPress={() => router.push("/component")} />
          <Button
            label={t("feedbackMissing")}
            variant="secondary"
            onPress={() => router.push("/feedback?category=missing_data")}
          />
          <AppText variant="small" muted style={styles.centerText}>
            {t("photoConsentNote")}
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
                  {observation.materialFamily?.value.toUpperCase() ?? "UNKNOWN"}
                </AppText>
                <AppText variant="heading">
                  {observation.displayName?.value ??
                    observation.shape?.value ??
                    observation.materialFamily?.value ??
                    t("packagingParts")}
                </AppText>
              </View>
              <SortingResultCard result={sorting} />
            </View>
          ))}
        </View>
      )}

      <View style={styles.resultStack}>
        <Rule />
        <Button label={t("scanAnother")} onPress={onClose} />
        <Button
          label={t("correctionAction")}
          variant="secondary"
          onPress={() => router.push({ pathname: "/feedback", params: { gtin: result.gtin } })}
        />
        <AppText variant="small" muted>
          {t("dataSourceLabel")}: {result.provider.name} · {t("lastRetrievedLabel")}:{" "}
          {formatDate(result.product.packagingCompleteness.provenance.retrievedAt)}
        </AppText>
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
}: StateScreenProps) {
  const { t } = useLanguage();
  return (
    <Screen>
      <View style={styles.header}>
        <BrandLockup compact />
        <InlineLink label={t("close")} onPress={close} />
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
          <Button label={primary.label} onPress={primary.onPress} />
          {secondary && (
            <Button label={secondary.label} variant="secondary" onPress={secondary.onPress} />
          )}
        </View>
      </View>
    </Screen>
  );
}

function formatDate(value: string) {
  return value.slice(0, 10);
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
  productHero: { paddingTop: spacing.xxl, gap: spacing.xs },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  resultStack: { paddingTop: spacing.xl, gap: spacing.md },
  componentBlock: { gap: spacing.sm },
});
