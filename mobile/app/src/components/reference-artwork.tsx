import { Image, StyleSheet, View } from "react-native";
import { photoBackdropLayout } from "./reference-layout";

/** Original owner-supplied artwork, reused unchanged from KeepItGreen 0142bb0. */
export function LeafBrandMark({ size = 52 }: { readonly size?: number }) {
  const scale = size / 192;
  return (
    <View
      accessible={false}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{
        width: size,
        height: size * 0.94,
        overflow: "hidden",
        borderRadius: size / 2,
        mixBlendMode: "multiply",
      }}
    >
      <Image
        source={require("../../assets/backgrounds/welcome-background.png")}
        accessible={false}
        style={{
          width: 941 * scale,
          height: 1672 * scale,
          position: "absolute",
          left: -376 * scale,
          top: -104 * scale,
        }}
      />
    </View>
  );
}

/** Render-only crop of the existing leaf panel; no screenshot text or example data. */
export function PhotoCardBackdrop({
  width,
  height,
}: {
  readonly width: number;
  readonly height: number;
}) {
  const layout = photoBackdropLayout(width, height);
  return (
    <View
      style={StyleSheet.absoluteFill}
      accessible={false}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      testID="photo-card-backdrop"
    >
      <Image
        source={require("../../assets/backgrounds/home-background.png")}
        accessible={false}
        style={{
          position: "absolute",
          ...layout,
        }}
      />
    </View>
  );
}

export function ScanIllustration({ scale = 1 }: { readonly scale?: number }) {
  return (
    <Image
      source={require("../../assets/backgrounds/photo-bottle-v1.png")}
      testID="scan-illustration"
      accessible={false}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      resizeMode="contain"
      style={[styles.scan, { width: 139 * scale, height: 153 * scale }]}
    />
  );
}

const styles = StyleSheet.create({
  scan: { position: "absolute", right: 7, bottom: -25 },
});
