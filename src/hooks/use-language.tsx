import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type Language, getLanguage, setLanguage as persistLanguage, t as translate, type TranslationKeys } from '@/lib/i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getLanguage);

  const setLang = useCallback((newLang: Language) => {
    persistLanguage(newLang);
    setLangState(newLang);
  }, []);

  const t = useCallback((key: keyof TranslationKeys) => {
    return translate(key, lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
