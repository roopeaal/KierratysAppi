import { StyleSheet, Text, View } from "react-native";
import { MaterialStudy, paperTints } from "./material-study";
import { useAppTheme } from "@/theme/tokens";

/** Original, decorative linework, not an encoded/scannable product barcode. */
export function BarcodeMark({
  color,
  large = false,
}: {
  readonly color: string;
  readonly large?: boolean;
}) {
  return (
    <View
      accessible={false}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.barcode, large && styles.large]}
    >
      {(["topLeft", "topRight", "bottomLeft", "bottomRight"] as const).map((corner) => (
        <View key={corner} style={[styles.corner, styles[corner], { borderColor: color }]} />
      ))}
      <View style={styles.bars}>
        {Object.entries({ a: 2, b: 4, c: 2, d: 1, e: 3, f: 2, g: 4, h: 1, i: 2 }).map(
          ([id, width]) => (
            <View key={id} style={{ width, height: large ? 34 : 22, backgroundColor: color }} />
          ),
        )}
      </View>
    </View>
  );
}

export function PackagingMark({ material }: { readonly material?: string }) {
  const { palette } = useAppTheme();
  const known =
    material === "plastic" || material === "metal" || material === "carton" || material === "glass"
      ? material
      : undefined;
  return (
    <View
      accessible={false}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.tile, { backgroundColor: known ? paperTints[known] : palette.pineSoft }]}
    >
      {known ? (
        <MaterialStudy material={known} size={48} />
      ) : (
        <Text style={{ color: palette.textPrimary, fontSize: 24 }}>–</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  barcode: { width: 64, height: 46, alignItems: "center", justifyContent: "center" },
  large: { width: 78, height: 62 },
  bars: { flexDirection: "row", gap: 3, alignItems: "center" },
  corner: { position: "absolute", width: 12, height: 12 },
  topLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 5 },
  topRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 5 },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 5,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 5,
  },
  tile: { width: 52, height: 58, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});
