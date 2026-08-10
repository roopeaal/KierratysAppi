import {
  AtkinsonHyperlegibleNext_400Regular,
  AtkinsonHyperlegibleNext_700Bold,
} from "@expo-google-fonts/atkinson-hyperlegible-next";
import { IBMPlexMono_600SemiBold } from "@expo-google-fonts/ibm-plex-mono";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useReducedMotion } from "react-native-reanimated";
import { LanguageProvider } from "@/i18n/language-context";
import { ScanSessionProvider } from "@/features/scan/session-context";
import { navigationAnimation } from "@/features/accessibility/motion";
import { useAppTheme } from "@/theme/tokens";

void SplashScreen.preventAutoHideAsync();

function Navigation() {
  const { palette, isDark } = useAppTheme();
  const reducedMotion = useReducedMotion();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
          animation: navigationAnimation(reducedMotion),
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Atkinson_400Regular: AtkinsonHyperlegibleNext_400Regular,
    Atkinson_700Bold: AtkinsonHyperlegibleNext_700Bold,
    IBMPlexMono_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <LanguageProvider>
      <ScanSessionProvider>
        <Navigation />
      </ScanSessionProvider>
    </LanguageProvider>
  );
}
