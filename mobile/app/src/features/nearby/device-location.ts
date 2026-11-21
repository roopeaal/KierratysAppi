import * as Location from "expo-location";
import { Platform } from "react-native";
import { type LocationPort, locateOnce } from "./location-session";
import { AddressLookupIssue, createManualLocationLookup } from "./manual-location";
import { createPointAddressLookup } from "./point-address";

let permissionRequest: Promise<boolean> | undefined;
export async function foregroundPermission(prompt: boolean): Promise<boolean> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) return true;
  if (!prompt || !current.canAskAgain) return false;
  permissionRequest ??= Location.requestForegroundPermissionsAsync()
    .then((result) => result.granted)
    .finally(() => {
      permissionRequest = undefined;
    });
  return permissionRequest;
}

export const readAddressLocation = createManualLocationLookup(async (address, signal) => {
  if (Platform.OS === "web") throw new AddressLookupIssue("unavailable");
  if (Platform.OS === "android") {
    if (!(await foregroundPermission(true))) throw new AddressLookupIssue("unavailable");
  }
  if (signal.aborted) throw new AddressLookupIssue("cancelled");
  return Location.geocodeAsync(address);
});

export const readPointAddress = createPointAddressLookup(async (coordinates, signal) => {
  if (Platform.OS === "web") return [];
  if (Platform.OS === "android" && !(await foregroundPermission(false))) return [];
  if (signal.aborted) return [];
  return Location.reverseGeocodeAsync(coordinates);
});

const watchWeb: LocationPort["watch"] = async (onFix, onError) => {
  // Expo's web adapter retains an unbounded module-level last-known fix.
  // Subscribe directly so this app owns the lifetime of the delivered coordinates.
  const geo = navigator.geolocation;
  const id = geo.watchPosition(
    ({ coords, timestamp }) =>
      onFix({
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        },
        timestamp,
      }),
    onError,
    { maximumAge: 0, enableHighAccuracy: false },
  );
  return { remove: () => geo.clearWatch(id) };
};

export function readDeviceLocation(signal: AbortSignal) {
  return locateOnce(
    {
      // Permission is checked by the shared foreground coordinator first.
      requestPermission: async () => ({ granted: true }),
      servicesEnabled: Location.hasServicesEnabledAsync,
      watch:
        Platform.OS === "web"
          ? watchWeb
          : (onFix, onError) =>
              Location.watchPositionAsync(
                { accuracy: Location.Accuracy.Balanced, timeInterval: 1000, distanceInterval: 0 },
                onFix,
                onError,
              ),
    },
    signal,
  );
}
