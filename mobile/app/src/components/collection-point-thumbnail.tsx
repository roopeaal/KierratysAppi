import type { CollectionPoint } from "@kierratysappi/contracts/collection-points";
import { Image, StyleSheet } from "react-native";
import { collectionPointPhoto } from "@/features/nearby/point-photo";

const photos = {
  batteries: require("../../assets/backgrounds/nearby-batteries.jpg"),
  cardboard: require("../../assets/backgrounds/nearby-cardboard.jpg"),
  collection: require("../../assets/backgrounds/nearby-collection-markings.jpg"),
  electronics: require("../../assets/backgrounds/nearby-electronics.jpg"),
  glass: require("../../assets/backgrounds/nearby-glass-markings.jpg"),
  metal: require("../../assets/backgrounds/nearby-metal-markings.jpg"),
  packaging: require("../../assets/backgrounds/nearby-packaging-markings.jpg"),
  paper: require("../../assets/backgrounds/nearby-paper-markings.jpg"),
  plastic: require("../../assets/backgrounds/nearby-plastic.jpg"),
  station: require("../../assets/backgrounds/nearby-station.jpg"),
  textiles: require("../../assets/backgrounds/nearby-textiles.jpg"),
} as const;

// These bundled images illustrate categories, not actual sites.
export function CollectionPointThumbnail({
  point,
  compact = false,
}: {
  readonly point: Pick<CollectionPoint, "kind" | "reportedMaterials">;
  readonly compact?: boolean;
}) {
  const variant = collectionPointPhoto(point);
  if (!variant) return null;
  return (
    <Image
      accessible={false}
      accessibilityElementsHidden
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      resizeMode="cover"
      source={photos[variant]}
      style={[styles.thumbnail, compact && styles.compact]}
      testID={`point-photo-${variant}`}
    />
  );
}

const styles = StyleSheet.create({
  thumbnail: { width: 80, height: 60, borderRadius: 10, flexShrink: 0 },
  compact: { width: 56, height: 44 },
});
