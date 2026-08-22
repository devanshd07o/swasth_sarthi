import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import VoiceAIOrb from '../components/VoiceAIOrb';

export default function PublicLanding({ onOpenAuth, lang = 'en' }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 md:py-4 flex flex-col items-center justify-center space-y-3">
      
      {/* COMPACT HERO SECTION (NO PILL) */}
      <section className="w-full text-center space-y-2.5">
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
          {lang === 'hi' ? (
            <>
              आयुर्वेद केस शीट एवं <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                एआई-संचालित आपातकालीन स्वास्थ्य प्लेटफ़ॉर्म
              </span>
            </>
          ) : (
            <>
              Digital Patient Case-Taking & <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                AI Emergency Health Platform
              </span>
            </>
          )}
        </h1>

        {/* SINGLE CLEAN CENTERED LOGIN BUTTON */}
        <div className="flex items-center justify-center pt-0.5">
          <button
            onClick={onOpenAuth}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs md:text-sm rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'लॉगिन करें (Login)' : 'Login / Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* VOICE-FIRST CENTRAL AI SPHERE (FITS SCREEN WITHOUT SCROLL) */}
      <section className="w-full max-w-2xl mx-auto">
        <VoiceAIOrb lang={lang} />
      </section>

    </div>
  );
}
