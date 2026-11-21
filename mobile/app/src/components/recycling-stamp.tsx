import { type ComponentRef, useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { useInteractionMotion } from "@/features/accessibility/motion-context";
import type { OverviewMaterial } from "@/features/overview/model";
import { useAppTheme } from "@/theme/tokens";
import { MaterialStudy } from "./material-study";

const easing = [0.23, 1, 0.32, 1] as const;
const stampDuration = 230;
const checkDelay = 34;
const checkDuration = 180;

function domNode(ref: ComponentRef<typeof View> | null) {
  const element = ref as unknown as HTMLElement | null;
  return element && typeof element.animate === "function" ? element : undefined;
}

/** A private receipt, not a claim about a bin, a destination, or environmental impact. */
export function RecyclingStamp({
  material,
  play,
}: {
  readonly material?: OverviewMaterial;
  readonly play: boolean;
}) {
  const { palette } = useAppTheme();
  const motionAllowed = useInteractionMotion();
  const materialRef = useRef<ComponentRef<typeof View>>(null);
  const checkRef = useRef<ComponentRef<typeof View>>(null);
  const played = useRef(false);
  const [settle] = useState(() => new Animated.Value(1));
  const [check] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!play || played.current) return;
    played.current = true;
    if (!motionAllowed) return;

    if (Platform.OS === "web") {
      const options = { easing: `cubic-bezier(${easing.join(",")})`, fill: "backwards" } as const;
      const drop = domNode(materialRef.current)?.animate(
        [
          { transform: "translateY(-7px) rotate(-6deg) scale(0.94)", opacity: 0.72 },
          { transform: "translateY(0) rotate(0deg) scale(1)", opacity: 1 },
        ],
        { ...options, duration: stampDuration },
      );
      const stamp = domNode(checkRef.current)?.animate(
        [
          { transform: "scale(0.94)", opacity: 0.45 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { ...options, duration: checkDuration, delay: checkDelay },
      );
      return () => {
        drop?.cancel();
        stamp?.cancel();
      };
    }

    settle.setValue(0);
    check.setValue(0);
    const animation = Animated.parallel([
      Animated.timing(settle, {
        toValue: 1,
        easing: Easing.bezier(...easing),
        duration: stampDuration,
        useNativeDriver: true,
      }),
      Animated.timing(check, {
        toValue: 1,
        easing: Easing.bezier(...easing),
        duration: checkDuration,
        delay: checkDelay,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => {
      animation.stop();
      settle.setValue(1);
      check.setValue(1);
    };
  }, [check, motionAllowed, play, settle]);

  return (
    <View
      aria-hidden
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      testID="recycle-saved-stamp"
      style={[
        styles.tile,
        { backgroundColor: palette.bgElevated, borderColor: palette.borderSubtle },
      ]}
    >
      {material && (
        <Animated.View
          ref={materialRef}
          testID="recycle-stamp-material"
          style={[
            styles.material,
            Platform.OS !== "web" && {
              opacity: settle.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }),
              transform: [
                { translateY: settle.interpolate({ inputRange: [0, 1], outputRange: [-7, 0] }) },
                {
                  rotate: settle.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-6deg", "0deg"],
                  }),
                },
                { scale: settle.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
              ],
            },
          ]}
        >
          <MaterialStudy material={material} size={38} />
        </Animated.View>
      )}
      <View
        style={[
          styles.receiptLine,
          { backgroundColor: palette.pineSoft, borderColor: palette.borderSubtle },
        ]}
      />
      <Animated.View
        ref={checkRef}
        testID="recycle-stamp-check"
        style={[
          styles.check,
          {
            backgroundColor: palette.statusSuccess,
            borderColor: palette.bgElevated,
          },
          Platform.OS !== "web" && {
            opacity: check.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
            transform: [
              { scale: check.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
            ],
          },
        ]}
      >
        <View style={[styles.checkMark, { borderColor: palette.onStrong }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 62,
    height: 62,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    flexShrink: 0,
  },
  material: { marginTop: 7 },
  receiptLine: {
    width: 33,
    height: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    position: "absolute",
    bottom: 12,
  },
  check: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 3,
    bottom: 3,
  },
  checkMark: {
    width: 5,
    height: 9,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderBottomRightRadius: 1,
    transform: [{ rotate: "42deg" }],
    marginBottom: 2,
  },
});
