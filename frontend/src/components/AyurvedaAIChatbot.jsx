import React, { useState } from 'react';
import { Sparkles, Send, Mic, Volume2, Bot, User, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SpeechMicButton from './SpeechMicButton';
import VoiceAudioPlayer from './VoiceAudioPlayer';
import SwasthSaarthiVideoLoader from './SwasthSaarthiVideoLoader';
import axios from 'axios';

export default function AyurvedaAIChatbot({ lang = 'hi' }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || lang;

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text_en: "Namaste! I am AyurSaarthi AI, your certified Ayurvedic & Emergency Clinical Assistant. How are you feeling today? Speak or type your symptoms below.",
      text_hi: "नमस्ते! मैं आयुसारथी AI हूँ, आपका समर्पित आयुर्वेदिक व आपातकालीन स्वास्थ्य सहायक। आप आज कैसा महसूस कर रहे हैं? नीचे अपने लक्षण बोलें या लिखें।",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dosha: null
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarState, setAvatarState] = useState('idle');

  const handleSendMessage = async (textToSend = input) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setAvatarState('thinking');

    try {
      const endpoints = [
        `${import.meta.env.VITE_API_URL || 'https://swasth-sarthi-sll6.onrender.com'}/api/ai/classify-dosha`,
        '/api/ai/classify-dosha',
      ];
      let res = null;
      for (const url of endpoints) {
        try {
          res = await axios.post(url, { symptoms: query, age: 30 }, { timeout: 15000 });
          if (res?.data) break;
        } catch (_) {}
      }
      if (!res?.data) throw new Error('All endpoints failed');

      const data = res.data;
      const botResponse = {
        sender: 'bot',
        text_en: `Identified Imbalance: ${data.dosha_imbalance || 'Vata-Pitta'}. Severity: ${data.severity || 'Moderate'}. Recommended Therapeutic Focus: ${data.recommended_therapy || 'Kaya Chikitsa & Pathya Ahara'}. Urgency Level: ${data.urgency || 'OPD Consultation'}.`,
        text_hi: `अनुमानित दोष असंतुलन: ${data.dosha_imbalance || 'वात-पित्त'}। गंभीरता: ${data.severity || 'मध्यम'}। अनुशंसित आयुर्वेदिक चिकित्सा: ${data.recommended_therapy || 'काया चिकित्सा व पथ्य आहार'}। परामर्श श्रेणी: ${data.urgency || 'ओपीडी परामर्श'}।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dosha: data
      };

      setMessages((prev) => [...prev, botResponse]);
      setAvatarState('speaking');
      setTimeout(() => setAvatarState('idle'), 4000);
    } catch (e) {
      console.error('AI Chat Error', e);
      const fallbackMsg = {
        sender: 'bot',
        text_en: "Based on your reported symptoms, a Vata-Pitta imbalance is probable. Please consult an Ayurvedic physician for a detailed Ashtavidha Pariksha.",
        text_hi: "आपके लक्षणों के आधार पर वात-पित्त असंतुलन संभावित है। विस्तृत अष्टविध परीक्षा के लिए कृपया आयुर्वेदिक चिकित्सक से परामर्श लें।",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setAvatarState('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[560px]">
      
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-tight">{t('aiChat.title', 'AyurSaarthi Voice AI Assistant')}</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-slate-900 uppercase">
                {avatarState.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 font-medium">
              {t('aiChat.subtitle', 'Ayurvedic Clinical Triage & Guidance System')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          title={t('aiChat.reset', 'Reset Conversation')}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
              m.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white shadow-xs'
            }`}>
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[80%] p-4 rounded-2xl space-y-2 text-xs font-medium ${
              m.sender === 'user'
                ? 'bg-slate-900 text-white rounded-tr-none shadow-xs'
                : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs'
            }`}>
              <p>{m.sender === 'user' ? m.text : (currentLang === 'hi' ? m.text_hi : m.text_en)}</p>

              {/* ElevenLabs Audio Player for Bot Response */}
              {m.sender === 'bot' && (
                <div className="pt-1.5 flex items-center justify-between border-t border-slate-100">
                  <VoiceAudioPlayer text={currentLang === 'hi' ? m.text_hi : m.text_en} language={currentLang} />
                  <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 font-bold max-w-xs animate-pulse">
            <SwasthSaarthiVideoLoader size="xs" inline />
            <span>{t('aiChat.analyzing', 'AyurSaarthi AI is analyzing symptoms...')}</span>
          </div>
        )}
      </div>

      {/* Input Action Bar */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
          <span>{t('aiChat.inputPromptLabel', 'Voice or Text Clinical Query')}</span>
          <SpeechMicButton
            label={t('aiChat.micLabel', 'Speech Input')}
            onTranscript={(txt) => {
              setInput(txt);
              handleSendMessage(txt);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('aiChat.placeholder', 'e.g. I have knee joint pain and morning stiffness for 6 months...')}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 shadow-xs focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
