import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/theme/tokens";
import { BarcodeMark } from "./packaging-mark";
import { ReferenceSymbol } from "./reference-symbol";

export type ActionIconKind =
  | "nearby"
  | "guide"
  | "history"
  | "manual"
  | "home"
  | "scan"
  | "settings"
  | "photo";

const referenceIcons = {
  nearby: "location",
  guide: "recycling",
  home: "home",
  scan: "scan",
  settings: "settings",
  photo: "camera",
} as const;

/** The same original symbols as Home; the surrounding control supplies the name. */
export function ActionIcon({
  kind,
  color,
}: {
  readonly kind: ActionIconKind;
  readonly color?: string;
}) {
  const { palette, isDark } = useAppTheme();
  const ink = color ?? palette.actionLink;
  const stroke = { borderColor: ink };
  const symbol = kind === "history" || kind === "manual" ? null : referenceIcons[kind];
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
      {symbol ? (
        <ReferenceSymbol
          name={symbol}
          size={28}
          color={color ?? (isDark ? (kind === "photo" ? palette.cobalt : palette.pine) : undefined)}
        />
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
  clock: { width: 23, height: 23, borderWidth: strokeWidth, borderRadius: 12 },
  clockMinute: { position: "absolute", left: 9, top: 4, width: strokeWidth, height: 7 },
  clockHour: { position: "absolute", left: 9, top: 9, width: 6, height: strokeWidth },
  keypad: { width: 21, flexDirection: "row", flexWrap: "wrap", gap: 3 },
  key: { width: 5, height: 6, borderWidth: strokeWidth, borderRadius: 1 },
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
