import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/config';

export default function NativeLanguageSelector({ lang, setLang, direction = 'down', compact = false }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangCode = i18n.language || lang || 'en';
  const currentLangObj = LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];

  const handleSelect = (code) => {
    setLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem('swasth_lang', code);
    setIsOpen(false);
  };

  const popoverClasses = compact
    ? "fixed left-[72px] bottom-4 w-60 sm:w-64 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-[999] animate-in fade-in zoom-in-95 duration-150"
    : direction === 'up'
    ? "absolute bottom-full mb-2.5 left-0 w-60 sm:w-64 max-h-72 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-[100] animate-in fade-in zoom-in-95 duration-150"
    : "absolute right-0 mt-1.5 w-56 sm:w-64 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-[100] animate-in fade-in zoom-in-95 duration-150";

  return (
    <div className="relative inline-block text-left z-50 w-full">
      {compact ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-2xl flex flex-col items-center justify-center text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all cursor-pointer shadow-xs"
          title={`Language: ${currentLangObj.native} (Click to change)`}
        >
          <Globe className="w-4 h-4 text-emerald-700" />
          <span className="text-[8px] font-mono font-extrabold uppercase text-emerald-900 leading-none mt-0.5">
            {currentLangCode.toUpperCase()}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200/80 shadow-xs font-display text-xs font-bold transition-all cursor-pointer select-none"
          title="Select Indian Language"
        >
          <div className="flex items-center gap-2 truncate">
            <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-extrabold text-emerald-950 truncate">
              {currentLangObj.native} ({currentLangObj.name})
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-emerald-800 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className={popoverClasses}>
            <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
              <span className="text-[11px] font-mono font-extrabold text-emerald-900 uppercase tracking-wider">
                NATIVE INDIAN LANGUAGES
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full">
                i18n
              </span>
            </div>

            <div className="grid grid-cols-1 divide-y divide-slate-50">
              {LANGUAGES.map((l) => {
                const isSelected = currentLangCode === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleSelect(l.code)}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-extrabold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{l.flag}</span>
                      <span className="font-bold text-slate-900 text-sm min-w-[70px]">
                        {l.native}
                      </span>
                      <span className="text-slate-400 text-[11px]">({l.name})</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
