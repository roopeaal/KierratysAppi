import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText, BrandLockup, Button, Eyebrow, InlineLink, Paper, Screen } from "@/components/ui";
import { announceAccessibility } from "@/features/accessibility/announcements";
import { saveFeedbackDraft } from "@/features/history/storage";
import { useLanguage } from "@/i18n/language-context";
import { radius, spacing, useAppTheme } from "@/theme/tokens";

const CATEGORIES = [
  ["wrong_product", "feedbackWrongProduct"],
  ["wrong_packaging", "feedbackWrongPackaging"],
  ["wrong_sorting", "feedbackWrongSorting"],
  ["missing_data", "feedbackMissing"],
] as const;

export default function FeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ gtin?: string; category?: string }>();
  const { palette } = useAppTheme();
  const { t } = useLanguage();
  const initialCategory = CATEGORIES.some(([value]) => value === params.category)
    ? params.category
    : undefined;
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!category) return;
    await saveFeedbackDraft({
      gtin: params.gtin,
      category,
      note: note.trim().slice(0, 2_000),
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
    announceAccessibility(t("draftSaved"));
  };

  return (
    <Screen>
      <View style={styles.header}>
        <BrandLockup compact />
        <InlineLink label={t("close")} onPress={() => router.back()} />
      </View>
      <View style={styles.intro}>
        <Eyebrow>{t("feedbackEyebrow")}</Eyebrow>
        <AppText variant="title" accessibilityRole="header">
          {t("feedbackTitle")}
        </AppText>
        <AppText muted>{t("feedbackBody")}</AppText>
      </View>
      <View style={styles.categories} accessibilityRole="radiogroup">
        {CATEGORIES.map(([value, key]) => {
          const selected = category === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => {
                setCategory(value);
                setSaved(false);
              }}
              style={({ pressed }) => [
                styles.category,
                {
                  backgroundColor: selected ? palette.cobaltSoft : palette.surface,
                  borderColor: selected ? palette.cobalt : palette.line,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <AppText variant="label" style={{ color: selected ? palette.cobalt : palette.ink }}>
                {t(key)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <AppText variant="label" nativeID="feedback-note">
        {t("feedbackNote")}
      </AppText>
      <AppText variant="small" muted>
        {t("feedbackPrivacyCaution")}
      </AppText>
      <TextInput
        accessibilityLabel={t("feedbackNote")}
        accessibilityLabelledBy="feedback-note"
        multiline
        maxLength={2_000}
        onChangeText={(value) => {
          setNote(value);
          setSaved(false);
        }}
        style={[
          styles.input,
          { backgroundColor: palette.surfaceRaised, borderColor: palette.line, color: palette.ink },
        ]}
        textAlignVertical="top"
        value={note}
      />
      <Button label={t("saveDraft")} onPress={() => void save()} disabled={!category} />
      {saved && (
        <Paper style={{ backgroundColor: palette.pineSoft }}>
          <AppText variant="heading" style={{ color: palette.pine }} accessibilityRole="alert">
            {t("draftSaved")}
          </AppText>
          <AppText>{t("localOnly")}</AppText>
        </Paper>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  intro: { paddingTop: spacing.xxl, paddingBottom: spacing.lg, gap: spacing.sm },
  categories: { gap: spacing.xs },
  category: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  input: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontFamily: "Atkinson_400Regular",
    fontSize: 17,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
});
