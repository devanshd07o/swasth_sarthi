import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, UserCheck, Lock, CheckCircle2, Stethoscope, Building2, HeartPulse, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AyushSystemModal from '../components/AyushSystemModal';

export default function PublicLanding({ onOpenAuth, lang = 'en' }) {
  const { t } = useTranslation();
  const [hoveredSystem, setHoveredSystem] = React.useState(null);
  const [selectedSystemKey, setSelectedSystemKey] = React.useState(null);
  const [ecgSpikeCount, setEcgSpikeCount] = React.useState(2);
  const [activeArtIndex, setActiveArtIndex] = React.useState(0);

  const heroSlides = [
    '/hero_slides/slide1.png',
    '/hero_slides/slide2.png',
    '/hero_slides/slide3.png',
    '/hero_slides/slide4.png',
  ];
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setEcgSpikeCount((prev) => {
        const options = [1, 2, 3, 4].filter((c) => c !== prev);
        return options[Math.floor(Math.random() * options.length)];
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const artTimer = setInterval(() => {
      setActiveArtIndex((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(artTimer);
  }, []);

  const getEcgPath = (count) => {
    switch (count) {
      case 1:
        return "M0 12 H450 L458 2 L466 22 L472 0 L478 18 L484 12 H1000";
      case 3:
        return "M0 12 H380 L388 2 L396 22 L402 0 L408 18 L414 12 H460 L468 2 L476 22 L482 0 L488 18 L494 12 H540 L548 2 L556 22 L562 0 L568 18 L574 12 H1000";
      case 4:
        return "M0 12 H340 L348 2 L356 22 L362 0 L368 18 L374 12 H420 L428 2 L436 22 L442 0 L448 18 L454 12 H500 L508 2 L516 22 L522 0 L528 18 L534 12 H580 L588 2 L596 22 L602 0 L608 18 L614 12 H1000";
      case 2:
      default:
        return "M0 12 H420 L428 2 L436 22 L442 0 L448 18 L454 12 H500 L508 2 L516 22 L522 0 L528 18 L534 12 H1000";
    }
  };

  const ayushSystems = [
    { key: 'A', name: 'yurveda (आयुर्वेद)' },
    { key: 'Y', name: 'oga & Naturopathy (योग)' },
    { key: 'U', name: 'nani (यूनानी)' },
    { key: 'S', name: 'iddha (सिद्ध)' },
    { key: 'H', name: 'omeopathy (होम्योपैथी)' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-65px)] flex flex-col justify-between bg-gradient-to-b from-white via-[#EBF3EF] via-65% to-[#C1DCD0] text-slate-900 selection:bg-emerald-100 selection:text-[#12372A] text-left relative overflow-hidden">
      
      {/* Background Rotating Ayurveda Artwork Slideshow Container */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        
        {/* Artwork 0: Sacred Dhanvantari Amrita Kalash & Medicinal Herb */}
        <div className={`absolute w-[360px] sm:w-[440px] h-[360px] sm:h-[440px] transition-opacity duration-1000 ease-in-out ${activeArtIndex === 0 ? 'opacity-[0.065]' : 'opacity-0'}`}>
          <svg className="w-full h-full text-[#12372A]" viewBox="0 0 400 400" fill="none">
            <path stroke="currentColor" strokeWidth="5" fill="none" d="M160 140 H240 M170 140 L160 200 C140 230 140 310 200 310 C260 310 260 230 240 200 L230 140 Z" />
            <circle cx="200" cy="120" r="16" stroke="currentColor" strokeWidth="4" />
            <path stroke="currentColor" strokeWidth="4" fill="none" d="M200 104 C170 80 150 100 170 120 C190 140 200 104 200 104 Z M200 104 C230 80 250 100 230 120 C210 140 200 104 200 104 Z" />
          </svg>
        </div>

        {/* Artwork 1: Ashtavidha Pariksha 8-Petal Diagnostic Mandala */}
        <div className={`absolute w-[360px] sm:w-[440px] h-[360px] sm:h-[440px] transition-opacity duration-1000 ease-in-out ${activeArtIndex === 1 ? 'opacity-[0.065]' : 'opacity-0'}`}>
          <svg className="w-full h-full text-[#12372A]" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="4" strokeDasharray="8 6" />
            <circle cx="200" cy="200" r="110" stroke="currentColor" strokeWidth="3" />
            <path stroke="currentColor" strokeWidth="4" fill="none" d="M200 50 C230 90 230 150 200 150 C170 150 170 90 200 50 Z M200 350 C230 310 230 250 200 250 C170 250 170 310 200 350 Z M50 200 C90 170 150 170 150 200 C150 230 90 230 50 200 Z M350 200 C310 170 250 170 250 200 C250 230 310 230 350 200 Z" />
            <circle cx="200" cy="200" r="30" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>

        {/* Artwork 2: Tridosha (Vata-Pitta-Kapha) Triad Harmony Yantra */}
        <div className={`absolute w-[360px] sm:w-[440px] h-[360px] sm:h-[440px] transition-opacity duration-1000 ease-in-out ${activeArtIndex === 2 ? 'opacity-[0.065]' : 'opacity-0'}`}>
          <svg className="w-full h-full text-[#12372A]" viewBox="0 0 400 400" fill="none">
            <path stroke="currentColor" strokeWidth="5" fill="none" d="M200 60 L320 280 H80 Z" />
            <path stroke="currentColor" strokeWidth="5" fill="none" d="M200 340 L320 120 H80 Z" />
            <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="4" />
            <path stroke="currentColor" strokeWidth="3" d="M200 160 C180 180 180 220 200 240 M200 160 C220 180 220 220 200 240" />
          </svg>
        </div>

        {/* Artwork 3: Traditional Kharal Mortar & Pestle with Herb Sprig */}
        <div className={`absolute w-[360px] sm:w-[440px] h-[360px] sm:h-[440px] transition-opacity duration-1000 ease-in-out ${activeArtIndex === 3 ? 'opacity-[0.065]' : 'opacity-0'}`}>
          <svg className="w-full h-full text-[#12372A]" viewBox="0 0 400 400" fill="none">
            <path stroke="currentColor" strokeWidth="6" fill="none" d="M100 200 C100 290 300 290 300 200 H100 Z" />
            <path stroke="currentColor" strokeWidth="6" strokeLinecap="round" d="M240 100 L170 240" />
            <path stroke="currentColor" strokeWidth="4" fill="none" d="M160 140 C120 120 120 170 160 180 C180 190 200 160 160 140 Z" />
          </svg>
        </div>

      </div>

      <style>{`
        @keyframes newsTickerScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes ecgPulseLoop {
          0% { 
            stroke-dashoffset: 1600; 
            opacity: 0.4;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            stroke-dashoffset: 0; 
            opacity: 0.4;
          }
        }
        .animate-news-ticker {
          display: flex;
          align-items: center;
          width: max-content;
          animation: newsTickerScroll 30s linear infinite;
        }
        .animate-news-ticker:hover, 
        .animate-news-ticker:active, 
        .animate-news-ticker:focus-within {
          animation-play-state: paused;
        }
        .animate-ecg-path {
          stroke-dasharray: 1600;
          stroke-dashoffset: 1600;
          animation: ecgPulseLoop 3.5s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ─── 1. SLEEK FLOATING ROUNDED AYUSH PILL BAR ───────────────────────── */}
      <div className="w-full pt-3 relative z-10">
        <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-full py-1.5 flex items-center justify-between text-xs font-display shadow-xs overflow-hidden mx-2 sm:mx-3">
          
          {/* News Channel Headline Continuous Infinite Marquee Ticker */}
          <div className="overflow-x-hidden no-scrollbar w-full relative z-10 touch-pan-x">
            <div className="animate-news-ticker gap-3 text-[12px] font-semibold text-slate-700 py-0.5">
              {[1, 2].map((loopIdx) => (
                <React.Fragment key={loopIdx}>
                  <span className="font-display font-extrabold tracking-wide text-[11px] sm:text-xs uppercase px-2.5 py-0.5 bg-emerald-100/60 rounded-full border border-emerald-300/60 text-emerald-950 inline-flex items-center shrink-0">
                    {t('landing.portalTitle')}
                  </span>
                  
                  {ayushSystems.map((sys, idx) => {
                    const uniqueKey = `${sys.key}-${loopIdx}-${idx}`;
                    const isHovered = hoveredSystem === uniqueKey;
                    return (
                      <React.Fragment key={uniqueKey}>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setSelectedSystemKey(sys.key)}
                          onMouseEnter={() => setHoveredSystem(uniqueKey)}
                          onMouseLeave={() => setHoveredSystem(null)}
                          className={`px-1.5 py-0.5 cursor-pointer transition-all duration-200 ease-out transform inline-flex items-center select-none bg-transparent whitespace-nowrap ${
                            isHovered
                              ? 'scale-110 -translate-y-1 text-slate-950 font-extrabold drop-shadow-[0_4px_10px_rgba(18,55,42,0.35)]'
                              : 'text-slate-700 opacity-90'
                          }`}
                          title={`Click to view ${sys.name} overview`}
                        >
                          <span className="text-emerald-800 font-extrabold">{sys.key}</span>
                          <span>{sys.name}</span>
                        </button>
                      </React.Fragment>
                    );
                  })}
                  <span className="text-slate-300 mr-3">•</span>
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ─── CONTINUOUS LIVE ECG HEARTBEAT PULSE LINE DIVIDER (NO TEXT, CENTERED PULSE) ─── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-2 pb-0.5 relative z-10 overflow-hidden">
        <div className="w-full h-4 relative flex items-center">
          <svg className="w-full h-4 text-emerald-800/80" viewBox="0 0 1000 24" fill="none" preserveAspectRatio="none">
            <path 
              key={ecgSpikeCount}
              className="animate-ecg-path"
              d={getEcgPath(ecgSpikeCount)} 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>
      </div>

      {/* ─── 2. HERO SECTION (MAXIMIZED STAGE SPACE UTILIZATION) ───────────────── */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-10 pt-1 sm:pt-2 pb-2 sm:pb-4 flex-1 flex flex-col justify-center relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
          
          {/* Left 7/8 Cols: Seamless Maximized Feature Graphic Carousel */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">
            
            {/* Edge-to-Edge High-Resolution Feature Image Carousel (Zero Clipping) */}
            <div className="relative w-full overflow-hidden group">
              <div className="relative h-[320px] sm:h-[420px] md:h-[480px] lg:h-[500px] w-full overflow-hidden bg-transparent flex items-center justify-center p-2">
                {heroSlides.map((slide, idx) => (
                  <img
                    key={slide}
                    src={slide}
                    alt={`SwasthSaarthi Feature Graphic ${idx + 1}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchpriority={idx === 0 ? 'high' : 'low'}
                    className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out transform ${
                      idx === currentSlide ? 'opacity-100 scale-100 sm:scale-105 z-10' : 'opacity-0 scale-95 z-0'
                    }`}
                  />
                ))}
              </div>
              
              {/* Floating Slide Indicator Dots */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-xl">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentSlide ? 'bg-amber-400 w-6' : 'bg-white/60 hover:bg-white w-2'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Right 5/4 Cols: Shifted Compact Highlighted Login System Cards */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 sm:gap-4 justify-center">
            
            {/* Card 1: Patient Entrance */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-emerald-700/30 shadow-lg shadow-emerald-950/10 hover:border-emerald-600 hover:shadow-emerald-950/20 transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full pointer-events-none -z-0" />
              
              <div className="space-y-2 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-[#12372A] text-white flex items-center justify-center font-bold shadow-md">
                  <UserCheck className="w-4.5 h-4.5 text-emerald-300" />
                </div>
                <div>
                  <span className="font-mono text-[9px] sm:text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block">
                    {t('landing.citizenVaultTitle')}
                  </span>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 mt-0.5">
                    {t('landing.patientPortalTitle')}
                  </h3>
                </div>
                <p className="font-body text-xs text-slate-600 leading-snug">
                  {t('landing.patientPortalDesc')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenAuth('patient')}
                className="w-full py-2.5 px-3.5 bg-[#12372A] hover:bg-[#0B2B20] text-white font-display font-extrabold text-xs rounded-xl shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:scale-[1.01] relative z-10"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{t('landing.patientLoginBtn')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>

            {/* Card 2: Vaidya Console Entrance */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-emerald-800/40 shadow-lg shadow-emerald-950/10 hover:border-emerald-700 hover:shadow-emerald-950/20 transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100/50 rounded-bl-full pointer-events-none -z-0" />
              
              <div className="space-y-2 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-[#0D4735] text-white flex items-center justify-center font-bold shadow-md">
                  <Stethoscope className="w-4.5 h-4.5 text-emerald-300" />
                </div>
                <div>
                  <span className="font-mono text-[9px] sm:text-[10px] font-extrabold text-emerald-900 uppercase tracking-widest block">
                    {t('landing.clinicalPracticeTitle')}
                  </span>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 mt-0.5">
                    {t('landing.vaidyaConsoleTitle')}
                  </h3>
                </div>
                <p className="font-body text-xs text-slate-600 leading-snug">
                  {t('landing.vaidyaConsoleDesc')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenAuth('doctor_hospital')}
                className="w-full py-2.5 px-3.5 bg-[#0D4735] hover:bg-[#073024] text-white font-display font-extrabold text-xs rounded-xl shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:scale-[1.01] relative z-10"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{t('landing.vaidyaLoginBtn')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ─── 3. SUBTLE BLENDED FOOTER ───────────────────────────────────────── */}
      <footer className="w-full bg-transparent text-slate-600 py-6 px-4 sm:px-6 lg:px-8 relative z-10 font-body">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <img src="/swasthsaarthi_logo.png" alt="SwasthSaarthi" className="h-5 sm:h-6 w-auto object-contain opacity-85" />
            <span className="hidden sm:inline text-slate-400/80">•</span>
            <span className="text-[11px] sm:text-xs text-slate-600 font-medium">Ministry of Ayush Government of India (SIH26047)</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-slate-600 text-[11px] font-mono">
            <span>DPDP Act Compliant</span>
            <span className="text-slate-400/80">•</span>
            <span>ABDM Sync Ready</span>
          </div>
        </div>
      </footer>

      {/* AYUSH System Overlay Detail Modal */}
      <AyushSystemModal 
        systemKey={selectedSystemKey} 
        onClose={() => setSelectedSystemKey(null)} 
        lang={lang} 
      />

    </div>
  );
}
