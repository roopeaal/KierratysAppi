import {
  CollectionDirectorySchema,
  collectionPointMapUrl,
  type NearbyCollectionPoint,
  nearestCollectionPoints,
} from "@kierratysappi/contracts/collection-points";
import type { MessageKey } from "@kierratysappi/localization";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import snapshot from "@/assets/data/finland-recycling.json";
import { useForegroundLocation } from "@/features/nearby/foreground-context";
import { displayDistance, LocationIssue } from "@/features/nearby/location-session";
import { useSortingRegion } from "@/features/region/context";
import { openExternalUrl } from "@/features/security/external-links";
import { useLanguage } from "@/i18n/language-context";
import { useAppTheme } from "@/theme/tokens";
import { CollectionPointThumbnail } from "./collection-point-thumbnail";
import { HomeSectionHeading, HomeText } from "./home-elements";
import { HomePreviewNotice, HomePreviewRow } from "./home-reference-elements";
import { InlineLink } from "./ui";

let directory: ReturnType<typeof CollectionDirectorySchema.safeParse> | undefined;
type NearbyState =
  | { kind: "idle" | "loading" }
  | { kind: "error"; message: MessageKey }
  | {
      kind: "ready";
      points: readonly NearbyCollectionPoint[];
      approx: boolean;
      attributionUrl: string;
    };
export function HomeNearbyPreview() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { palette } = useAppTheme();
  const { enabled, foreground, read, setEnabled } = useForegroundLocation();
  const { fromCoordinates } = useSortingRegion();
  const pending = useRef<AbortController | null>(null);
  const [state, setState] = useState<NearbyState>({ kind: "idle" });
  const [linkError, setLinkError] = useState(false);
  const openLink = (url: string) => {
    setLinkError(false);
    void openExternalUrl(url).catch(() => setLinkError(true));
  };
  const clear = useCallback(() => {
    pending.current?.abort();
    pending.current = null;
    setLinkError(false);
    setState({ kind: "idle" });
  }, []);
  const find = useCallback(
    async (enable: boolean) => {
      if (pending.current) return;
      directory ??= CollectionDirectorySchema.safeParse(snapshot);
      if (!directory.success) {
        setState({ kind: "error", message: "nearbyDataError" });
        return;
      }
      const data = directory.data;
      const controller = new AbortController();
      pending.current = controller;
      setLinkError(false);
      setState({ kind: "loading" });
      try {
        const fix = await read(controller.signal, { prompt: enable });
        if (controller.signal.aborted) return;
        fromCoordinates(fix.coords);
        if (enable) {
          try {
            await setEnabled(true);
          } catch {
            if (!controller.signal.aborted)
              setState({ kind: "error", message: "nearbyPreferenceError" });
            return;
          }
        }
        if (controller.signal.aborted) return;
        const points = nearestCollectionPoints(
          data.points.filter((point) => point.reportedMaterials.length > 0),
          fix.coords,
        ).slice(0, 2);
        setState(
          points.length
            ? {
                kind: "ready",
                points,
                approx: (fix.coords.accuracy ?? Infinity) > 100,
                attributionUrl: data.attributionUrl,
              }
            : { kind: "error", message: "nearbyNoResult" },
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof LocationIssue && error.reason === "permission"
            ? "nearbyPermission"
            : error instanceof LocationIssue && error.reason === "timeout"
              ? "nearbyTimeout"
              : error instanceof LocationIssue && error.reason === "services"
                ? "nearbyServices"
                : "nearbyUnavailable";
        setState({ kind: "error", message });
      } finally {
        if (pending.current === controller) pending.current = null;
      }
    },
    [fromCoordinates, read, setEnabled],
  );
  useFocusEffect(
    useCallback(() => {
      if (enabled && foreground) void find(false);
      return clear;
    }, [clear, enabled, find, foreground]),
  );
  return (
    <View testID="home-nearby-section">
      <HomeSectionHeading
        title={t("homeNearbySection")}
        action={t(state.kind === "ready" ? "homeShowAll" : "homeFindPoints")}
        secondaryAction={
          state.kind === "ready" && (
            <InlineLink
              label={t("nearbySourceShort")}
              variant="small"
              color={palette.textSecondary}
              testID="home-nearby-source"
              onPress={() => openLink(state.attributionUrl)}
            />
          )
        }
        testID="home-map-action"
        onPress={() => router.push("/nearby")}
      />
      <View style={styles.stack}>
        {state.kind === "ready" ? (
          <>
            {state.points.map(({ point, distanceMeters }, index) => (
              <HomePreviewRow
                key={point.id}
                icon="nearby"
                thumbnail={{
                  image: <CollectionPointThumbnail point={point} />,
                  caption: t("nearbyExamplePhoto"),
                }}
                label={point.name ?? point.operator ?? t("nearbyGeneric")}
                detail={`${displayDistance(distanceMeters, language)} ${t("nearbyDistanceShort")}${point.address ? ` · ${point.address}` : ""}`}
                testID={`home-nearby-result-${index}`}
                onPress={() => openLink(collectionPointMapUrl(point))}
              />
            ))}
            {state.approx && (
              <HomeText variant="small" muted>
                {t("nearbyApproximate")}
              </HomeText>
            )}
            {linkError && (
              <HomeText variant="small" accessibilityRole="alert">
                {t("nearbyLinkError")}
              </HomeText>
            )}
          </>
        ) : state.kind === "loading" ? (
          <HomePreviewNotice>
            <HomeText accessibilityLiveRegion="polite">{t("nearbyLoading")}</HomeText>
            <InlineLink label={t("cancel")} role="button" onPress={clear} />
          </HomePreviewNotice>
        ) : (
          <>
            {state.kind === "error" && (
              <HomeText variant="small" accessibilityRole="alert">
                {t(state.message)}
              </HomeText>
            )}
            <HomePreviewRow
              icon="nearby"
              label={t(state.kind === "error" ? "retry" : "nearbyEnableAutomatic")}
              detail={t(enabled ? "homeNearbyPrivacy" : "nearbyAutomaticBrief")}
              testID="home-nearby-preview"
              onPress={() => void find(true)}
            />
          </>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  stack: { gap: 8 },
});
