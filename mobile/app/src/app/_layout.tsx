import {
  AtkinsonHyperlegibleNext_400Regular,
  AtkinsonHyperlegibleNext_600SemiBold,
  AtkinsonHyperlegibleNext_700Bold,
} from "@expo-google-fonts/atkinson-hyperlegible-next";
import { IBMPlexMono_600SemiBold } from "@expo-google-fonts/ibm-plex-mono";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { navigationAnimation } from "@/features/accessibility/motion";
import { BottomNavigation } from "@/components/bottom-navigation";
import { NearbySearchProvider } from "@/features/nearby/search-context";
import { ScanSessionProvider } from "@/features/scan/session-context";
import { LanguageProvider } from "@/i18n/language-context";
import { AppThemeProvider, useAppTheme } from "@/theme/tokens";

void SplashScreen.preventAutoHideAsync();

function Navigation() {
  const { palette, isDark } = useAppTheme();
  const reducedMotion = useReducedMotion();
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.bgCanvas },
          animation: navigationAnimation(reducedMotion),
        }}
      />
      <BottomNavigation />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Atkinson_400Regular: AtkinsonHyperlegibleNext_400Regular,
    Atkinson_600SemiBold: AtkinsonHyperlegibleNext_600SemiBold,
    Atkinson_700Bold: AtkinsonHyperlegibleNext_700Bold,
    IBMPlexMono_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <AppThemeProvider>
      <LanguageProvider>
        <ScanSessionProvider>
          <NearbySearchProvider>
            <Navigation />
          </NearbySearchProvider>
        </ScanSessionProvider>
      </LanguageProvider>
    </AppThemeProvider>
  );
}
