import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import { AccessibilityInfo, AppState } from "react-native";

const InteractionMotionContext = createContext(false);

/** One live preference listener for the whole app. Until known, stay still. */
export function InteractionMotionProvider({ children }: PropsWithChildren) {
  const [reduced, setReduced] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState === "active");
  useEffect(() => {
    let active = true;
    let changed = false;
    const preference = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      changed = true;
      setReduced(value);
    });
    const app = AppState.addEventListener("change", (state) => setForeground(state === "active"));
    setForeground(AppState.currentState === "active");
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active && !changed) setReduced(value);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      preference?.remove();
      app.remove();
    };
  }, []);
  return (
    <InteractionMotionContext.Provider value={foreground && !reduced}>
      {children}
    </InteractionMotionContext.Provider>
  );
}

export function useInteractionMotion() {
  return useContext(InteractionMotionContext);
}
