import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Sparkles, Volume2, VolumeX, Send, HeartPulse, MicOff, Square, MessageSquare, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import RobotAvatarAnimation from './RobotAvatarAnimation';
import SwasthSaarthiVideoLoader from './SwasthSaarthiVideoLoader';

const ELEVENLABS_VOICE_ID = 'cgSgspJ2msm6clMCkdW9'; // Jessica (Young/Teen Female Voice)
const VOICE_PLAYBACK_SPEED = 1.0; // Standard 1.0x voice narration speed

const THINKING_PHRASES_HI = [
  "चिंतन...",
  "मनन...",
  "विश्लेषण...",
  "निदान...",
  "मंथन...",
  "मूल्यांकन...",
  "अनुसंधान...",
  "समीक्षा...",
  "निष्कर्ष...",
  "परामर्श..."
];

const THINKING_PHRASES_EN = [
  "Thinking...",
  "Reasoning...",
  "Processing...",
  "Analyzing...",
  "Evaluating...",
  "Synthesizing...",
  "Pondering...",
  "Examining...",
  "Distilling...",
  "Connecting...",
  "Refining...",
  "Deliberating...",
  "Deciphering..."
];

// ─── Resilient API Caller (Vite Proxy -> 127.0.0.1:8000 -> localhost:8000) ───
async function callSmartChatApi(queryText, sessionId, lang) {
  const endpoints = [
    '/api/ai/smart-chat',
    'http://127.0.0.1:8000/api/ai/smart-chat',
    'http://localhost:8000/api/ai/smart-chat',
  ];
  let lastErr = null;
  for (const url of endpoints) {
    try {
      const res = await axios.post(url, {
        query: queryText.trim(),
        user_id: 'patient_session_001',
        session_id: sessionId,
        language: lang,
      }, { timeout: 15000 });
      return res.data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

// ─── ElevenLabs Audio Fetcher with Multi-URL Fallback ────────────────────────
async function fetchElevenLabsAudio(text, lang) {
  const endpoints = [
    '/api/ai/voice-narration',
    'http://127.0.0.1:8000/api/ai/voice-narration',
    'http://localhost:8000/api/ai/voice-narration',
  ];
  for (const url of endpoints) {
    try {
      const res = await axios.post(url, null, {
        params: { text, language: lang, voice_id: ELEVENLABS_VOICE_ID },
        responseType: 'blob',
        timeout: 15000,
      });
      if (res.data && res.data.size > 0 && (res.data.type.includes('audio') || res.data.type === 'audio/mpeg')) {
        return URL.createObjectURL(res.data);
      }
    } catch (_) {}
  }
  return null;
}

// ─── Browser Native TTS Fallback (1.3x speed) ─────────────────────────────────
function speakWithBrowser(text, lang, onEnd) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();

  const execute = () => {
    const voices = window.speechSynthesis.getVoices();
    const code = lang === 'hi' ? 'hi' : 'en';
    const femaleVoice = voices.find(v =>
      v.lang.startsWith(code) && /female|woman|zira|aria|neha|google|microsoft/i.test(v.name)
    ) || voices.find(v => v.lang.startsWith(code)) || voices[0];

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = VOICE_PLAYBACK_SPEED; // 1.3x speed
    utterance.pitch = 1.05;
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onend = () => { if (onEnd) onEnd(); };
    utterance.onerror = () => { if (onEnd) onEnd(); };
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = execute;
  } else {
    execute();
  }
}

// ─── VoiceAIOrb Component ────────────────────────────────────────────────────
export default function VoiceAIOrb({ lang = 'en' }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || lang;

  const [isExpanded, setIsExpanded] = useState(false); // Collapsible floating pill toggle
  const [aiState, setAiState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [activeQuery, setActiveQuery] = useState(''); // Holds typed OR spoken query for display
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isTtsEnabled, setIsTtsEnabled] = useState(true); // TTS Voice Narration Toggle (ON / OFF)
  const [thinkingPhrase, setThinkingPhrase] = useState('');

  // Persistent session ID per browser session
  const sessionIdRef = useRef(
    sessionStorage.getItem('ss_session_id') ||
    `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  );

  const containerRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const autoListenTimerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const currentBlobUrlRef = useRef(null);
  const stateRef = useRef('idle');
  const isTtsEnabledRef = useRef(true);
  const isExpandedRef = useRef(false);

  // ─── Stop All Playback & Mic Helper (Declared Early to prevent ReferenceError) ─
  const stopAll = useCallback(() => {
    if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { 
        recognitionRef.current.abort(); 
        recognitionRef.current.stop();
      } catch (_) {}
    }
    window.speechSynthesis?.cancel();
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.src = '';
      } catch (_) {}
    }
    setAiState('idle');
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (isExpanded && containerRef.current && !containerRef.current.contains(event.target)) {
        stopAll();
        setIsExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, stopAll]);

  useEffect(() => {
    sessionStorage.setItem('ss_session_id', sessionIdRef.current);
  }, []);

  useEffect(() => {
    isExpandedRef.current = isExpanded;
    if (!isExpanded) {
      stopAll();
    }
  }, [isExpanded, stopAll]);

  useEffect(() => {
    stateRef.current = aiState;
  }, [aiState]);

  useEffect(() => {
    isTtsEnabledRef.current = isTtsEnabled;
    if (!isTtsEnabled) {
      window.speechSynthesis?.cancel();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (aiState === 'speaking') {
        setAiState('idle');
      }
    }
  }, [isTtsEnabled, aiState]);

  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startListeningRef = useRef(null);

  const onSpeechFinish = useCallback(() => {
    setAiState('idle');
    if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
    autoListenTimerRef.current = setTimeout(() => {
      if (isExpandedRef.current && startListeningRef.current) {
        startListeningRef.current();
      }
    }, 1000); // 1 Sec Auto-Mic ON
  }, []);

  // ─── Voice Response Player (Strict Single-Source TTS: ElevenLabs OR Browser) ─
  const playVoiceResponse = useCallback(async (textToSpeak) => {
    if (!textToSpeak || !textToSpeak.trim()) return;

    // Immediately stop any currently playing speech or audio
    window.speechSynthesis?.cancel();
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.onended = null;
        audioPlayerRef.current.onerror = null;
      } catch (_) {}
    }
    setAiState('speaking');

    // Attempt ElevenLabs audio first
    const audioUrl = await fetchElevenLabsAudio(textToSpeak, currentLang);

    if (audioUrl && isTtsEnabledRef.current) {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
      currentBlobUrlRef.current = audioUrl;

      const audio = audioPlayerRef.current;
      if (audio) {
        audio.src = audioUrl;
        audio.playbackRate = VOICE_PLAYBACK_SPEED;
        
        let playedSuccessfully = false;

        audio.onended = () => {
          audio.onended = null;
          audio.onerror = null;
          onSpeechFinish();
        };

        audio.onerror = (e) => {
          console.warn('[ElevenLabs Audio Element Error]', e);
          audio.onended = null;
          audio.onerror = null;
          if (!playedSuccessfully && isTtsEnabledRef.current) {
            speakWithBrowser(textToSpeak, currentLang, () => {
              onSpeechFinish();
            });
          } else {
            onSpeechFinish();
          }
        };

        try {
          await audio.play();
          playedSuccessfully = true;
        } catch (e) {
          console.warn('[ElevenLabs Audio Play Exception]', e);
          if (!playedSuccessfully && isTtsEnabledRef.current) {
            speakWithBrowser(textToSpeak, currentLang, () => {
              onSpeechFinish();
            });
          } else {
            onSpeechFinish();
          }
        }
        return; // EXIT! NEVER REACH BROWSER TTS FALLBACK IF ELEVENLABS WAS TRIGGERED
      }
    }

    // Single Browser TTS fallback ONLY if ElevenLabs disabled or returned null
    if (isTtsEnabledRef.current) {
      speakWithBrowser(textToSpeak, currentLang, () => {
        onSpeechFinish();
      });
    } else {
      onSpeechFinish();
    }
  }, [currentLang, onSpeechFinish]);

  // ─── Execute Pipeline Request ──────────────────────────────────────────────
  const sendQueryToPipeline = useCallback(async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    
    const cleanQuery = queryText.trim();
    setActiveQuery(cleanQuery);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    window.speechSynthesis?.cancel();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const isHindiMode = currentLang === 'hi' || /[\u0900-\u097F]/.test(cleanQuery) ||
      /\b(dard|pet|mera|meri|mere|mujhe|kya|kaise|hai|ho|yaar|sar|sir|bukhar|acidity|jalan|ghutna|khansi|ulti|dawa)\b/i.test(cleanQuery);

    const pool = isHindiMode ? THINKING_PHRASES_HI : THINKING_PHRASES_EN;
    const randomPhrase = pool[Math.floor(Math.random() * pool.length)];
    setThinkingPhrase(randomPhrase);

    setAiState('thinking');
    setErrorMsg('');

    try {
      const data = await callSmartChatApi(cleanQuery, sessionIdRef.current, currentLang);

      const parsedReply = {
        en: data.reply_en || '',
        hi: data.reply_hi || '',
        type: data.type || 'casual',
        dosha: data.dosha_imbalance || null,
        urgency: data.urgency || 'Routine',
      };

      setResponse(parsedReply);

      const isHindiMode = currentLang === 'hi' || /[\u0900-\u097F]/.test(cleanQuery) ||
        /\b(dard|pet|mera|meri|mere|mujhe|kya|kaise|hai|ho|yaar|sar|sir|bukhar|acidity|jalan|ghutna|khansi|ulti|dawa)\b/i.test(cleanQuery);

      const textToSpeak = isHindiMode
        ? (parsedReply.hi || parsedReply.en)
        : (parsedReply.en || parsedReply.hi);

      if (isTtsEnabledRef.current) {
        await playVoiceResponse(textToSpeak);
      } else {
        setAiState('idle');
      }
    } catch (err) {
      console.error('[Voice AI Pipeline Error]', err);
      setErrorMsg('Could not connect to AI backend. Please verify backend status.');
      setAiState('idle');
    }
  }, [currentLang, playVoiceResponse]);

  // ─── Start Listening ───────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Voice recognition not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    window.speechSynthesis?.cancel();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    setErrorMsg('');

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => {
        setAiState('listening');
      };

      rec.onresult = (event) => {
        let fullTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setActiveQuery(fullTranscript);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (fullTranscript.trim() && stateRef.current === 'listening') {
            try { rec.stop(); } catch (_) {}
            sendQueryToPipeline(fullTranscript.trim());
          }
        }, 1500);
      };

      rec.onerror = (event) => {
        console.warn('[Speech Recognition Error]', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access blocked. Please allow mic permissions in your browser URL bar.');
          setAiState('idle');
        } else if (event.error !== 'no-speech') {
          setAiState('idle');
        }
      };

      rec.onend = () => {
        if (stateRef.current === 'listening') {
          setAiState('idle');
        }
      };

      recognitionRef.current = rec;
      rec.start();
      setAiState('listening');
    } catch (e) {
      console.error('[Speech Rec Start Exception]', e);
      setAiState('idle');
    }
  }, [currentLang, sendQueryToPipeline]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  const handleOrbClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (aiState === 'listening' || aiState === 'speaking' || aiState === 'thinking') {
      stopAll();
    } else if (aiState === 'idle') {
      startListening();
    }
  };

  const handleResetSession = useCallback(() => {
    stopAll();
    const newSessId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    sessionIdRef.current = newSessId;
    sessionStorage.setItem('ss_session_id', newSessId);
    setActiveQuery('');
    setInputText('');
    setResponse(null);
    setErrorMsg('');
    setAiState('idle');
  }, [stopAll]);

  const handleOpenWidget = () => {
    if (activeQuery || response) {
      handleResetSession();
    }
    setIsExpanded(true);
  };

  const orbGradient = {
    idle: 'from-emerald-500 to-teal-600 shadow-emerald-600/30',
    listening: 'from-rose-500 to-pink-600 shadow-rose-500/40 ring-4 ring-rose-300 animate-pulse',
    thinking: 'from-amber-500 to-orange-500 shadow-amber-500/30',
    speaking: 'from-violet-600 to-teal-600 shadow-teal-500/40',
  }[aiState];

  const ringAnimation = {
    idle: 'border-emerald-400/20',
    listening: 'border-rose-400/60 animate-ping',
    thinking: 'border-amber-400/40 animate-pulse',
    speaking: 'border-teal-400/60 animate-pulse scale-105',
  }[aiState];

  if (!isExpanded) {
    return (
      <div className="animate-fade-in">
        <audio ref={audioPlayerRef} className="hidden" />
        <button
          type="button"
          onClick={handleOpenWidget}
          title={t('orb.speakLabel', 'AyurSaarthi Voice AI — Tap to Open')}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-transparent hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group relative p-0 border-0 outline-none"
        >
          <RobotAvatarAnimation state={aiState} size="lg" />
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-xs"></span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-80 sm:w-96 max-h-[85vh] overflow-y-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 md:p-5 flex flex-col items-center text-center gap-3 relative animate-fade-in">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 text-left">
          <HeartPulse className="w-4 h-4 text-emerald-600" />
          <div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">AyurSaarthi AI</h4>
            <span className="text-[9px] text-emerald-700 font-bold block">{t('orb.assistantSub', 'Voice & Clinical Assistant')}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleResetSession}
            title={t('orb.newSession', 'Start Fresh Session')}
            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('orb.newSessionLabel', 'New Session')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopAll();
              setIsExpanded(false);
            }}
            title={t('orb.collapse', 'Minimize to Pill')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>− {t('orb.collapseLabel', 'Collapse')}</span>
          </button>
        </div>
      </div>

      <audio ref={audioPlayerRef} className="hidden" />

      <div className="relative flex flex-col items-center justify-center w-48 h-48 my-1">
        <div className={`pointer-events-none absolute w-44 h-44 rounded-full border-2 transition-all ${ringAnimation}`} />
        <div className="pointer-events-none absolute w-36 h-36 rounded-full border border-teal-400/25 transition-all" />

        <div onClick={handleOrbClick} className="relative z-20 flex flex-col items-center justify-center cursor-pointer group">
          <RobotAvatarAnimation state={aiState} size="xl" />

          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300 shadow-sm mt-1 group-hover:scale-105 transition-all">
            {aiState === 'listening' ? t('orb.stop', 'Stop Listening') :
             aiState === 'thinking' ? t('orb.thinking', 'AI Processing...') :
             aiState === 'speaking' ? t('orb.speaking', 'Speaking... Tap to Stop') : t('patientPortal.tapToSpeak', 'Tap to Speak')}
          </span>
        </div>
      </div>

      {activeQuery && (
        <div className="p-3.5 md:p-4 bg-slate-50 border border-slate-200/90 rounded-2xl max-w-xl w-full text-left animate-fade-in flex items-start gap-3 shadow-2xs">
          <MessageSquare className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
          <div className="flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-0.5">
              {t('orb.yourQueryLabel', 'YOUR QUERY')}
            </span>
            <p className="text-sm md:text-[15px] font-medium text-slate-900 leading-relaxed font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif]">
              "{activeQuery}"
            </p>
          </div>
        </div>
      )}

      {aiState === 'thinking' && !response && (
        <div className="py-2 px-4 rounded-full bg-emerald-50/90 border border-emerald-200 shadow-2xs backdrop-blur-sm animate-fade-in flex items-center justify-center gap-2.5 my-1">
          <SwasthSaarthiVideoLoader size="xs" inline />
          <span className="text-xs md:text-sm font-black tracking-wide font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif] animate-ai-text-glow">
            {thinkingPhrase || (currentLang === 'hi' ? 'चिंतन...' : 'Reasoning...')}
          </span>
        </div>
      )}

      {response && (
        <div className={`p-4 md:p-5 rounded-2xl max-w-xl w-full text-left space-y-2.5 border shadow-sm backdrop-blur-xs animate-fade-in transition-all ${
          response.urgency === 'Emergency' ? 'bg-red-50/90 border-red-200 text-red-950' :
          response.type === 'medical' ? 'bg-teal-50/90 border-teal-200/90 text-teal-950' :
          'bg-emerald-50/90 border-emerald-200/90 text-emerald-950'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
              {response.urgency === 'Emergency' ? t('orb.emergencyAdvisory', '🚨 EMERGENCY ADVISORY') :
               response.type === 'medical' ? `🌿 ${t('orb.clinicalAssessment', 'Clinical Assessment')}${response.dosha ? ` · ${response.dosha}` : ''}` :
               '💬 AyurSaarthi AI'}
            </span>
            
            {isTtsEnabled && (
              <button
                type="button"
                onClick={() => {
                  const isHindi = currentLang === 'hi' || /[\u0900-\u097F]/.test(activeQuery) ||
                    /\b(dard|pet|mera|meri|mere|mujhe|kya|kaise|hai|ho|yaar|sar|sir|bukhar|acidity|jalan|ghutna|khansi|ulti|dawa)\b/i.test(activeQuery);
                  const text = isHindi ? (response.hi || response.en) : (response.en || response.hi);
                  playVoiceResponse(text);
                }}
                disabled={aiState === 'speaking' || aiState === 'thinking'}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Volume2 className="w-3.5 h-3.5" /> {t('orb.replayVoice', 'Replay Voice')}
              </button>
            )}
          </div>
          <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed tracking-normal font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif]">
            {(currentLang === 'hi' || /[\u0900-\u097F]/.test(activeQuery) || /\b(dard|pet|mera|meri|mere|mujhe|kya|kaise|hai|ho|yaar|sar|sir|bukhar|acidity|jalan|ghutna|khansi|ulti|dawa)\b/i.test(activeQuery))
              ? (response.hi || response.en)
              : (response.en || response.hi)}
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="text-xs text-red-700 font-semibold bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 max-w-lg w-full text-left">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="w-full max-w-lg flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsTtsEnabled(prev => !prev)}
          title={isTtsEnabled ? t('orb.muteVoice', 'Mute Voice Audio') : t('orb.enableVoice', 'Enable Voice Audio')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            isTtsEnabled
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 shadow-xs'
              : 'bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200'
          }`}
        >
          {isTtsEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {aiState !== 'idle' && (
          <button
            type="button"
            onClick={stopAll}
            title={t('orb.stopAi', 'Stop AI')}
            className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0 animate-fade-in"
          >
            <Square className="w-4 h-4 fill-white" />
          </button>
        )}

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputText.trim()) {
              sendQueryToPipeline(inputText);
              setInputText('');
            }
          }}
          placeholder={t('orb.inputPlaceholder', 'Or type your symptoms here...')}
          disabled={aiState === 'thinking' || aiState === 'speaking'}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white shadow-xs transition-all disabled:opacity-50 font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif]"
        />

        <button
          type="button"
          onClick={() => {
            if (inputText.trim()) {
              sendQueryToPipeline(inputText);
              setInputText('');
            }
          }}
          disabled={!inputText.trim() || aiState === 'thinking' || aiState === 'speaking'}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
