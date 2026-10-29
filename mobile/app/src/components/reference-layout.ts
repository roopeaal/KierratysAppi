/** Source rectangle is the original decorative leaf panel, never the reference UI. */
export function photoBackdropLayout(width: number, height: number) {
  const boundedWidth = Number.isFinite(width) && width > 0 ? Math.min(width, 560) : 358;
  const boundedHeight = Number.isFinite(height) && height > 0 ? Math.min(height, 1_000) : 112;
  const scaleX = boundedWidth / 846;
  const scaleY = boundedHeight / 236;
  return { width: 941 * scaleX, height: 1672 * scaleY, left: -47 * scaleX, top: -529 * scaleY };
}
