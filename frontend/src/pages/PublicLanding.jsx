import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, HeartPulse, Activity, Mic, Lock, Sparkles, Stethoscope, ChevronRight } from 'lucide-react';
import NadiLine from '../components/NadiLine';
import VoiceAIOrb from '../components/VoiceAIOrb';

export default function PublicLanding({ onOpenAuth, lang = 'en' }) {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12 space-y-12">
      
      {/* ─── HERO SECTION (LEFT-ALIGNED ASYMMETRIC) ────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 md:pt-6">
        
        {/* Left 7 Cols: Typography, Plain Description, Differentiated CTA */}
        <div className="lg:col-span-8 space-y-6 text-left stagger-fade-in">
          
          {/* Subtle Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-bg-deep/70 shadow-paper-sm">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="font-mono text-xs text-ink-soft uppercase tracking-wider">
              {lang === 'hi' ? 'आयुष डिजिटल केस-टेकिंग एवं ट्राइएज' : 'Ayush Digital Case-Taking & Triage'}
            </span>
          </div>

          {/* Main Display Headline (Fraunces Display + Italic Accent Line) */}
          <h1 className="font-display font-medium text-4xl sm:text-5xl lg:text-[54px] tracking-tight leading-[1.12] text-ink">
            {lang === 'hi' ? (
              <>
                आपके लक्षण, सुने जाते हैं <br />
                <span className="italic font-normal text-brand text-3xl sm:text-4xl lg:text-[46px]">
                  एक कुशल वैद्य की तरह।
                </span>
              </>
            ) : (
              <>
                Your symptoms, heard <br />
                <span className="italic font-normal text-brand text-3xl sm:text-4xl lg:text-[46px]">
                  the way a Vaidya listens.
                </span>
              </>
            )}
          </h1>

          {/* Plain Register Sub-copy */}
          <p className="font-body text-base md:text-lg text-ink-soft max-w-2xl leading-relaxed">
            {lang === 'hi'
              ? 'स्वास्थ्यसारथी आपकी बोली गई स्वास्थ्य समस्याओं (हिंदी या अंग्रेजी) को ओपीडी काउंटर तक पहुँचने से पहले ही एक संरचित आयुर्वेदिक केस शीट में परिवर्तित करता है।'
              : 'SwasthSaarthi turns a spoken complaint — in Hindi or English — into a structured Ayurvedic case sheet before you ever reach the OPD counter.'}
          </p>

          {/* Differentiated CTA Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
            
            {/* Primary Action: Voice Orb Trigger with Resting Pulse Rings */}
            <div className="flex items-center gap-3.5 group">
              <div className="relative flex items-center justify-center">
                {/* Concentric Animated Resting Pulse Rings */}
                <div className="absolute w-14 h-14 rounded-full border border-brand/40 pulse-ring-1 pointer-events-none" />
                <div className="absolute w-14 h-14 rounded-full border border-gold/30 pulse-ring-2 pointer-events-none" />
                
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="w-13 h-13 rounded-full bg-gradient-to-tr from-brand-deep to-brand text-[#FBF6EC] flex items-center justify-center shadow-paper hover:scale-105 transition-all duration-300 z-10 cursor-pointer border border-gold-soft/40"
                  title="Start Voice Consultation"
                  aria-label="Tap to speak with Voice AI"
                >
                  <Mic className="w-5 h-5 text-gold-soft" />
                </button>
              </div>

              <div className="text-left">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint block font-medium">
                  {lang === 'hi' ? 'आयुसारथी वॉइस एआई' : 'AyurSaarthi Voice AI'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="font-body font-semibold text-sm md:text-base text-ink hover:text-brand transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'hi' ? 'बोलकर बताएं' : 'Tap to speak'}</span>
                  <ChevronRight className="w-4 h-4 text-gold group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Thin Vertical Hairline Divider */}
            <div className="hidden sm:block w-px h-10 bg-hairline" />

            {/* Secondary Action: Outline Login Button */}
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 bg-transparent hover:bg-bg-deep text-ink font-body font-semibold text-xs md:text-sm rounded-control border-[1.5px] border-ink flex items-center gap-2 transition-all group shadow-paper-sm cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-ink-soft" />
              <span>{lang === 'hi' ? 'लॉगिन / साइन इन' : 'Login / Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-ink group-hover:translate-x-1 transition-transform" />
            </button>

          </div>

          {/* Signature Element: Animated Nadi Line Waveform */}
          <div className="pt-4 max-w-2xl">
            <NadiLine label="NADI PARIKSHA — READ IN REAL TIME" />
          </div>

          {/* Trust Strip */}
          <div className="pt-2 border-t border-hairline-soft flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs text-ink-soft">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand" />
              <span>ABDM · ABHA Integrated</span>
            </div>
            <span className="text-hairline hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>DPDP Act 2023 Compliant</span>
            </div>
            <span className="text-hairline hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-maroon" />
              <span className="text-maroon font-medium">Red-Flag Emergency Triage</span>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Clinical Feature Cards (Warm Parchment Aesthetic) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Ashtavidha Pariksha */}
          <div className="p-5 bg-bg-deep rounded-card border border-hairline shadow-paper-sm space-y-2 text-left hover:border-brand/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-medium uppercase text-gold tracking-wider">
                Classical Methodology
              </span>
              <span className="font-mono text-[11px] font-semibold text-brand px-2 py-0.5 bg-brand-tint rounded-control">
                8-Fold Matrix
              </span>
            </div>
            <h3 className="font-display font-semibold text-lg text-ink">
              Ashtavidha Pariksha
            </h3>
            <p className="text-xs text-ink-soft font-body leading-relaxed">
              Standardized pulse (Nadi), tongue (Jihva), urine (Mutra), and constitutional build assessments mapped to Ayurvedic classics.
            </p>
          </div>

          {/* Card 2: Real-Time Scribe */}
          <div className="p-5 bg-bg-deep rounded-card border border-hairline shadow-paper-sm space-y-2 text-left hover:border-brand/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-medium uppercase text-brand tracking-wider">
                Multilingual AI
              </span>
              <span className="font-mono text-[11px] font-semibold text-ink-soft px-2 py-0.5 bg-[#E8DEC2] rounded-control">
                Groq Whisper
              </span>
            </div>
            <h3 className="font-display font-semibold text-lg text-ink">
              Real-Time Clinical Scribe
            </h3>
            <p className="text-xs text-ink-soft font-body leading-relaxed">
              Captures colloquial regional narratives and transforms them into structured clinical entities before doctor examination.
            </p>
          </div>

          {/* Card 3: MedRoute Emergency Interceptor */}
          <div className="p-5 bg-maroon-tint/50 rounded-card border border-maroon/20 shadow-paper-sm space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-medium uppercase text-maroon tracking-wider">
                Emergency Interceptor
              </span>
              <span className="font-mono text-[11px] font-bold text-white px-2 py-0.5 bg-maroon rounded-control">
                Sub-Second
              </span>
            </div>
            <h3 className="font-display font-semibold text-lg text-maroon">
              MedRoute Red-Flag Triage
            </h3>
            <p className="text-xs text-ink-soft font-body leading-relaxed">
              Instantly intercepts suspected cardiac events, severe dyspnea, and acute trauma, auto-routing to nearest ICU facilities.
            </p>
          </div>

        </div>

      </section>

      {/* Floating Voice AI Orb Modal (When Triggered) */}
      {isVoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-bg rounded-modal border border-hairline shadow-paper-lg p-6 relative">
            <div className="flex items-center justify-between border-b border-hairline pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BrandLogo size={24} />
                <h4 className="font-display font-semibold text-base text-ink">
                  {lang === 'hi' ? 'आयुसारथी वॉइस परामर्श' : 'AyurSaarthi Voice Consultation'}
                </h4>
              </div>
              <button
                onClick={() => setIsVoiceOpen(false)}
                className="p-1.5 rounded-control text-ink-soft hover:bg-bg-deep hover:text-ink font-mono text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            
            <VoiceAIOrb lang={lang} />
          </div>
        </div>
      )}

    </div>
  );
}
