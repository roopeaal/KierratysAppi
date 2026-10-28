import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/theme/tokens";
import { BarcodeMark } from "./packaging-mark";

export type ActionIconKind =
  | "nearby"
  | "guide"
  | "history"
  | "manual"
  | "home"
  | "scan"
  | "settings"
  | "photo";

/** Original native linework. The surrounding control supplies its accessible name. */
export function ActionIcon({
  kind,
  color,
}: {
  readonly kind: ActionIconKind;
  readonly color?: string;
}) {
  const { palette } = useAppTheme();
  const ink = color ?? palette.actionLink;
  const stroke = { borderColor: ink };
  return (
    <View
      style={styles.icon}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      pointerEvents="none"
      testID={`action-icon-${kind}`}
    >
      {kind === "home" ? (
        <>
          <View style={[styles.roof, stroke]} />
          <View style={[styles.house, stroke]} />
          <View style={[styles.door, stroke]} />
        </>
      ) : kind === "scan" ? (
        <View style={styles.scanFrame}>
          <View style={[styles.frameCorner, styles.frameTopLeft, stroke]} />
          <View style={[styles.frameCorner, styles.frameTopRight, stroke]} />
          <View style={[styles.frameCorner, styles.frameBottomLeft, stroke]} />
          <View style={[styles.frameCorner, styles.frameBottomRight, stroke]} />
        </View>
      ) : kind === "settings" ? (
        <View style={styles.sliders}>
          {[3, 10, 17].map((top, index) => (
            <View key={top} style={[styles.sliderLine, { top, backgroundColor: ink }]}>
              <View
                style={[
                  styles.sliderKnob,
                  {
                    borderColor: ink,
                    backgroundColor: palette.bgSurface,
                    left: index === 1 ? 13 : 4,
                  },
                ]}
              />
            </View>
          ))}
        </View>
      ) : kind === "photo" ? (
        <View style={[styles.camera, stroke]}>
          <View style={[styles.lens, stroke]} />
          <View style={[styles.cameraTop, { backgroundColor: ink }]} />
        </View>
      ) : kind === "nearby" ? (
        <View style={[styles.pin, stroke]}>
          <View style={[styles.pinCentre, stroke]} />
        </View>
      ) : kind === "guide" ? (
        <View style={styles.recycle}>
          {[0, 120, 240].map((angle) => (
            <View
              key={angle}
              style={[styles.recycleArm, { transform: [{ rotate: `${angle}deg` }] }]}
            >
              <View style={[styles.recycleBar, { backgroundColor: ink }]} />
              <View style={[styles.recycleArrow, { borderLeftColor: ink }]} />
            </View>
          ))}
        </View>
      ) : kind === "history" ? (
        <View style={[styles.clock, stroke]}>
          <View style={[styles.clockMinute, { backgroundColor: ink }]} />
          <View style={[styles.clockHour, { backgroundColor: ink }]} />
        </View>
      ) : (
        <View style={styles.keypad}>
          {["a", "b", "c", "d", "e", "f"].map((id) => (
            <View key={id} style={[styles.key, stroke]} />
          ))}
        </View>
      )}
    </View>
  );
}

/** A package label, not a real barcode, product match or material claim. */
export function ScanPackageMark({ color }: { readonly color: string }) {
  return (
    <View
      style={[styles.package, { borderColor: color }]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      pointerEvents="none"
      testID="scan-package-mark"
    >
      <View style={[styles.packageSeam, { borderColor: color }]} />
      <BarcodeMark color={color} />
      <View style={[styles.labelLine, { backgroundColor: color }]} />
    </View>
  );
}

const strokeWidth = 1.8;
const styles = StyleSheet.create({
  icon: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  pin: {
    width: 19,
    height: 19,
    borderWidth: strokeWidth,
    borderRadius: 10,
    borderBottomRightRadius: 2,
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    justifyContent: "center",
    marginTop: -4,
  },
  pinCentre: { width: 6, height: 6, borderWidth: strokeWidth, borderRadius: 3 },
  bookLeft: {
    position: "absolute",
    left: 2,
    top: 5,
    width: 12,
    height: 19,
    borderWidth: strokeWidth,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 2,
    transform: [{ rotate: "-5deg" }],
  },
  bookRight: {
    position: "absolute",
    right: 2,
    top: 5,
    width: 12,
    height: 19,
    borderWidth: strokeWidth,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 2,
    transform: [{ rotate: "5deg" }],
  },
  bookSpine: { height: 20, borderLeftWidth: strokeWidth, marginTop: 3 },
  clock: {
    width: 23,
    height: 23,
    borderWidth: strokeWidth,
    borderRadius: 12,
  },
  clockMinute: { position: "absolute", left: 9, top: 4, width: strokeWidth, height: 7 },
  clockHour: { position: "absolute", left: 9, top: 9, width: 6, height: strokeWidth },
  keypad: { width: 21, flexDirection: "row", flexWrap: "wrap", gap: 3 },
  key: { width: 5, height: 6, borderWidth: strokeWidth, borderRadius: 1 },
  roof: {
    position: "absolute",
    top: 3,
    width: 17,
    height: 17,
    borderTopWidth: strokeWidth,
    borderLeftWidth: strokeWidth,
    transform: [{ rotate: "45deg" }],
  },
  house: {
    position: "absolute",
    top: 11,
    width: 19,
    height: 14,
    borderWidth: strokeWidth,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  door: {
    position: "absolute",
    bottom: 3,
    width: 6,
    height: 8,
    borderWidth: strokeWidth,
    borderBottomWidth: 0,
  },
  scanFrame: {
    width: 23,
    height: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  frameCorner: { width: 8, height: 8, position: "absolute" },
  frameTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: 4,
  },
  frameTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopRightRadius: 4,
  },
  frameBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomLeftRadius: 4,
  },
  frameBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomRightRadius: 4,
  },
  recycle: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  recycleArm: { width: 26, height: 26, position: "absolute" },
  recycleBar: { width: 13, height: 4, position: "absolute", top: 2, left: 4, borderRadius: 1 },
  recycleArrow: {
    position: "absolute",
    left: 15,
    top: -1,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 7,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  sliders: { width: 23, height: 23 },
  sliderLine: { position: "absolute", width: 23, height: strokeWidth },
  sliderKnob: {
    position: "absolute",
    top: -2,
    width: 6,
    height: 6,
    borderWidth: strokeWidth,
    borderRadius: 3,
  },
  camera: {
    width: 25,
    height: 19,
    borderWidth: strokeWidth,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraTop: { position: "absolute", top: -5, left: 5, width: 10, height: 3, borderRadius: 2 },
  lens: { width: 10, height: 10, borderWidth: strokeWidth, borderRadius: 5 },
  package: {
    width: 80,
    height: 90,
    borderWidth: strokeWidth,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    flexShrink: 0,
  },
  packageSeam: { position: "absolute", top: 9, left: 0, right: 0, borderTopWidth: strokeWidth },
  labelLine: { width: 22, height: strokeWidth, borderRadius: 1 },
});
