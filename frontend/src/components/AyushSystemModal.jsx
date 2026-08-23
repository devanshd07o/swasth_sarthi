import React, { useEffect } from 'react';
import { X, ExternalLink, Sparkles, BookOpen, ShieldCheck, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AYUSH_DETAILS = {
  A: {
    key: 'A',
    title: 'Ayurveda',
    titleHi: 'आयुर्वेद',
    tagline: 'The Science of Life & Tridosha Harmony',
    taglineHi: 'जीवन का विज्ञान एवं त्रिदोष संतुलन',
    description: 'Ayurveda is one of the world’s oldest holistic healing systems, developed in India over 3,000 years ago. It is based on the belief that health and wellness depend on a delicate balance between the mind, body, and spirit. Primary diagnostics revolve around Ashtavidha Pariksha (Nadi, Jihva, Prakriti examination) and personalized herbal formulations.',
    descriptionHi: 'आयुर्वेद विश्व की प्राचीनतम चिकित्सा पद्धतियों में से एक है। यह त्रिदोष (वात, पित्त, कफ) संतुलन, अष्टविध परीक्षा (नाड़ी, जिह्वा, प्रकृति) एवं वानस्पतिक औषधियों के माध्यम से शरीर, मन और आत्मा के समग्र स्वास्थ्य का संचालन करता है।',
    principles: [
      'Tridosha Analysis (Vata, Pitta, Kapha)',
      'Ashtavidha Pariksha Clinical Diagnostics',
      'Panchakarma Detoxification & Rejuvenation',
      'Classical Herbal & Mineral Formulations'
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Ayurveda',
    govUrl: 'https://ayush.gov.in/',
    govPortalName: 'Ministry of Ayush National Portal',
    accentColor: 'emerald'
  },
  Y: {
    key: 'Y',
    title: 'Yoga & Naturopathy',
    titleHi: 'योग एवं प्राकृतिक चिकित्सा',
    tagline: 'Drugless Healing & Mind-Body Integration',
    taglineHi: 'औषधिरहित प्राकृतिक चिकित्सा व योग साधना',
    description: 'Yoga and Naturopathy advocate drugless, non-invasive therapeutic practices emphasizing natural remedies, physical postures (Asanas), breath modulation (Pranayama), and Panchakosha purification to activate the body’s innate self-healing mechanisms.',
    descriptionHi: 'योग व प्राकृतिक चिकित्सा प्रणाली बिना औषधियों के प्राकृतिक तत्वों (जल, वायु, मिट्टी, सूर्य) एवं योगासन, प्राणायाम व ध्यान के माध्यम से शरीर की स्व-रोग निवारण क्षमता को जागृत करती है।',
    principles: [
      'Asana, Pranayama & Dhyana Practices',
      'Panchamahabhuta (5 Elements) Naturopathy',
      'Panchakosha Holistic Wellness',
      'Lifestyle & Preventive Healthcare'
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Naturopathy',
    govUrl: 'https://www.yogamdniy.nic.in/',
    govPortalName: 'Morarji Desai National Institute of Yoga',
    accentColor: 'teal'
  },
  U: {
    key: 'U',
    title: 'Unani Medicine',
    titleHi: 'यूनानी चिकित्सा',
    tagline: 'Greco-Arabic Humoral Balance & Mizaj',
    taglineHi: 'मिज़ाज मूल्यांकन व अख़लात संतुलन चिकित्सा',
    description: 'Unani Medicine originated in ancient Greece and flourished in the Islamic world. It operates on the Humoral Theory (Akhlat: Dam, Balgham, Safra, Sauda) and Mizaj (Temperament) assessment, utilizing natural botanical, animal, and mineral substances.',
    descriptionHi: 'यूनानी चिकित्सा प्रणाली ग्रीको-अरब परंपरा पर आधारित है। यह चार अख़लात (दम, बलग़म, सफ़रा, सौदा) एवं रोगी के मिज़ाज (Mizaj) का परीक्षण कर प्राकृतिक घटकों से रोगों का निवारण करती है।',
    principles: [
      'Akhlat Humoral Theory (4 Body Fluids)',
      'Mizaj (Individual Temperament) Assessment',
      'Nabz (Pulse) & Baul (Urine) Diagnostics',
      'Ilaj-bit-Tadbeer (Regimenal Therapy)'
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Unani_medicine',
    govUrl: 'https://ccrum.res.in/',
    govPortalName: 'CCRUM Unani Research Council',
    accentColor: 'emerald'
  },
  S: {
    key: 'S',
    title: 'Siddha Medicine',
    titleHi: 'सिद्ध चिकित्सा',
    tagline: 'Ancient Tamil Alchemy & 18 Siddhar Wisdom',
    taglineHi: '१८ सिद्धों द्वारा प्रतिपादित प्राचीन सिद्ध रसायन चिकित्सा',
    description: 'Siddha Medicine is an ancient Dravidian healing system founded by 18 revered Siddhars. It diagnoses diseases via Mukkuttram (Vatham, Pitham, Kapham) and Ennvagai Thervu (8-fold examination), employing herbal, mineral, and metallic alchemy (Bhasmas).',
    descriptionHi: 'सिद्ध चिकित्सा प्रणाली का उद्गम तमिल क्षेत्र में १८ सिद्ध आचार्यों द्वारा हुआ। यह मुक्कुटम संतुलन व ८-प्रकार के निदान (Envagai Thervu) द्वारा खनिज, भस्म व जड़ी-बूटियों से चिकित्सा करती है।',
    principles: [
      'Mukkuttram 3-Humoral Balance',
      'Ennvagai Thervu (8-Fold Examination)',
      'Siddha Mineral & Metallic Bhasma Alchemy',
      'Kayakalpa Rejuvenation Therapy'
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Siddha_medicine',
    govUrl: 'https://nischennai.tn.gov.in/',
    govPortalName: 'NIS National Siddha Institute',
    accentColor: 'amber'
  },
  H: {
    key: 'H',
    title: 'Homeopathy',
    titleHi: 'होम्योपैथी',
    tagline: 'Similia Similibus Curentur • Micro-Dilution Healing',
    taglineHi: 'समः समं शमयति • सूक्ष्मातिसूक्ष्म प्राकृतिक औषधि',
    description: 'Homeopathy was founded in Germany by Dr. Samuel Hahnemann in the late 18th century. It is based on the principle of "Like Cures Like" (Similia Similibus Curentur), administering highly diluted substances to trigger the body’s self-regulatory immune response.',
    descriptionHi: 'होम्योपैथी चिकित्सा पद्धति के जनक डॉ. सैमुअल हैनिमैन हैं। यह "समः समं शमयति" (लाइक क्योर्स लाइक) के सिद्धांत पर कार्य करती है, जिसमें अति-सूक्ष्म प्राकृतिक दवाओं से शरीर के प्रतिरोध को सक्रिय किया जाता है।',
    principles: [
      'Law of Similars (Similia Similibus Curentur)',
      'Single Remedy & Individualization',
      'Potentization & Potentized Remedies',
      'Vital Force Stimulation'
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Homeopathy',
    govUrl: 'https://ccrhindia.nic.in/',
    govPortalName: 'CCRH Homoeopathy Council',
    accentColor: 'blue'
  }
};

export default function AyushSystemModal({ systemKey, onClose, lang = 'en' }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || lang;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!systemKey || !AYUSH_DETAILS[systemKey]) return null;

  const data = AYUSH_DETAILS[systemKey];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-fadeIn cursor-pointer"
      onClick={onClose}
    >
      
      {/* Modal Container */}
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[90vh] text-left font-body animate-scaleUp cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#12372A] to-[#0B2B20] text-white p-6 sm:p-7 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
          
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-display font-black text-2xl text-amber-300 shadow-md">
                {data.key}
              </div>
              <div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-300 block">
                  {t('ayushModal.officialTag', 'Ministry of Ayush • Official System')}
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-0.5">
                  {currentLang === 'hi' ? data.titleHi : data.title}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer border border-white/10"
              title="Close Modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-3 relative z-10">
            {currentLang === 'hi' ? data.taglineHi : data.tagline}
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-800">
          
          {/* Description Block */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>{t('ayushModal.overviewTitle', 'System Overview & Definition')}</span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {currentLang === 'hi' ? data.descriptionHi : data.description}
            </p>
          </div>

          {/* Key Principles */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t('ayushModal.principlesTitle', 'Core Diagnostic & Clinical Principles')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {data.principles.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-slate-200 text-xs font-medium text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Official External Links & Knowledge Reference */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
              <span>{t('ayushModal.linksTitle', 'Official Knowledge & Reference Links')}</span>
              <Globe className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Wikipedia Link */}
              <a
                href={data.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-white border border-slate-300 hover:border-emerald-600 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-serif font-bold text-sm group-hover:bg-emerald-100 group-hover:text-emerald-900 transition-colors">
                    W
                  </div>
                  <div>
                    <span className="font-display font-bold text-xs text-slate-900 block group-hover:text-emerald-900">
                      Wikipedia Reference
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Official Wikipedia Page</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
              </a>

              {/* Ministry of Ayush Official Link */}
              <a
                href={data.govUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-white border border-slate-300 hover:border-amber-600 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-800 font-display font-bold text-xs group-hover:bg-amber-100 transition-colors">
                    GOI
                  </div>
                  <div>
                    <span className="font-display font-bold text-xs text-slate-900 block group-hover:text-amber-900 truncate max-w-[140px]">
                      {data.govPortalName || 'Ministry of Ayush'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Verified Govt Portal</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono shrink-0">
          <span>SwasthSaarthi Ayush Knowledge Vault</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold rounded-xl transition-all cursor-pointer"
          >
            {t('common.close', 'Close Overview')}
          </button>
        </div>

      </div>
    </div>
  );
}
