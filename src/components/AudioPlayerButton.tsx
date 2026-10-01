import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface AudioPlayerButtonProps {
  text: string;
  className?: string;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({ text, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanTextForSpeech = (rawText: string) => {
    return rawText
      .replace(/[*#_`~[\]()]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleToggle = async () => {
    if (playing) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlaying(false);
      return;
    }

    const speechText = cleanTextForSpeech(text).slice(0, 500);
    if (!speechText) return;

    setLoading(true);

    try {
      // Try Gemini TTS first
      const audioUrl = await api.generateSpeech(speechText, 'Kore');
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setLoading(false);
        setPlaying(true);
      };

      audio.onended = () => {
        setPlaying(false);
      };

      audio.onerror = () => {
        // Fallback to browser Web Speech API
        playBrowserSpeech(speechText);
      };

      await audio.play();
    } catch {
      // Fallback seamlessly to browser Web Speech API
      playBrowserSpeech(speechText);
    }
  };

  const playBrowserSpeech = (speechText: string) => {
    if (!('speechSynthesis' in window)) {
      setLoading(false);
      setPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setLoading(false);
      setPlaying(true);
    };

    utterance.onend = () => {
      setPlaying(false);
    };

    utterance.onerror = () => {
      setLoading(false);
      setPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      title={playing ? 'Stop reading' : 'Listen with Gemini AI Voice'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
        playing
          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
      ) : playing ? (
        <VolumeX className="w-3.5 h-3.5 text-amber-400" />
      ) : (
        <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
      )}
      <span>{loading ? 'Synthesizing...' : playing ? 'Stop Audio' : 'Listen'}</span>
    </button>
  );
};
