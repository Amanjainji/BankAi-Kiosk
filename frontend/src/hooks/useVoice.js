// =============================================================
// useVoice — Web Speech API hook for STT + TTS
// Supports all 12 Indian regional languages
// =============================================================
import { useState, useCallback, useRef } from 'react';

// Maps language code → browser BCP-47 speech code
const LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  ur: 'ur-IN',
};

export const useVoice = (language = 'en') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript]   = useState('');
  const recognitionRef = useRef(null);

  const getSpeechCode = (lang) => LANG_MAP[lang] || LANG_MAP[lang?.split('-')[0]] || 'en-IN';

  const startListening = useCallback((onResult) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang             = getSpeechCode(language);
    recognition.interimResults   = false;
    recognition.maxAlternatives  = 1;
    recognitionRef.current       = recognition;

    recognition.onstart  = () => setIsListening(true);
    recognition.onend    = () => setIsListening(false);
    recognition.onerror  = () => setIsListening(false);

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      if (onResult) onResult(text);
    };

    recognition.start();
  }, [language]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text, lang = language) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel(); // cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = getSpeechCode(lang);
    utterance.rate  = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const cancelSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  return { isListening, transcript, startListening, stopListening, speak, cancelSpeech };
};
