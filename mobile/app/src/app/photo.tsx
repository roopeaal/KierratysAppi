import { preparePhotoBase64 } from "@kierratysappi/contracts/photo-image";
import {
  canConfirmPhotoPart,
  type PhotoEstimate,
  type PhotoPart,
} from "@kierratysappi/contracts/photo-recognition";
import { localizedText, type MessageKey } from "@kierratysappi/localization";
import type { SortingResult } from "@kierratysappi/recycling-engine";
import { CameraView, useCameraPermissions } from "expo-camera";
import Constants from "expo-constants";
import { File, Paths } from "expo-file-system";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { AppState, Image, Linking, Platform, StyleSheet, View } from "react-native";
import { SortingResultCard } from "@/components/sorting-result";
import {
  AppText,
  Button,
  InlineLink,
  PageHeader,
  PageIntro,
  Paper,
  Screen,
  StatusPill,
  sharedStyles,
} from "@/components/ui";
import { announceAccessibility } from "@/features/accessibility/announcements";
import { photoAvailable, requestPhoto } from "@/features/photo/api";
import {
  canUsePhotoCapture,
  choosePhotoSize,
  sortConfirmedPhotoPart,
} from "@/features/photo/sorting";
import { useLanguage } from "@/i18n/language-context";

function removeCapture(uri: string): void {
  if (Platform.OS === "web") return;
  if (!uri.startsWith(Paths.cache.uri) || !/\.jpe?g$/iu.test(uri))
    throw new Error("invalid_capture_path");
  const file = new File(uri);
  if (file.exists) file.delete();
}

