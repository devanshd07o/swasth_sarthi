import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Globe } from 'lucide-react';

export default function SpeechMicButton({ onTranscript, label = "Speak Clinical Notes" }) {
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState('hi-IN');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        onTranscript(transcript);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      window._speechRec = rec;
    }
  }, [onTranscript]);

  const toggleListening = () => {
    const rec = window._speechRec;
    if (!rec) {
      alert("Web Speech API is supported in Google Chrome.");
      return;
    }

    if (isListening) {
      rec.stop();
      setIsListening(false);
    } else {
      rec.lang = lang;
      rec.start();
      setIsListening(true);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
          isListening
            ? 'bg-rose-600 text-white mic-active shadow-md shadow-rose-600/30'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Listening ({lang === 'hi-IN' ? 'Hindi' : 'English'})... Tap to stop</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-emerald-600" />
            <span>{label}</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => setLang(lang === 'hi-IN' ? 'en-IN' : 'hi-IN')}
        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-semibold flex items-center gap-1"
      >
        <Globe className="w-3 h-3 text-emerald-600" />
        {lang === 'hi-IN' ? 'Hindi' : 'English'}
      </button>
    </div>
  );
}
