import { Image, StyleSheet, View } from "react-native";

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
      style={{ width: size, height: size * 0.94, overflow: "hidden", borderRadius: size / 2 }}
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

export function ScanIllustration() {
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
      style={styles.scan}
    />
  );
}

const styles = StyleSheet.create({
  scan: { position: "absolute", right: 4, bottom: -23, width: 125, height: 153 },
});
