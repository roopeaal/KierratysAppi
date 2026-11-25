import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { isPointerActivation, pressMotion } from "@/features/accessibility/motion";
import { useInteractionMotion } from "@/features/accessibility/motion-context";

const web = Platform.OS === "web";
const NativePressable = Animated.createAnimatedComponent(Pressable);
const releaseEase = Easing.bezier(...pressMotion.easeOut);

// Expo web augments React Native's callback type with a required hover field.
// This shared control promises only the pressed state available on both platforms.
type TactileProps = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle> | ((state: { readonly pressed: boolean }) => StyleProp<ViewStyle>);
};

/** Pointer-down is immediate; only the return to rest eases. Keep the original target. */
export function TactilePressable({ style, onPressIn, onPressOut, onBlur, ...props }: TactileProps) {
  const motion = useInteractionMotion() && !props.disabled;
  const [pointerDown, setPointerDown] = useState(false);
  const [nativePressed, setNativePressed] = useState(false);
  const [scale] = useState(() => new Animated.Value(1));
  const nativeMoving = useRef(false);

  useEffect(() => {
    if (!motion) {
      setPointerDown(false);
      setNativePressed(false);
      nativeMoving.current = false;
      scale.stopAnimation();
      scale.setValue(1);
    }
    return () => scale.stopAnimation();
  }, [motion, scale]);

  const enter: NonNullable<PressableProps["onPressIn"]> = (event) => {
    if (!web) setNativePressed(true);
    if (motion && isPointerActivation(event.nativeEvent, web)) {
      if (web) setPointerDown(true);
      else {
        nativeMoving.current = true;
        scale.stopAnimation();
        scale.setValue(pressMotion.scale);
      }
    }
    onPressIn?.(event);
  };
  const leave: NonNullable<PressableProps["onPressOut"]> = (event) => {
    if (web) setPointerDown(false);
    else {
      setNativePressed(false);
      if (motion && nativeMoving.current) {
        nativeMoving.current = false;
        Animated.timing(scale, {
          toValue: 1,
          duration: pressMotion.releaseMs,
          easing: releaseEase,
          useNativeDriver: true,
          isInteraction: false,
        }).start();
      }
    }
    onPressOut?.(event);
  };
  const blur: NonNullable<PressableProps["onBlur"]> = (event) => {
    setPointerDown(false);
    setNativePressed(false);
    nativeMoving.current = false;
    scale.stopAnimation();
    scale.setValue(1);
    onBlur?.(event);
  };

  if (web) {
    return (
      <Pressable
        {...props}
        onPressIn={enter}
        onPressOut={leave}
        onBlur={blur}
        style={(state) => [
          typeof style === "function" ? style(state) : [style, state.pressed && { opacity: 0.9 }],
          motion && {
            transform: [{ scale: pointerDown ? pressMotion.scale : 1 }],
            transitionProperty: "transform",
            transitionDuration: pointerDown ? "0ms" : `${pressMotion.releaseMs}ms`,
            transitionTimingFunction: `cubic-bezier(${pressMotion.easeOut.join(",")})`,
          },
        ]}
      />
    );
  }
  return (
    <NativePressable
      {...props}
      onPressIn={enter}
      onPressOut={leave}
      onBlur={blur}
      style={[
        typeof style === "function"
          ? style({ pressed: nativePressed && !props.disabled })
          : [style, nativePressed && !props.disabled && { opacity: 0.9 }],
        motion && { transform: [{ scale }] },
      ]}
    />
  );
}
