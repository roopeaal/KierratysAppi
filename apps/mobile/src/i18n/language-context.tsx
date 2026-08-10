import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language } from "@kierratysappi/domain";
import { translate, type MessageKey } from "@kierratysappi/localization";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LANGUAGE_KEY = "@kierratysappi/language/v1";

type LanguageContextValue = {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
  readonly t: (key: MessageKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>("fi");

  useEffect(() => {
    void AsyncStorage.getItem(LANGUAGE_KEY).then((saved) => {
      if (saved === "fi" || saved === "en") setLanguageState(saved);
    });
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    void AsyncStorage.setItem(LANGUAGE_KEY, next);
  }, []);
  const t = useCallback((key: MessageKey) => translate(language, key), [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
