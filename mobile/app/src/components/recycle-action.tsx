import type { SortingResult } from "@kierratysappi/recycling-engine";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { type GestureResponderEvent, Platform, View } from "react-native";
import { announceAccessibility } from "@/features/accessibility/announcements";
import { isPointerActivation } from "@/features/accessibility/motion";
import { useInteractionMotion } from "@/features/accessibility/motion-context";
import {
  type OverviewMaterial,
  overviewMaterials,
  type RecyclingEntry,
} from "@/features/overview/model";
import { recordableMaterial } from "@/features/overview/recording";
import { readRecyclingSummary, recordRecycling } from "@/features/overview/storage";
import { useLanguage } from "@/i18n/language-context";
import { useAppTheme } from "@/theme/tokens";
import { ChoiceChip } from "./choice-chip";
import { RecyclingStamp } from "./recycling-stamp";
import { AppText, Button, GuidanceHeading, InlineLink, Paper, sharedStyles } from "./ui";

const materialKeys = {
  plastic: "overviewMaterialPlastic",
  carton: "overviewMaterialCarton",
  glass: "overviewMaterialGlass",
  metal: "overviewMaterialMetal",
  paper: "overviewMaterialPaper",
  wood: "overviewMaterialWood",
  composite: "overviewMaterialComposite",
  other: "overviewMaterialOther",
} as const;

export function RecycleAction({
  sorting,
  material,
  recordId,
  label,
}: {
  readonly sorting: SortingResult;
  readonly material: unknown;
  readonly recordId: string;
  readonly label?: string;
}) {
  const knownMaterial = recordableMaterial(sorting, material);
  return (
    <RecordAction
      key={`${recordId}:${knownMaterial}`}
      material={knownMaterial}
      recordId={recordId}
      label={label}
    />
  );
}

/** Explicit self-report only. Unknown materials require a choice, never a model guess. */
export function RecyclingRecordAction({
  material,
  recordId,
  label,
}: {
  readonly material?: OverviewMaterial;
  readonly recordId: string;
  readonly label?: string;
}) {
  return <RecordAction key={recordId} material={material} recordId={recordId} label={label} />;
}

