import { Image } from "react-native";
import { wasteMarkings } from "@/features/sorting/waste-markings";

// Original object studies, not official bin symbols or predictions of recyclability.
const plates = {
  plastic: require("../../assets/material-studies/plastic.png"),
  carton: require("../../assets/material-studies/carton.png"),
  glass: require("../../assets/material-studies/glass.png"),
  metal: require("../../assets/material-studies/metal.png"),
  "plastic-object": require("../../assets/material-studies/plastic-object.png"),
  paper: require("../../assets/material-studies/paper.png"),
  "private-paper": require("../../assets/material-studies/private-paper.png"),
  "small-metal": require("../../assets/material-studies/small-metal.png"),
  "scrap-metal": require("../../assets/material-studies/scrap-metal.png"),
  wood: require("../../assets/material-studies/wood.png"),
  "treated-wood": require("../../assets/material-studies/treated-wood.png"),
  composite: require("../../assets/material-studies/composite.png"),
  other: require("../../assets/material-studies/other.png"),
  deposit: require("../../assets/material-studies/deposit.png"),
  batteries: require("../../assets/material-studies/batteries.png"),
  "vehicle-battery": require("../../assets/material-studies/vehicle-battery.png"),
  electronics: require("../../assets/material-studies/electronics.png"),
  textiles: require("../../assets/material-studies/textiles.png"),
  shoes: require("../../assets/material-studies/shoes.png"),
  food: require("../../assets/material-studies/food.png"),
  garden: require("../../assets/material-studies/garden.png"),
  branches: require("../../assets/material-studies/branches.png"),
  hazardous: require("../../assets/material-studies/hazardous.png"),
  medicine: require("../../assets/material-studies/medicine.png"),
  "special-waste": require("../../assets/material-studies/special-waste.png"),
  bulb: require("../../assets/material-studies/bulb.png"),
  fluorescent: require("../../assets/material-studies/fluorescent.png"),
  tyres: require("../../assets/material-studies/tyres.png"),
  vehicles: require("../../assets/material-studies/vehicles.png"),
  mixed: require("../../assets/material-studies/mixed.png"),
  bulky: require("../../assets/material-studies/bulky.png"),
  reuse: require("../../assets/material-studies/reuse.png"),
  construction: require("../../assets/material-studies/construction.png"),
  plaster: require("../../assets/material-studies/plaster.png"),
  "mineral-waste": require("../../assets/material-studies/mineral-waste.png"),
  soil: require("../../assets/material-studies/soil.png"),
  insulation: require("../../assets/material-studies/insulation.png"),
  asbestos: require("../../assets/material-studies/asbestos.png"),
} as const;
export type MaterialStudyKind = keyof typeof plates;

export const paperTints = {
  plastic: wasteMarkings.plastic.tint,
  carton: wasteMarkings.carton.tint,
  glass: wasteMarkings.glass.tint,
  metal: wasteMarkings.metal.tint,
} as const;

export function MaterialStudy({
  material,
  size = 52,
}: {
  material: MaterialStudyKind;
  size?: number;
}) {
  return (
    <Image
      source={plates[material]}
      accessible={false}
      accessibilityElementsHidden
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      resizeMode="contain"
      testID={`category-icon-${material}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.min(12, size / 4),
        flexShrink: 0,
      }}
    />
  );
}