export default function PhotoScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<"intro" | "camera" | "preview" | "sending" | "result">(
    "intro",
  );
  const [jpeg, setJpeg] = useState<string>();
  const [estimate, setEstimate] = useState<PhotoEstimate>();
  const [error, setError] = useState<MessageKey>();
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [pictureSize, setPictureSize] = useState<string>();
  const camera = useRef<CameraView>(null);
  const generation = useRef(0);
  const locked = useRef(false);
  const pending = useRef<AbortController | undefined>(undefined);
  const permissionPrompt = useRef(false);

  const clear = useCallback(() => {
    generation.current++;
    pending.current?.abort();
    pending.current = undefined;
    locked.current = false;
    setJpeg(undefined);
    setEstimate(undefined);
    setError(undefined);
    setBusy(false);
    setReady(false);
    setPhase("intro");
  }, []);
  useFocusEffect(
    useCallback(() => {
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "background" || (state !== "active" && !permissionPrompt.current)) clear();
      });
      const hide = () => {
        if (document.visibilityState !== "visible") clear();
      };
      if (Platform.OS === "web") document.addEventListener("visibilitychange", hide);
      return () => {
        subscription.remove();
        if (Platform.OS === "web") document.removeEventListener("visibilitychange", hide);
        clear();
      };
    }, [clear]),
  );

  const open = async () => {
    if (locked.current) return;
    if (
      !canUsePhotoCapture(Platform.OS, Constants.nativeBuildVersion, Constants.executionEnvironment)
    ) {
      setError("photoUpdateRequired");
      return;
    }
    locked.current = true;
    setBusy(true);
    setError(undefined);
    const ticket = ++generation.current;
    const controller = new AbortController();
    pending.current = controller;
    const timer = setTimeout(() => controller.abort(), 5_000);
    try {
      if (!(await photoAvailable(controller.signal))) {
        if (ticket === generation.current) setError("photoUnavailable");
        return;
      }
      if (ticket !== generation.current) return;
      permissionPrompt.current = true;
      let granted: boolean;
      try {
        granted = permission?.granted || (await requestPermission()).granted;
      } finally {
        permissionPrompt.current = false;
      }
      // An actual background transition invalidates the request; a permission sheet alone does not.
      if (ticket === generation.current && granted) {
        setReady(false);
        setPhase("camera");
      } else if (ticket === generation.current) setError("cameraDenied");
    } catch {
      if (ticket === generation.current) setError("photoNetwork");
    } finally {
      clearTimeout(timer);
      if (ticket === generation.current) {
        pending.current = undefined;
        locked.current = false;
        setBusy(false);
      }
    }
  };

  const capture = async () => {
    if (locked.current || !ready || !camera.current) return;
    locked.current = true;
    setBusy(true);
    setError(undefined);
    const ticket = ++generation.current;
    try {
      const picture = await camera.current.takePictureAsync({
        base64: true,
        exif: false,
        quality: 0.4,
        imageType: "jpg",
        skipProcessing: false,
      });
      let clean: string;
      try {
        clean = preparePhotoBase64(
          (picture.base64 ?? picture.uri).replace(/^data:image\/jpeg;base64,/u, ""),
        );
      } finally {
        removeCapture(picture.uri);
      }
      if (ticket === generation.current) {
        setJpeg(clean);
        setPhase("preview");
      }
    } catch {
      if (ticket === generation.current) setError("photoInvalid");
    } finally {
      if (ticket === generation.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  };

  const send = async () => {
    if (locked.current || !jpeg || phase !== "preview") return;
    locked.current = true;
    setBusy(true);
    setPhase("sending");
    setError(undefined);
    const ticket = ++generation.current;
    const controller = new AbortController();
    pending.current = controller;
    const timer = setTimeout(() => controller.abort(), 20_000);
    try {
      const result = await requestPhoto(jpeg, language, controller.signal);
      if (ticket !== generation.current) return;
      if (result.status === "estimated") {
        setEstimate(result);
        setPhase("result");
        announceAccessibility(t("photoReady"));
      } else {
        setError(
          result.reason === "disabled"
            ? "photoUnavailable"
            : result.reason === "rate_limited"
              ? "photoRateLimited"
              : result.reason === "quota_exhausted"
                ? "photoQuota"
                : result.reason === "invalid_image"
                  ? "photoInvalid"
                  : "photoNetwork",
        );
        setPhase("intro");
      }
    } catch {
      if (ticket === generation.current) {
        setError("photoNetwork");
        setPhase("intro");
      }
    } finally {
      clearTimeout(timer);
      if (ticket === generation.current) {
        setJpeg(undefined);
        pending.current = undefined;
        locked.current = false;
        setBusy(false);
      }
    }
  };

  return (
    <Screen testID="photo-screen">
      <PageHeader
        onBack={() => {
          clear();
          router.back();
        }}
      />
      <PageIntro
        title={t("photoTitle")}
        {...(phase === "intro" ? { body: t("photoIntro") } : {})}
      />
      <View style={sharedStyles.stack}>
        {error && (
          <AppText accessibilityRole="alert" testID="photo-error">
            {t(error)}
          </AppText>
        )}
        {phase === "intro" && (
          <>
            <AppText>{t("photoPrivacy")}</AppText>
            <InlineLink
              label={t("photoPrivacyLink")}
              onPress={() =>
                void Linking.openURL("https://developers.openai.com/api/docs/guides/your-data")
              }
            />
            {permission?.canAskAgain === false && !permission.granted ? (
              <>
                <AppText>{t("cameraDenied")}</AppText>
                <Button label={t("openSettings")} onPress={() => void Linking.openSettings()} />
              </>
            ) : (
              <Button
                label={t("photoOpenCamera")}
                onPress={() => void open()}
                disabled={busy}
                testID="photo-open-camera"
              />
            )}
          </>
        )}
        {phase === "camera" && (
          <>
            <CameraView
              ref={camera}
              style={styles.camera}
              facing="back"
              {...(pictureSize ? { pictureSize } : {})}
              accessibilityLabel={t("photoCameraLabel")}
              testID="photo-camera"
              onMountError={() => {
                clear();
                setError("photoInvalid");
              }}
              onCameraReady={() => {
                setReady(true);
                void camera.current
                  ?.getAvailablePictureSizesAsync()
                  .then((sizes) => setPictureSize(choosePhotoSize(sizes)))
                  .catch(() => undefined);
              }}
            />
            <Button
              label={t("photoCapture")}
              onPress={() => void capture()}
              disabled={busy || !ready}
              testID="photo-capture"
            />
          </>
        )}
        {phase === "preview" && jpeg && (
          <>
            <AppText variant="heading">{t("photoReview")}</AppText>
            <Image
              source={{ uri: `data:image/jpeg;base64,${jpeg}` }}
              style={styles.camera}
              accessibilityLabel={t("photoReview")}
              resizeMode="contain"
            />
            <AppText>{t("photoPrivacy")}</AppText>
            <Button
              label={t("photoSend")}
              onPress={() => void send()}
              disabled={busy}
              testID="photo-send"
            />
            <Button
              label={t("photoRetake")}
              variant="secondary"
              onPress={() => {
                clear();
                void open();
              }}
            />
          </>
        )}
        {phase === "sending" && (
          <AppText accessibilityLiveRegion="polite" testID="photo-loading">
            {t("photoSending")}
          </AppText>
        )}
        {phase !== "intro" && phase !== "result" && (
          <Button
            label={t("photoCancel")}
            variant="secondary"
            onPress={clear}
            testID="photo-cancel"
          />
        )}
        {phase === "result" && estimate && (
          <>
            <StatusPill label={t("photoEstimate")} tone="amber" />
            <AppText variant="title" accessibilityRole="header" testID="photo-product">
              {localizedText(language, estimate.observation.label)}
            </AppText>
            <AppText>{t("photoEstimateBody")}</AppText>
            <AppText variant="small" muted>
              {t(
                estimate.observation.confidence === "low"
                  ? "photoConfidenceLow"
                  : "photoConfidenceMedium",
              )}
            </AppText>
            <AppText variant="small" muted>
              {t("photoSource")} · {estimate.source.model} · {estimate.source.version} ·{" "}
              {estimate.source.observedAt}
            </AppText>
            {(estimate.observation.status !== "clear" ||
              estimate.observation.confidence === "low" ||
              estimate.observation.parts.length === 0) && (
              <AppText testID="photo-uncertain">{t("photoUncertain")}</AppText>
            )}
            {estimate.observation.risk !== "ordinary_packaging" && (
              <AppText testID="photo-special">{t("photoSpecial")}</AppText>
            )}
            {estimate.observation.parts.map((part, index) => (
              <PhotoPartResult
                // biome-ignore lint/suspicious/noArrayIndexKey: Parts are immutable within this timestamp-keyed estimate; new estimates remount the list.
                key={`${estimate.source.observedAt}-${index}`}
                estimate={estimate}
                part={part}
                index={index}
              />
            ))}
            <Button
              label={t("photoRetake")}
              variant="secondary"
              onPress={clear}
              testID="photo-reset"
            />
          </>
        )}
        <Button
          label={t("scanAction")}
          variant="secondary"
          onPress={() => {
            clear();
            router.replace("/scan");
          }}
        />
        <Button
          label={t("manualComponentAction")}
          variant="secondary"
          onPress={() => {
            clear();
            router.replace("/component");
          }}
        />
      </View>
    </Screen>
  );
}

function PhotoPartResult({
  estimate,
  part,
  index,
}: {
  estimate: PhotoEstimate;
  part: PhotoPart;
  index: number;
}) {
  const { language, t } = useLanguage();
  const [sorting, setSorting] = useState<SortingResult>();
  const materials = {
    plastic: "materialPlastic",
    carton: "materialCarton",
    glass: "materialGlass",
    metal: "materialMetal",
    paper: "materialPaper",
    wood: "materialWood",
    composite: "materialComposite",
    other: "materialOther",
    unknown: "materialUnknown",
  } as const;
  const shapes = { bottle: "shapeBottle", can: "shapeCan", jar: "shapeJar" } as const;
  const shapeKey =
    part.shape === "bottle" || part.shape === "can" || part.shape === "jar"
      ? shapes[part.shape]
      : "shapeOther";
  return (
    <Paper testID={`photo-part-${index}`}>
      <AppText variant="small" muted>
        {t("photoPart")}
      </AppText>
      <AppText variant="heading">{localizedText(language, part.label)}</AppText>
      <AppText>
        {t(materials[part.material])} · {t(shapeKey)}
      </AppText>
      {canConfirmPhotoPart(estimate, part) ? (
        <>
          <AppText>{t("photoConfirmBody")}</AppText>
          <Button
            label={t("photoConfirm")}
            testID={`photo-confirm-${index}`}
            onPress={() => {
              const result = sortConfirmedPhotoPart(
                estimate,
                part,
                true,
                language,
                new Date().toISOString(),
              );
              setSorting(result);
              if (result) announceAccessibility(t("sortingResultReady"));
            }}
          />
        </>
      ) : (
        <AppText>{t("photoUncertain")}</AppText>
      )}
      {sorting && <SortingResultCard result={sorting} />}
    </Paper>
  );
}

const styles = StyleSheet.create({
  camera: { width: "100%", height: 300, backgroundColor: "#111111", borderRadius: 12 },
});
