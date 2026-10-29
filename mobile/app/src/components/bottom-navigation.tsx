import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  activeTab,
  navigationUsesTwoRows,
  primaryTabs,
  tabNavigation,
} from "@/features/navigation/routes";
import { useNearbySearch } from "@/features/nearby/search-context";
import { useLanguage } from "@/i18n/language-context";
import { interaction, useAppTheme } from "@/theme/tokens";
import { ActionIcon } from "./action-icon";
import { homeFont } from "./home-elements";
import { ReferenceSymbol } from "./reference-symbol";
import { AppText } from "./ui";

export function BottomNavigation() {
  const path = usePathname();
  const router = useRouter();
  const { requestSearch } = useNearbySearch();
  const { t } = useLanguage();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const [focused, setFocused] = useState<string | null>(null);
  const selected = activeTab(path);
  if (!selected) return null;
  const twoRows = navigationUsesTwoRows(width, fontScale);
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: palette.bgSurface,
          borderColor: palette.borderSubtle,
          paddingBottom: Math.max(8, insets.bottom),
        },
      ]}
      testID="bottom-navigation"
    >
      <View
        style={styles.tabs}
        accessibilityRole="tablist"
        accessibilityLabel={t("navigationLabel")}
      >
        {primaryTabs.map((tab) => (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityLabel={t(tab.label)}
            accessibilityHint={tab.id === "nearby" ? t("nearbyHomeBody") : undefined}
            accessibilityState={{ selected: selected === tab.id }}
            aria-selected={selected === tab.id}
            testID={`tab-${tab.id}`}
            onFocus={() => setFocused(tab.id)}
            onBlur={() => setFocused(null)}
            onPress={() => {
              const action = tabNavigation(path, tab.id);
              if (!action) return;
              if (action.requestLocation) requestSearch();
              router.dismissTo(action.path);
            }}
            style={({ pressed }) => [
              styles.tab,
              {
                flexBasis: twoRows ? "50%" : "25%",
                backgroundColor: selected === tab.id ? palette.pineSoft : "transparent",
                borderColor: focused === tab.id ? palette.actionLink : "transparent",
                opacity: pressed ? interaction.pressedOpacity : 1,
              },
            ]}
          >
            {tab.id === "home" && selected !== "home" ? (
              <ActionIcon kind="home" color={palette.textSecondary} />
            ) : (
              <ReferenceSymbol
                name={
                  tab.id === "home"
                    ? "home"
                    : tab.id === "identify"
                      ? "scan"
                      : tab.id === "nearby"
                        ? "pin"
                        : "settings"
                }
                size={30}
                color={
                  tab.id === "home"
                    ? undefined
                    : selected === tab.id
                      ? palette.actionLink
                      : palette.textSecondary
                }
              />
            )}
            <AppText
              variant="small"
              style={{
                textAlign: "center",
                color: selected === tab.id ? palette.actionLink : palette.textSecondary,
                fontFamily: homeFont,
                fontWeight: selected === tab.id ? "600" : "400",
                fontSize: 12,
                lineHeight: 17,
              }}
            >
              {t(tab.label)}
            </AppText>
            <View
              style={[
                styles.dot,
                { backgroundColor: selected === tab.id ? palette.actionLink : "transparent" },
              ]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 6,
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    maxWidth: 560,
    paddingHorizontal: 8,
  },
  tab: {
    minHeight: 68,
    borderWidth: 2,
    borderRadius: 26,
    paddingHorizontal: 3,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
