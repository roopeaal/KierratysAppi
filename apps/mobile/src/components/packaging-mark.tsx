import { StyleSheet, Text, View } from "react-native";
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
  const border = { borderColor: palette.textPrimary };
  const isBottle = material === "plastic";
  const isJar = material === "glass";
  const isCan = material === "metal";
  return (
    <View
      accessible={false}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.tile, { backgroundColor: palette.pineSoft }]}
    >
      {!material || material === "unknown" ? (
        <Text
          style={{ color: palette.textPrimary, fontSize: 26, fontFamily: "Atkinson_400Regular" }}
        >
          ?
        </Text>
      ) : isBottle ? (
        <View style={styles.object}>
          <View style={[styles.bottleCap, border]} />
          <View style={[styles.bottle, border]}>
            <View style={[styles.label, border]} />
          </View>
        </View>
      ) : isJar || isCan ? (
        <View style={styles.object}>
          <View style={[styles.lid, border]} />
          <View style={[styles.jar, isCan && styles.can, border]}>
            <View style={[styles.label, border]} />
          </View>
        </View>
      ) : (
        <View style={[styles.carton, border]}>
          <View style={[styles.fold, border]} />
          <View style={[styles.cartonLine, border]} />
        </View>
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
  object: { alignItems: "center" },
  bottleCap: { width: 10, height: 5, borderWidth: 1.5, borderRadius: 2, marginBottom: -1 },
  bottle: {
    width: 21,
    height: 30,
    borderWidth: 1.5,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    justifyContent: "center",
  },
  label: { height: 10, borderTopWidth: 1.5, borderBottomWidth: 1.5 },
  lid: { width: 24, height: 5, borderWidth: 1.5, borderRadius: 2, marginBottom: 2 },
  jar: { width: 24, height: 25, borderWidth: 1.5, borderRadius: 5, justifyContent: "center" },
  can: { height: 28, borderRadius: 3 },
  carton: { width: 24, height: 32, borderWidth: 1.5, borderRadius: 2 },
  fold: { height: 8, borderBottomWidth: 1.5 },
  cartonLine: { position: "absolute", right: 6, top: 0, bottom: 0, borderLeftWidth: 1.5 },
});
