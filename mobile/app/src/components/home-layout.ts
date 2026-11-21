export const homeShortcutGrid = { height: 78, gap: 8, singleColumnBelow: 386 } as const;

export function homeReferenceLayout(width: number, fontScale: number) {
  const expandedText = fontScale > 1.2;
  return {
    expandedText,
    showMotto: !expandedText && width >= 375,
    showCamera: !expandedText && width >= 375,
    scanHeight: width >= 375 ? 110 : 104,
    scanArtScale: width >= 375 ? 1 : 0.82,
  };
}
