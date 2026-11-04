import { preparePhotoBase64 } from "@kierratysappi/contracts/photo-image";
import type {
  LocalObjectKind,
  LocalVisionObservation,
} from "@kierratysappi/contracts/local-vision";
import type { MessageKey } from "@kierratysappi/localization";
import { CameraView, useCameraPermissions } from "expo-camera";
import Constants from "expo-constants";
import { File, Paths } from "expo-file-system";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { AppState, Image, Linking, StyleSheet, View } from "react-native";
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
import { isLocalVisionAvailable, recognizeLocalPhoto } from "@/features/local-vision/native";
import { isLocalCaptureUri } from "@/features/local-vision/recognizer";
import { canUsePhotoCapture, choosePhotoSize } from "@/features/photo/sorting";
import { useLanguage } from "@/i18n/language-context";
import { radius } from "@/theme/tokens";

const objectLabels: Record<LocalObjectKind, MessageKey> = {
  bottle: "localVisionBottle",
  jar: "localVisionJar",
  box: "localVisionBox",
  bag: "localVisionBag",
  cup: "localVisionCup",
};

function removeCapture(uri: string): void {
  if (!isLocalCaptureUri(uri, Paths.cache.uri)) throw new Error("invalid_capture_path");
  const file = new File(uri);
  if (file.exists) file.delete();
}

