import { Image } from "react-native";

const symbols = {
  camera: require("../../assets/symbols/home-camera.png"),
  location: require("../../assets/symbols/home-location.png"),
  recycling: require("../../assets/symbols/home-recycling.png"),
  home: require("../../assets/symbols/tab-home.png"),
  pin: require("../../assets/symbols/tab-location.png"),
  scan: require("../../assets/symbols/tab-scan.png"),
  settings: require("../../assets/symbols/tab-settings.png"),
} as const;

/** Original vector sources compiled to native-compatible alpha PNGs. Never a control. */
export function ReferenceSymbol({
  name,
  size = 32,
  color,
}: {
  readonly name: keyof typeof symbols;
  readonly size?: number;
  readonly color?: string;
}) {
  return (
    <Image
      source={symbols[name]}
      resizeMode="contain"
      accessible={false}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      testID={`reference-symbol-${name}`}
      style={{ width: size, height: size, tintColor: color }}
    />
  );
}
