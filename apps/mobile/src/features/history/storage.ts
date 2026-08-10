import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_ENABLED_KEY = "@kierratysappi/history-enabled/v1";
const HISTORY_KEY = "@kierratysappi/history/v1";
const PENDING_KEY = "@kierratysappi/pending-lookups/v1";
const FEEDBACK_KEY = "@kierratysappi/feedback-drafts/v1";

export type HistoryEntry = {
  readonly gtin: string;
  readonly productName: string | undefined;
  readonly resultStatus: "resolved" | "packaging_missing" | "not_found";
  readonly scannedAt: string;
};

export type FeedbackDraft = {
  readonly gtin: string | undefined;
  readonly category: string;
  readonly note: string;
  readonly createdAt: string;
};

export async function isHistoryEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(HISTORY_ENABLED_KEY)) === "true";
}

export async function setHistoryEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(HISTORY_ENABLED_KEY, String(enabled));
  if (!enabled) await clearHistory();
}

export async function readHistory(): Promise<HistoryEntry[]> {
  return readBoundedArray<HistoryEntry>(HISTORY_KEY, 20);
}

export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  if (!(await isHistoryEnabled())) return;
  const current = await readHistory();
  const next = [entry, ...current.filter((item) => item.gtin !== entry.gtin)].slice(0, 20);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}

export async function queuePendingLookup(gtin: string): Promise<void> {
  const current = await readBoundedArray<string>(PENDING_KEY, 10);
  await AsyncStorage.setItem(
    PENDING_KEY,
    JSON.stringify([gtin, ...current.filter((item) => item !== gtin)].slice(0, 10)),
  );
}

export async function saveFeedbackDraft(draft: FeedbackDraft): Promise<void> {
  const current = await readBoundedArray<FeedbackDraft>(FEEDBACK_KEY, 20);
  await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify([draft, ...current].slice(0, 20)));
}

async function readBoundedArray<T>(key: string, maximum: number): Promise<T[]> {
  try {
    const stored = await AsyncStorage.getItem(key);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed.slice(0, maximum) as T[]) : [];
  } catch {
    await AsyncStorage.removeItem(key);
    return [];
  }
}
