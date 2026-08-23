import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, TRANSLATIONS } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children, initialLang = 'en', onLangChange }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('swasth_lang');
    return saved || initialLang;
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('swasth_lang', newLang);
    if (onLangChange) onLangChange(newLang);
  };

  const t = (key) => {
    const langDict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return langDict[key] || TRANSLATIONS['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
