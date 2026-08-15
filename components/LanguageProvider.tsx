'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '@/lib/i18n/en';
import { bn } from '@/lib/i18n/bn';

type Language = 'bn' | 'en';
type TranslationKeys = keyof typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  setLanguage: () => {},
  t: (key) => bn[key] || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('bn');

  useEffect(() => {
    const saved = localStorage.getItem('rkm_app_lang') as Language;
    if (saved && (saved === 'bn' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('rkm_app_lang', lang);
  };

  const t = (key: TranslationKeys): string => {
    const dict = language === 'en' ? en : bn;
    return dict[key] || en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
