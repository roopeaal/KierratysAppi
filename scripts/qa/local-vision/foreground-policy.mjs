// QA decisions only. Foreground subjects are not verified physical objects.
import { measure } from "./robustness-evaluate.mjs";

export function canRecover(primary, center, baseline) {
  return (
    primary.valid &&
    primary.operationalSuccess &&
    primary.primary.status === "unknown" &&
    primary.primary.reason === "no_operating_point_match" &&
    center.valid &&
    center.operationalSuccess &&
    baseline.status === "unknown" &&
    ["weak_similarity", "ambiguous_similarity"].includes(baseline.reason)
  );
}
export function requiredForeground(variant, primary, center, baseline, baselineState) {
  return (
    baselineState.success &&
    (baseline.status === "estimated" || (variant === "F2" && canRecover(primary, center, baseline)))
  );
}
export function foregroundDecision(variant, primary, center, baseline, observation, decide) {
  if (!["F1", "F2"].includes(variant)) throw new Error("unknown_foreground_variant");
  const eligible =
    baseline.status === "estimated" || (variant === "F2" && canRecover(primary, center, baseline));
  if (!eligible) return baseline;
  if (!observation.valid || !observation.operationalSuccess)
    return { status: "unknown", reason: "foreground_unavailable" };
  const decisions = observation.instances.map((instance) => decide(instance.scores, "loose"));
  const kinds = new Set(
    decisions.filter((value) => value.status === "estimated").map((value) => value.kind),
  );
  if (baseline.status === "estimated")
    return kinds.size > 1 && kinds.has(baseline.kind)
      ? { status: "unknown", reason: "foreground_disagreement" }
      : baseline;
  if (
    decisions.length > 0 &&
    decisions.every((value) => value.status === "estimated") &&
    kinds.size === 1
  )
    return { status: "estimated", kind: [...kinds][0], method: "foreground_subject_consensus" };
  return baseline;
}
export function foregroundState(required, baselineState, observation) {
  return required
    ? { valid: observation.valid, success: observation.valid && observation.operationalSuccess }
    : baselineState;
}
function metrics(rows, variant) {
  return {
    ...measure(rows, variant),
    introducedInvalidOutputs: rows.filter(
      (row) => row.operational.baseline.valid && !row.operational[variant].valid,
    ).length,
  };
}
export function selectForeground(rows) {
  const baseline = metrics(rows, "baseline");
  const results = ["F1", "F2"].map((variant) => {
    const m = metrics(rows, variant);
    return {
      variant,
      ...m,
      eligible:
        m.removedBaselineWrong >= 1 &&
        m.newlyWrong === 0 &&
        m.lostBaselineCorrect === 0 &&
        m.introducedOperationalFailures === 0 &&
        m.introducedInvalidOutputs === 0,
    };
  });
  const eligible = results
    .filter((r) => r.eligible)
    .sort(
      (a, b) =>
        b.removedBaselineWrong - a.removedBaselineWrong ||
        b.correctAccepted - a.correctAccepted ||
        a.variant.localeCompare(b.variant),
    );
  return { baseline, results, selectedVariant: eligible[0]?.variant ?? null };
}
export function confirmForeground(rows, variant) {
  const baseline = metrics(rows, "baseline"),
    candidate = metrics(rows, variant);
  return {
    baseline,
    candidate,
    selectedVariant: variant,
    integrationEligible:
      candidate.wrongAccepted === 0 &&
      candidate.newlyWrong === 0 &&
      candidate.lostBaselineCorrect === 0 &&
      candidate.introducedOperationalFailures === 0 &&
      candidate.introducedInvalidOutputs === 0 &&
      candidate.correctAccepted >= 5 &&
      (baseline.wrongAccepted === 0 || candidate.removedBaselineWrong >= 1),
  };
}

const keys = (value) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? Object.keys(value).sort().join(",")
    : "";
