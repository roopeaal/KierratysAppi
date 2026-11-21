import {
  collectionPointMapUrl,
  collectionPointUrl,
  type NearbyCollectionPoint,
} from "@kierratysappi/contracts/collection-points";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { announceAccessibility } from "@/features/accessibility/announcements";
import { readPointAddress } from "@/features/nearby/device-location";
import { useForegroundLocation } from "@/features/nearby/foreground-context";
import { displayDistance } from "@/features/nearby/location-session";
import { collectionMaterialLabels } from "@/features/nearby/material-label";
import { recyclingIntent } from "@/features/overview/recording";
import { openExternalUrl } from "@/features/security/external-links";
import { pointCategoryIcons } from "@/features/sorting/category-icons";
import { pointWasteMarking } from "@/features/sorting/waste-markings";
import { useLanguage } from "@/i18n/language-context";
import { useAppTheme } from "@/theme/tokens";
import { CollectionPointThumbnail } from "./collection-point-thumbnail";
import { MaterialStudy } from "./material-study";
import { RecyclingRecordAction } from "./recycle-action";
import { AppText, InlineLink, Paper, Rule, sharedStyles } from "./ui";

export function NearbyPointCard({
  result,
  accuracy,
  index,
}: {
  readonly result: NearbyCollectionPoint;
  readonly accuracy: number | null;
  readonly index: number;
}) {
  const { point, distanceMeters } = result;
  const { language, t } = useLanguage();
  const { palette } = useAppTheme();
  const { width, fontScale } = useWindowDimensions();
  const stackedHeading = width < 360 || fontScale > 1.2;
  const showPhoto = !stackedHeading && point.reportedMaterials.length > 0;
  const [recordingScope] = useState(() => ({}));
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const [estimate, setEstimate] = useState<string | null>(null);
  const { foreground } = useForegroundLocation();
  useFocusEffect(
    useCallback(() => {
      if (!foreground || point.address || Platform.OS === "web") return;
      const controller = new AbortController();
      void readPointAddress(point, controller.signal).then((text) => {
        if (!controller.signal.aborted) setEstimate(text);
      });
      return () => controller.abort();
    }, [foreground, point]),
  );
  const openUrl = (url: string) => {
    setLinkError(false);
    void openExternalUrl(url).catch(() => {
      setLinkError(true);
      announceAccessibility(t("nearbyLinkError"), "high");
    });
  };
  return (
    <Paper style={styles.card} testID={`nearby-point-${index}`}>
      <View style={[styles.heading, stackedHeading && styles.headingStack]}>
        {showPhoto && <CollectionPointThumbnail point={point} compact />}
        <View style={[styles.identity, stackedHeading && styles.identityStack]}>
          <AppText variant="heading" accessibilityRole="header" style={styles.name}>
            {point.name ?? point.operator ?? t("nearbyGeneric")}
          </AppText>
          <AppText variant="small" muted accessibilityLiveRegion={index === 0 ? "polite" : "none"}>
            {point.address ??
              (estimate ? `${t("nearbyAddressLabel")}: ${estimate}` : t("nearbyLocationOnMap"))}
          </AppText>
          {showPhoto && (
            <AppText variant="small" muted style={styles.photoLabel}>
              {t("nearbyExamplePhoto")}
            </AppText>
          )}
        </View>
        <View style={[styles.distance, stackedHeading && styles.distanceLine]}>
          <AppText variant="mono" style={styles.distanceValue}>
            {displayDistance(distanceMeters, language)}
          </AppText>
          <AppText variant="small" muted>
            {t("nearbyDistanceShort")}
          </AppText>
        </View>
      </View>
      <View style={styles.materials} testID={`nearby-materials-${index}`}>
        {point.reportedMaterials.length ? (
          point.reportedMaterials.slice(0, detailsOpen ? 30 : 4).map((material) => {
            const marking = pointWasteMarking(material);
            return (
              <View
                key={material}
                style={[
                  styles.material,
                  {
                    backgroundColor: marking?.tint ?? palette.pineSoft,
                  },
                ]}
              >
                {marking && (
                  <View
                    accessible={false}
                    aria-hidden
                    style={[
                      styles.marking,
                      { backgroundColor: marking.color, borderColor: palette.borderStrong },
                    ]}
                    testID={`nearby-marking-${marking.id}`}
                  />
                )}
                <MaterialStudy material={pointCategoryIcons[material]} size={18} />
                <AppText variant="small" style={styles.materialText}>
                  {t(collectionMaterialLabels[material])}
                </AppText>
              </View>
            );
          })
        ) : (
          <AppText variant="small" muted>
            {t("nearbyMaterialsUnknown")}
          </AppText>
        )}
        {!detailsOpen && point.reportedMaterials.length > 4 && (
          <InlineLink
            role="button"
            label={t("nearbyMoreMaterials").replace(
              "{count}",
              String(point.reportedMaterials.length - 4),
            )}
            onPress={() => setDetailsOpen(true)}
          />
        )}
      </View>
      <View style={styles.actions}>
        <InlineLink
          label={t("nearbyShowMap")}
          role="button"
          onPress={() => openUrl(collectionPointMapUrl(point))}
          accessibilityHint={t("nearbyMapHint")}
          testID={`nearby-map-${index}`}
        />
        <InlineLink
          label={t(detailsOpen ? "nearbyLess" : "nearbyMore")}
          role="button"
          expanded={detailsOpen}
          onPress={() => setDetailsOpen((open) => !open)}
          testID={`nearby-details-toggle-${index}`}
        />
      </View>
      {detailsOpen && (
        <View style={sharedStyles.tightStack} testID={`nearby-details-${index}`}>
          <Rule />
          {stackedHeading && point.reportedMaterials.length > 0 && (
            <View style={styles.illustration}>
              <CollectionPointThumbnail point={point} />
              <AppText variant="small" muted style={styles.caption}>
                {t("nearbyExamplePhoto")}
              </AppText>
            </View>
          )}
          {point.reportedExclusions.length > 0 && (
            <AppText variant="small">
              {t("nearbyExclusions")}:{" "}
              {point.reportedExclusions.map((m) => t(collectionMaterialLabels[m])).join(" · ")}
            </AppText>
          )}
          {!point.name && (
            <AppText variant="small" muted>
              {t("nearbyNameUnknown")}
            </AppText>
          )}
          <AppText variant="small" muted>
            {t("nearbyPointType")}:{" "}
            {t(
              point.kind === "centre"
                ? "nearbyCentre"
                : point.kind === "container"
                  ? "nearbyContainer"
                  : "nearbyTypeUnknown",
            )}
          </AppText>
          {point.operator && (
            <AppText variant="small" muted>
              {t("nearbyOperator")}: {point.operator}
            </AppText>
          )}
          {estimate && (
            <AppText variant="small" muted>
              {t("nearbyAddressSource")}
            </AppText>
          )}
          <AppText variant="small" muted>
            {t("nearbyPointId")}: {point.id}
          </AppText>
          {accuracy !== null && (
            <AppText variant="small" muted>
              {t("nearbyAccuracy")}: ±{Math.max(1, Math.ceil(accuracy / 10) * 10)} m
            </AppText>
          )}
          <AppText variant="small" muted>
            {t("nearbyCaution")}
          </AppText>
          <AppText variant="small" muted>
            {t("nearbyShortMapHint")}
          </AppText>
          <InlineLink
            label={t("nearbyDetails")}
            accessibilityHint={t("nearbyExternalHint")}
            onPress={() => openUrl(collectionPointUrl(point))}
          />
          <RecyclingRecordAction
            recordId={recyclingIntent(recordingScope, point.id)}
            label={t("nearbyGeneric")}
          />
        </View>
      )}
      {linkError && <AppText accessibilityRole="alert">{t("nearbyLinkError")}</AppText>}
    </Paper>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 8, boxShadow: "none" },
  heading: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headingStack: { flexDirection: "column", gap: 4 },
  identity: { flex: 1, minWidth: 0, gap: 4 },
  identityStack: { flexGrow: 0, flexShrink: 0, flexBasis: "auto", alignSelf: "stretch" },
  name: { fontSize: 19, lineHeight: 25 },
  distance: { alignItems: "flex-end", maxWidth: 110, gap: 2 },
  distanceLine: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: 8,
  },
  distanceValue: { fontSize: 18, lineHeight: 26 },
  materials: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  material: {
    borderRadius: 8,
    maxWidth: "100%",
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  materialText: { flexShrink: 1 },
  marking: {
    width: 9,
    height: 9,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  illustration: { flexDirection: "row", alignItems: "center", gap: 10 },
  caption: { flex: 1, minWidth: 0 },
  photoLabel: { fontSize: 11, lineHeight: 15 },
});
