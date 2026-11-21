import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useForegroundLocation } from "@/features/nearby/foreground-context";
import { useSortingRegion } from "./context";

export function useAutomaticRegion() {
  const { enabled, foreground, read } = useForegroundLocation();
  const { fromCoordinates, selection } = useSortingRegion();
  const manual = selection?.method === "manual";
  useFocusEffect(
    useCallback(() => {
      if (!enabled || !foreground || manual) return;
      const controller = new AbortController();
      void read(controller.signal, { prompt: false })
        .then(({ coords }) => {
          if (!controller.signal.aborted) fromCoordinates(coords);
        })
        .catch(() => undefined);
      return () => controller.abort();
    }, [enabled, foreground, fromCoordinates, manual, read]),
  );
}
