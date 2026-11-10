import type {
  DepositReturnStatus,
  FieldProvenance,
  MaterialFamily,
  PackagingShape,
} from "@kierratysappi/domain";
import { localizedText } from "@kierratysappi/localization";
import { type SortingResult, sortPackagingComponent } from "@kierratysappi/recycling-engine";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SortingResultCard } from "@/components/sorting-result";
import { RecycleAction } from "@/components/recycle-action";
import {
  AppText,
  Button,
  ChoiceIndicator,
  PageHeader,
  PageIntro,
  Screen,
  sharedStyles,
} from "@/components/ui";
import { announceAccessibility } from "@/features/accessibility/announcements";
import { recyclingIntent } from "@/features/overview/recording";
import { useLanguage } from "@/i18n/language-context";
import { radius, spacing, useAppTheme } from "@/theme/tokens";

const MATERIALS = [
  ["plastic", "materialPlasticChoice"],
  ["carton", "materialCartonChoice"],
  ["glass", "materialGlassChoice"],
  ["metal", "materialMetalChoice"],
] as const;
const SHAPES = [
  ["bottle", "shapeBottle"],
  ["can", "shapeCan"],
  ["jar", "shapeJar"],
  ["unknown", "shapeOther"],
] as const;
const DEPOSITS = [
  ["yes", "answerYes"],
  ["no", "answerNo"],
  ["unknown", "answerUnknown"],
] as const;

export default function ManualComponentScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [material, setMaterial] = useState<MaterialFamily>();
  const [shape, setShape] = useState<PackagingShape>("unknown");
  const [deposit, setDeposit] = useState<DepositReturnStatus>("unknown");
  const [result, setResult] = useState<SortingResult>();
  const [recordingScope] = useState(() => ({}));

  const evaluate = () => {
    if (!material) return;
    const now = new Date().toISOString();
    const provenance: FieldProvenance = {
      sourceId: "local-user-observation",
      sourceName: t("localObservation"),
      sourceRecordId: `local-${Date.now()}`,
      sourceUrl: "https://kierratysappi.local/user-observation",
      retrievedAt: now,
      lastConfirmedAt: now,
      confidence: 0.9,
      verificationStatus: "user_confirmed",
      license: {
        id: "private-local-observation",
        name: "Private local observation",
        attributionText: t("localObservation"),
        shareAlike: false,
      },
    };
    const observed = <T,>(value: T) => ({ value, provenance });
    const nextResult = sortPackagingComponent({
      component: {
        id: "local-component",
        packagingStatus: observed("packaging"),
        materialFamily: observed(material),
        shape: observed(shape),
        depositReturnStatus: observed(
          shape === "bottle" || shape === "can" ? deposit : "not_applicable",
        ),
        conditions: { hazardousResidue: "unknown", pressurized: "unknown", emptied: "unknown" },
      },
      context: { country: "FI", language, evaluatedAt: now },
    });
    setResult(nextResult);
    announceAccessibility(
      nextResult.status === "resolved"
        ? localizedText(language, nextResult.destination.label)
        : nextResult.status === "ambiguous"
          ? localizedText(language, nextResult.question)
          : localizedText(language, nextResult.nextAction),
      nextResult.status === "resolved" ? "default" : "high",
    );
  };

  return (
    <Screen>
      <PageHeader onBack={() => router.back()} />
      <PageIntro title={t("selectMaterialTitle")} body={t("selectMaterialBody")} />
      <View style={styles.form}>
        <ChoiceGroup
          label={t("materialFieldLabel")}
          value={material}
          choices={MATERIALS.map(([value, label]) => ({ value, label: t(label) }))}
          onChange={(value) => {
            setMaterial(value as MaterialFamily);
            setResult(undefined);
          }}
        />
        <ChoiceGroup
          label={t("shapeLabel")}
          value={shape}
          choices={SHAPES.map(([value, label]) => ({ value, label: t(label) }))}
          onChange={(value) => {
            setShape(value as PackagingShape);
            setResult(undefined);
          }}
        />
        {(shape === "bottle" || shape === "can") && (
          <ChoiceGroup
            label={t("depositLabel")}
            value={deposit}
            choices={DEPOSITS.map(([value, label]) => ({ value, label: t(label) }))}
            onChange={(value) => {
              setDeposit(value as DepositReturnStatus);
              setResult(undefined);
            }}
          />
        )}
        <Button label={t("showGuidance")} onPress={evaluate} disabled={!material} />
        {result && (
          <View style={styles.result} accessibilityLiveRegion="polite">
            <SortingResultCard result={result} />
            <RecycleAction
              sorting={result}
              material={material}
              recordId={recyclingIntent(recordingScope, "manual")}
            />
          </View>
        )}
        {result && (
          <AppText variant="small" muted>
            {t("localObservation")}
          </AppText>
        )}
      </View>
    </Screen>
  );
}

function ChoiceGroup({
  label,
  value,
  choices,
  onChange,
}: {
  readonly label: string;
  readonly value: string | undefined;
  readonly choices: readonly { readonly value: string; readonly label: string }[];
  readonly onChange: (value: string) => void;
}) {
  const { palette } = useAppTheme();
  return (
    <View style={sharedStyles.tightStack} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <AppText variant="label">{label}</AppText>
      <View style={styles.choices}>
        {choices.map((choice) => {
          const selected = value === choice.value;
          return (
            <Pressable
              key={choice.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              aria-checked={selected}
              onPress={() => onChange(choice.value)}
              style={({ pressed }) => [
                styles.choice,
                choices.length === 3 ? styles.compactChoice : styles.gridChoice,
                {
                  backgroundColor: selected ? palette.pineSoft : palette.surface,
                  borderColor: selected ? palette.pine : palette.line,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <ChoiceIndicator selected={selected} />
              <AppText
                variant="label"
                style={{ color: selected ? palette.pine : palette.ink, flex: 1, minWidth: 0 }}
              >
                {choice.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  gridChoice: { flexBasis: "46%", flexGrow: 1 },
  compactChoice: { flexBasis: "25%", flexGrow: 1 },
  choice: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    justifyContent: "flex-start",
  },
  result: { paddingTop: spacing.lg },
});