export default function LocalPhotoScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<"intro" | "camera" | "preview" | "processing" | "result">(
    "intro",
  );
  const [jpeg, setJpeg] = useState<string>();
  const [observation, setObservation] = useState<LocalVisionObservation>();
  const [error, setError] = useState<MessageKey>();
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [pictureSize, setPictureSize] = useState<string>();
  const camera = useRef<CameraView>(null);
  const generation = useRef(0);
  const locked = useRef(false);
  const permissionPrompt = useRef(false);
  const pending = useRef<AbortController | undefined>(undefined);
  const available = isLocalVisionAvailable();

  const clear = useCallback(() => {
    generation.current++;
    pending.current?.abort();
    pending.current = undefined;
    locked.current = false;
    setJpeg(undefined);
    setObservation(undefined);
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
      return () => {
        subscription.remove();
        clear();
      };
    }, [clear]),
  );

  const open = async () => {
    if (locked.current) return;
    if (!available || !canUsePhotoCapture("ios", Constants)) {
      setError("localVisionUnavailable");
      return;
    }
    locked.current = true;
    setBusy(true);
    setError(undefined);
    const ticket = ++generation.current;
    try {
      permissionPrompt.current = true;
      let granted: boolean;
      try {
        granted = permission?.granted || (await requestPermission()).granted;
      } finally {
        permissionPrompt.current = false;
      }
      if (ticket === generation.current) {
        if (granted) {
          setReady(false);
          setPhase("camera");
        } else setError("cameraDenied");
      }
    } catch {
      if (ticket === generation.current) setError("localVisionError");
    } finally {
      if (ticket === generation.current) {
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
        clean = preparePhotoBase64(picture.base64 ?? "");
      } finally {
        removeCapture(picture.uri);
      }
      if (ticket === generation.current) {
        setJpeg(clean);
        setPhase("preview");
      }
    } catch {
      if (ticket === generation.current) setError("localVisionError");
    } finally {
      if (ticket === generation.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  };

  const recognize = async () => {
    if (locked.current || !jpeg || phase !== "preview") return;
    locked.current = true;
    setBusy(true);
    setError(undefined);
    setPhase("processing");
    const ticket = ++generation.current;
    const controller = new AbortController();
    pending.current = controller;
    const result = await recognizeLocalPhoto(jpeg, controller.signal);
    if (ticket !== generation.current) return;
    setJpeg(undefined);
    pending.current = undefined;
    locked.current = false;
    setBusy(false);
    if (result.status === "observed") {
      setObservation(result.observation);
      setPhase("result");
      announceAccessibility(t("localVisionReady"));
    } else {
      setError(
        result.reason === "busy"
          ? "localVisionBusy"
          : result.reason === "timeout"
            ? "localVisionTimeout"
            : result.reason === "unsupported"
              ? "localVisionUnavailable"
              : "localVisionError",
      );
      setPhase("intro");
    }
  };

  return (
    <Screen testID="local-photo-screen">
      <PageHeader
        onBack={() => {
          clear();
          if (router.canGoBack()) router.back();
          else router.replace("/identify");
        }}
      />
      <PageIntro
        title={t("localVisionTitle")}
        {...(phase === "intro" ? { body: t("localVisionIntro") } : {})}
      />
      <View style={sharedStyles.stack}>
        {error && (
          <AppText accessibilityRole="alert" testID="local-photo-error">
            {t(error)}
          </AppText>
        )}
        {phase === "intro" && (
          <>
            <AppText>{t("localVisionLimit")}</AppText>
            {!available ? (
              <AppText testID="local-photo-unavailable">{t("localVisionUnavailable")}</AppText>
            ) : permission?.canAskAgain === false && !permission.granted ? (
              <>
                <AppText>{t("cameraDenied")}</AppText>
                <Button label={t("openSettings")} onPress={() => void Linking.openSettings()} />
              </>
            ) : (
              <Button
                label={t(busy ? "localVisionOpening" : "localVisionCamera")}
                onPress={() => void open()}
                busy={busy}
                disabled={busy}
                testID="local-photo-open-camera"
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
              accessibilityLabel={t("localVisionCameraLabel")}
              testID="local-photo-camera"
              onMountError={() => {
                clear();
                setError("localVisionError");
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
              label={t("localVisionCapture")}
              onPress={() => void capture()}
              disabled={busy || !ready}
              testID="local-photo-capture"
            />
          </>
        )}
        {phase === "preview" && jpeg && (
          <>
            <AppText variant="heading">{t("localVisionPreview")}</AppText>
            <Image
              source={{ uri: `data:image/jpeg;base64,${jpeg}` }}
              style={styles.camera}
              accessibilityLabel={t("localVisionPreview")}
              resizeMode="contain"
            />
            <Button
              label={t("localVisionRecognize")}
              onPress={() => void recognize()}
              disabled={busy}
              testID="local-photo-recognize"
            />
          </>
        )}
        {phase === "processing" && (
          <AppText accessibilityLiveRegion="polite" testID="local-photo-loading">
            {t("localVisionWorking")}
          </AppText>
        )}
        {phase !== "intro" && phase !== "result" && (
          <Button
            label={t("localVisionCancel")}
            variant="secondary"
            onPress={clear}
            testID="local-photo-cancel"
          />
        )}
        {phase === "result" && observation && (
          <>
            <StatusPill label={t("localVisionEstimate")} tone="amber" />
            <AppText accessibilityRole="header" variant="heading" testID="local-photo-object">
              {t(
                observation.object.status === "estimated"
                  ? objectLabels[observation.object.kind]
                  : "localVisionUnknown",
              )}
            </AppText>
            <AppText>{t("localVisionLimit")}</AppText>
            <Paper>
              <AppText variant="heading" accessibilityRole="header">
                {t("localVisionMarkings")}
              </AppText>
              <AppText>
                {t(
                  observation.markings.status === "ambiguous"
                    ? "localVisionConflicting"
                    : observation.markings.candidates.length
                      ? "localVisionMarkingHint"
                      : "localVisionNoMarkings",
                )}
              </AppText>
              {observation.markings.status === "candidates" &&
                observation.markings.candidates.map((marking) => (
                  <Button
                    key={marking.text}
                    label={marking.text}
                    variant="secondary"
                    onPress={() => {
                      clear();
                      router.push({ pathname: "/material-code", params: { code: marking.text } });
                    }}
                  />
                ))}
            </Paper>
            <AppText variant="small" muted>
              {t("localVisionSource")}
            </AppText>
            <AppText variant="small" muted>
              {t("localVisionSourceDetail")} · Vision {observation.source.classificationRevision} /
              OCR {observation.source.ocrRevision} · {observation.source.osVersion} ·{" "}
              {observation.source.normalizerVersion} · {observation.source.abstentionVersion} ·{" "}
              {observation.source.ocrLanguages.join(", ")} ·{" "}
              {new Date(observation.source.observedAt).toLocaleString(
                language === "fi" ? "fi-FI" : "en-GB",
              )}
            </AppText>
            <Button
              label={t("localVisionAgain")}
              variant="secondary"
              onPress={clear}
              testID="local-photo-reset"
            />
          </>
        )}
        <Button
          label={t("materialCodeAction")}
          variant="secondary"
          onPress={() => {
            clear();
            router.push("/material-code");
          }}
          testID="local-photo-marking-action"
        />
        <Button
          label={t("manualComponentAction")}
          variant="secondary"
          onPress={() => {
            clear();
            router.push("/component");
          }}
        />
        {phase === "intro" && (
          <>
            <AppText variant="small" muted>
              {t("localVisionCloudCost")}
            </AppText>
            <InlineLink
              label={t("localVisionCloud")}
              accessibilityHint={t("localVisionCloudHint")}
              onPress={() => router.push("/photo")}
              testID="local-photo-cloud-action"
            />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  camera: { width: "100%", height: 300, borderRadius: radius.lg },
});
