export function navigationAnimation(reducedMotion: boolean): "none" | "fade_from_bottom" {
  return reducedMotion ? "none" : "fade_from_bottom";
}

export const pressMotion = {
  scale: 0.98,
  releaseMs: 120,
  easeOut: [0.23, 1, 0.32, 1],
} as const;

/** Unknown/assistive activation gets feedback without movement. */
export function isPointerActivation(event: unknown, web: boolean): boolean {
  if (!event || typeof event !== "object") return false;
  const data = event as Record<string, unknown>;
  if (!web) return Array.isArray(data.changedTouches) && data.changedTouches.length > 0;
  return (
    data.type === "touchstart" ||
    data.type === "mousedown" ||
    (data.type === "pointerdown" &&
      (data.pointerType === "mouse" ||
        data.pointerType === "touch" ||
        data.pointerType === "pen")) ||
    (data.type === "click" && typeof data.detail === "number" && data.detail > 0)
  );
}