const exact = (value, fields) => keys(value) === [...fields].sort().join(",");
const integer = (n, minimum, maximum) => Number.isInteger(n) && n >= minimum && n <= maximum;
const counterNames = [
  "maskRequestsAttempted",
  "maskRequestsCompleted",
  "maskedImagesAttempted",
  "maskedImagesCompleted",
  "clipPredictionsAttempted",
  "clipPredictionsCompleted",
];
export function decodeForeground(call, validateScores) {
  const r = call.raw,
    c = r?.counters;
  const processOkay = !call.failed && !call.signal && !call.errorCode;
  const countersOkay =
    exact(c, counterNames) &&
    counterNames.every((key) => integer(c[key], 0, key.startsWith("maskRequests") ? 1 : 4)) &&
    c.maskRequestsCompleted <= c.maskRequestsAttempted &&
    c.maskedImagesCompleted <= c.maskedImagesAttempted &&
    c.clipPredictionsCompleted <= c.clipPredictionsAttempted &&
    c.clipPredictionsAttempted <= c.maskedImagesCompleted;
  const durationOkay = integer(r?.durationMs, 0, 60_000);
  if (
    processOkay &&
    call.exitCode === 1 &&
    exact(r, ["schemaVersion", "status", "reason", "durationMs", "counters"]) &&
    r.schemaVersion === "mobileclip-foreground-scores-v1" &&
    r.status === "unavailable" &&
    durationOkay &&
    countersOkay &&
    [
      "invalid_arguments",
      "invalid_path",
      "invalid_assets",
      "invalid_model",
      "invalid_prototype",
      "invalid_image",
      "unsupported_platform",
      "mask_unavailable",
      "too_many_instances",
      "invalid_mask",
      "processing_failed",
      "timeout",
    ].includes(r.reason)
  )
    return { valid: true, operationalSuccess: false, reason: r.reason, instances: [], counters: c };
  const fields = [
    "schemaVersion",
    "status",
    "modelId",
    "modelRevision",
    "imageWeightSha256",
    "prototypesSha256",
    "promptPolicy",
    "promptsSha256",
    "preprocessing",
    "cropPolicy",
    "maskPolicy",
    "clipComputeUnits",
    "maskComputeUnits",
    "maskRequestRevision",
    "logicalDeadlineMs",
    "osVersion",
    "durationMs",
    "orientedWidth",
    "orientedHeight",
    "counters",
    "mask",
    "instances",
  ];
  const basic =
    processOkay &&
    call.exitCode === 0 &&
    exact(r, fields) &&
    r.schemaVersion === "mobileclip-foreground-scores-v1" &&
    r.status === "observed" &&
    r.modelId === "apple-mobileclip-s0-coreml-2024" &&
    r.modelRevision === "55c8098c12ba8f928e37e26b2e1dd097777c3f98" &&
    r.imageWeightSha256 === "87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6" &&
    r.prototypesSha256 === "0dfe73569d1b2177629d95c4bc21c1392be9228aff6809cab0ed1c3358893c81" &&
    r.promptsSha256 === "aa726197e10fc1911b88bb6d6da099220339133c6e39e500f112b9077316e610" &&
    r.promptPolicy === "packaging-visible-form-v1" &&
    r.preprocessing === "foreground-instance-aspect-fit-256-srgb-gray127-v1" &&
    r.cropPolicy === "apple-selected-instance-crop-alpha-gray127-v1" &&
    r.maskPolicy === "foreground-revision1-max4-logical12s-v1" &&
    r.clipComputeUnits === "cpuOnly" &&
    r.maskComputeUnits === "vision_system_default" &&
    r.maskRequestRevision === 1 &&
    r.logicalDeadlineMs === 12_000 &&
    typeof r.osVersion === "string" &&
    /^\d{1,3}(?:\.\d{1,3}){0,2}$/u.test(r.osVersion) &&
    durationOkay &&
    r.durationMs < 12_000 &&
    integer(r.orientedWidth, 1, 4096) &&
    integer(r.orientedHeight, 1, 4096) &&
    r.orientedWidth * r.orientedHeight <= 16_000_000 &&
    countersOkay &&
    c.maskRequestsAttempted === 1 &&
    c.maskRequestsCompleted === 1 &&
    Array.isArray(r.instances) &&
    integer(r.instances.length, 1, 4);
  let valid = false;
  if (basic) {
    const m = r.mask;
    const maskOkay =
      exact(m, [
        "width",
        "height",
        "bytesPerRow",
        "pixelFormat",
        "encoding",
        "subjectInstanceIndices",
        "observedMaskLabels",
      ]) &&
      integer(m.width, 1, 4096) &&
      integer(m.height, 1, 4096) &&
      m.width * m.height <= 16_000_000 &&
      integer(m.pixelFormat, 0, 0xffff_ffff) &&
      ["uint8_instance_labels", "float32_integer_instance_labels"].includes(m.encoding) &&
      m.pixelFormat === (m.encoding === "uint8_instance_labels" ? 1278226488 : 1278226534) &&
      integer(
        m.bytesPerRow,
        m.width * (m.encoding === "uint8_instance_labels" ? 1 : 4),
        Math.floor(70_000_000 / m.height),
      ) &&
      Array.isArray(m.subjectInstanceIndices) &&
      m.subjectInstanceIndices.length === r.instances.length &&
      m.subjectInstanceIndices.every(
        (n, i, a) =>
          integer(n, 1, m.encoding === "uint8_instance_labels" ? 255 : 65_535) &&
          (i === 0 || n > a[i - 1]),
      ) &&
      JSON.stringify(m.observedMaskLabels) === JSON.stringify(m.subjectInstanceIndices);
    valid = Boolean(
      maskOkay &&
        r.instances.every(
          (instance, i) =>
            exact(instance, [
              "instanceIndex",
              "cropWidth",
              "cropHeight",
              "cropPixelFormat",
              "embeddingNorm",
              "scores",
            ]) &&
            instance.instanceIndex === m.subjectInstanceIndices[i] &&
            integer(instance.cropWidth, 1, r.orientedWidth) &&
            integer(instance.cropHeight, 1, r.orientedHeight) &&
            [32, 1111970369].includes(instance.cropPixelFormat) &&
            Number.isFinite(instance.embeddingNorm) &&
            Math.abs(instance.embeddingNorm - 1) < 0.000_01 &&
            validateScores(instance.scores),
        ) &&
        [
          c.maskedImagesAttempted,
          c.maskedImagesCompleted,
          c.clipPredictionsAttempted,
          c.clipPredictionsCompleted,
        ].every((n) => n === r.instances.length),
    );
  }
  return {
    valid,
    operationalSuccess: valid,
    reason: valid ? null : "invalid_response",
    instances: valid ? r.instances : [],
    counters: countersOkay ? c : null,
  };
}