function RecordAction({
  material,
  recordId,
  label,
}: {
  readonly material: OverviewMaterial | undefined;
  readonly recordId: string;
  readonly label: string | undefined;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const { palette } = useAppTheme();
  const motionAllowed = useInteractionMotion();
  const [state, setState] = useState<"loading" | "ready" | "saved" | "error">("loading");
  const [savedMaterial, setSavedMaterial] = useState<OverviewMaterial>();
  const [selectedMaterial, setSelectedMaterial] = useState<OverviewMaterial>();
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [animateStamp, setAnimateStamp] = useState(false);
  const loadVersion = useRef(0);
  const locked = useRef(false);
  const active = useRef(false);
  const pending = useRef<RecyclingEntry | undefined>(undefined);
  const chosenMaterial = pending.current?.material ?? material ?? selectedMaterial;

  const refresh = useCallback(() => {
    const request = ++loadVersion.current;
    setAnimateStamp(false);
    setState("loading");
    setConfirming(false);
    void readRecyclingSummary()
      .then((summary) => {
        if (active.current && request === loadVersion.current) {
          const entry = summary.recent.find((item) => item.id === recordId);
          setSavedMaterial(entry?.material);
          setState(entry ? "saved" : "ready");
        }
      })
      .catch(() => {
        if (active.current && request === loadVersion.current) setState("error");
      });
  }, [recordId]);

  useFocusEffect(
    useCallback(() => {
      active.current = true;
      setSaving(locked.current);
      refresh();
      return () => {
        loadVersion.current++;
        active.current = false;
      };
    }, [refresh]),
  );

  const save = async (event: GestureResponderEvent) => {
    if (locked.current || !confirming || state !== "ready" || !chosenMaterial) return;
    const pointerActivated =
      motionAllowed && isPointerActivation(event.nativeEvent, Platform.OS === "web");
    const saveView = loadVersion.current;
    locked.current = true;
    setSaving(true);
    const savedLabel = label
      ?.replace(/\p{Cc}/gu, "")
      .replace(/\s+/gu, " ")
      .trim()
      .slice(0, 80);
    pending.current ??= {
      id: recordId,
      material: chosenMaterial,
      quantity: 1,
      recycledAt: new Date().toISOString(),
      ...(savedLabel ? { label: savedLabel } : {}),
    };
    try {
      const intended = pending.current;
      const summary = await recordRecycling(intended);
      if (active.current) {
        const saved = summary.recent.find((entry) => entry.id === recordId);
        setSavedMaterial(saved?.material);
        setAnimateStamp(
          pointerActivated &&
            saveView === loadVersion.current &&
            saved?.recycledAt === intended.recycledAt,
        );
        setState("saved");
        setConfirming(false);

        announceAccessibility(t("recyclingSaved"));
      }
    } catch {
      if (active.current) {
        setState("error");
        setConfirming(false);

        announceAccessibility(t("recyclingSaveError"), "high");
      }
    } finally {
      locked.current = false;
      if (active.current) setSaving(false);
    }
  };

  return (
    <View style={sharedStyles.tightStack} testID={`recycle-action-${recordId}`}>
      {state === "saved" ? (
        <GuidanceHeading>
          <View style={sharedStyles.row} accessibilityLiveRegion="polite" testID="recycle-saved">
            <RecyclingStamp material={savedMaterial} play={animateStamp} />
            <View style={[sharedStyles.grow, sharedStyles.tightStack]}>
              <AppText variant="heading" style={{ color: palette.pine }}>
                {t("recyclingAlreadySaved")}
                {savedMaterial ? ` · ${t(materialKeys[savedMaterial])}` : ""}
              </AppText>
              {material && savedMaterial && savedMaterial !== material && (
                <AppText variant="small" muted>
                  {t("recyclingCorrectionNote")}
                </AppText>
              )}
            </View>
          </View>
        </GuidanceHeading>
      ) : state === "error" ? (
        <>
          <AppText accessibilityRole="alert" style={{ color: palette.brick }}>
            {t("recyclingSaveError")}
          </AppText>
          <Button label={t("retry")} variant="secondary" onPress={refresh} />
        </>
      ) : confirming ? (
        <Paper testID="recycle-confirm-panel">
          <AppText variant="heading" accessibilityRole="header">
            {t("recyclingConfirmTitle")}
          </AppText>
          <AppText>{t("recyclingConfirmBody")}</AppText>
          {material === undefined && !pending.current && (
            <>
              <AppText variant="small" muted>
                {t("recyclingChooseMaterialHint")}
              </AppText>
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel={t("overviewMaterialLabel")}
                style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
              >
                {overviewMaterials.map((value) => (
                  <ChoiceChip
                    key={value}
                    category={value}
                    label={t(materialKeys[value])}
                    selected={selectedMaterial === value}
                    onPress={() => setSelectedMaterial(value)}
                    testID={`recycle-material-${value}`}
                  />
                ))}
              </View>
            </>
          )}
          {chosenMaterial && (
            <AppText variant="label">
              {t(materialKeys[chosenMaterial])} · 1 {t("overviewPartSingular")}
            </AppText>
          )}
          <Button
            label={t("recyclingConfirmAction")}
            disabled={saving || !chosenMaterial}
            busy={saving}
            onPress={(event) => void save(event)}
            testID="recycle-confirm-action"
          />
          <Button
            label={t("cancel")}
            variant="secondary"
            disabled={saving}
            onPress={() => setConfirming(false)}
            testID="recycle-confirm-cancel"
          />
        </Paper>
      ) : (
        <Button
          label={t("recyclingMarkAction")}
          disabled={state === "loading"}
          onPress={() => setConfirming(true)}
          testID="recycle-mark-action"
        />
      )}
      <InlineLink
        label={t("overviewOpenAction")}
        onPress={() => router.push("/overview")}
        role="button"
        testID="recycle-overview-action"
      />
    </View>
  );
}
