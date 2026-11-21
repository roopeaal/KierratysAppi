import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { withRecyclingStorageLock } from "../overview/storage";
import { foregroundPermission, readDeviceLocation } from "./device-location";
import { createForegroundFix, type FixOptions } from "./foreground-fix";
import { type LocationFix, LocationIssue } from "./location-session";

const autoLocationKey = "@kierratysappi/automatic-location/v1";
type ForegroundLocation = {
  readonly enabled: boolean | null;
  readonly foreground: boolean;
  readonly permissionRevision: number;
  readonly read: (signal: AbortSignal, options?: FixOptions) => Promise<LocationFix>;
  readonly setEnabled: (enabled: boolean) => Promise<void>;
};
const Context = createContext<ForegroundLocation | undefined>(undefined);

export function ForegroundLocationProvider({ children }: PropsWithChildren) {
  const [session] = useState(() => createForegroundFix(foregroundPermission, readDeviceLocation));
  const [enabled, setPreference] = useState<boolean | null>(null);
  const [foreground, setForeground] = useState(AppState.currentState !== "background");
  const currentForeground = useRef(foreground);
  const revision = useRef(0);
  const [permissionRevision, revisePermission] = useState(0);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  useEffect(() => {
    const version = revision.current;
    let mounted = true;
    void AsyncStorage.getItem(autoLocationKey)
      .then(
        (value) => value === "true",
        () => false,
      )
      .then((value) => {
        if (mounted && version === revision.current) setPreference(value);
      });
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "active") {
        currentForeground.current = state === "active";
        if (state === "background") session.clear();
        setForeground(currentForeground.current);
      }
    });
    // A browser permission can be revoked while its tab is still visible.
    let permission: PermissionStatus | undefined;
    const changed = () => {
      const blocked = permission?.state !== "granted";
      setPermissionBlocked(blocked);
      if (blocked) {
        session.clear();
        revisePermission((value) => value + 1);
      }
    };
    if (typeof navigator !== "undefined")
      void navigator.permissions
        ?.query({ name: "geolocation" })
        .then((status) => {
          if (!mounted) return;
          permission = status;
          status.addEventListener?.("change", changed);
        })
        .catch(() => undefined);
    return () => {
      mounted = false;
      listener.remove();
      permission?.removeEventListener?.("change", changed);
      session.clear();
    };
  }, [session]);
  const read = useCallback(
    (signal: AbortSignal, options?: FixOptions) => {
      if (!currentForeground.current) return Promise.reject(new LocationIssue("cancelled"));
      if (permissionBlocked && !options?.prompt)
        return Promise.reject(new LocationIssue("permission"));
      return session.read(signal, options);
    },
    [permissionBlocked, session],
  );
  const setEnabled = useCallback(
    async (value: boolean) => {
      const version = ++revision.current;
      if (!value) {
        session.clear();
        setPreference(false);
      }
      await withRecyclingStorageLock(() =>
        value
          ? AsyncStorage.setItem(autoLocationKey, "true")
          : AsyncStorage.removeItem(autoLocationKey),
      );
      if (version === revision.current) setPreference(value);
    },
    [session],
  );
  return (
    <Context.Provider value={{ enabled, foreground, permissionRevision, read, setEnabled }}>
      {children}
    </Context.Provider>
  );
}

export function useForegroundLocation() {
  const context = useContext(Context);
  if (!context) throw new Error("Foreground location provider missing");
  return context;
}
