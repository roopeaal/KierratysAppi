import * as Location from "expo-location";
import { Platform } from "react-native";
import { locateOnce } from "./location-session";
import { AddressLookupIssue, createManualLocationLookup } from "./manual-location";

export const readAddressLocation = createManualLocationLookup(async (address, signal) => {
  if (Platform.OS === "web") throw new AddressLookupIssue("unavailable");
  if (Platform.OS === "android") {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) throw new AddressLookupIssue("unavailable");
  }
  if (signal.aborted) throw new AddressLookupIssue("cancelled");
  return Location.geocodeAsync(address);
});

export function readDeviceLocation(signal: AbortSignal) {
  return locateOnce(
    {
      requestPermission: Location.requestForegroundPermissionsAsync,
      servicesEnabled: Location.hasServicesEnabledAsync,
      watch: (onFix, onError) =>
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 1000,
            distanceInterval: 0,
          },
          onFix,
          onError,
        ),
    },
    signal,
  );
}
