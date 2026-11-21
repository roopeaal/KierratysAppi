import { Image, StyleSheet, View } from "react-native";
import type { HistoryArtwork } from "@/features/history/product-artwork";
import { MaterialStudy, type MaterialStudyKind } from "./material-study";

const shapes = {
  bottle: { source: require("../../assets/recent-packaging/bottle.png"), tint: "#E7F2F8" },
  can: { source: require("../../assets/recent-packaging/can.png"), tint: "#F6EEEA" },
  jar: { source: require("../../assets/recent-packaging/jar.png"), tint: "#EDF3E8" },
  box: { source: require("../../assets/recent-packaging/box.png"), tint: "#F7EEE1" },
  carton: { source: require("../../assets/recent-packaging/carton.png"), tint: "#EAF2F6" },
  bag: { source: require("../../assets/recent-packaging/bag.png"), tint: "#F8EEE0" },
  wrap: { source: require("../../assets/recent-packaging/wrap.png"), tint: "#F1EBF6" },
  tray: { source: require("../../assets/recent-packaging/tray.png"), tint: "#EBF2EA" },
  cup: { source: require("../../assets/recent-packaging/cup.png"), tint: "#F7EDE6" },
  tube: { source: require("../../assets/recent-packaging/tube.png"), tint: "#EDF0F7" },
  neutral: { source: require("../../assets/recent-packaging/neutral.png"), tint: "#EDF4EF" },
} as const;

const materials = {
  "plastic-material": "plastic",
  "carton-material": "carton",
  "paper-material": "paper",
  "glass-material": "glass",
  "metal-material": "metal",
  "wood-material": "wood",
  "composite-material": "composite",
} as const satisfies Record<Exclude<HistoryArtwork, keyof typeof shapes>, MaterialStudyKind>;

export function RecentProductArtwork({ artwork }: { readonly artwork?: HistoryArtwork }) {
  const id = artwork ?? "neutral";
  const material = id in materials ? materials[id as keyof typeof materials] : undefined;
  const shape = id in shapes ? shapes[id as keyof typeof shapes] : shapes.neutral;
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.tile, { backgroundColor: shape.tint }]}
      testID={`home-recent-art-${id}`}
    >
      {material ? (
        <MaterialStudy material={material} size={36} />
      ) : (
        <Image source={shape.source} resizeMode="contain" style={styles.art} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 46,
    height: 49,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  art: { width: 44, height: 44 },
});
