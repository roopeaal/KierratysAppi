export function navigationAnimation(reducedMotion: boolean): "none" | "fade_from_bottom" {
  return reducedMotion ? "none" : "fade_from_bottom";
}
