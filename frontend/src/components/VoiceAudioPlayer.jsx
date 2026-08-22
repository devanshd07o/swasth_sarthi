import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Square } from 'lucide-react';
import { getVoiceNarration } from '../services/api';

export default function VoiceAudioPlayer({ text, language = 'en' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speechSynth, setSpeechSynth] = useState(null);

  const handlePlayVoice = async () => {
    if (!text) return;

    if (isPlaying) {
      if (speechSynth) window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setLoading(true);

    try {
      // Try ElevenLabs audio API first
      const audioBuffer = await getVoiceNarration(text, language);
      if (audioBuffer && audioBuffer.byteLength > 0) {
        const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);

        audio.onended = () => setIsPlaying(false);
        audio.play();
        setIsPlaying(true);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('[ElevenLabs API fallback to SpeechSynthesis]:', e);
    }

    // Web SpeechSynthesis Fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setSpeechSynth(utterance);
      setIsPlaying(true);
    } else {
      alert('Speech synthesis is not supported in this browser.');
    }

    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handlePlayVoice}
      disabled={loading || !text}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
        isPlaying
          ? 'bg-amber-600 text-white'
          : 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700'
      }`}
    >
      {loading ? (
        <span className="animate-spin text-amber-400">⏳ Loading Voice...</span>
      ) : isPlaying ? (
        <>
          <Square className="w-3.5 h-3.5 text-white" />
          <span>Stop AI Voice Narration</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Listen AI Voice ({language === 'hi' ? 'Hindi' : 'English'})</span>
        </>
      )}
    </button>
  );
}
