"use client";

import { useState, useCallback, useEffect } from "react";

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const { rate = 0.9, pitch = 1, volume = 1 } = options;

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
  }, []);

  const detectLanguage = useCallback((text: string): string => {
    const spanishChars = /[áéíóúñü¿¡]/i;

    if (spanishChars.test(text)) {
      return "es-ES";
    }

    const spanishKeywords =
      /\b(completa|complete|responde|respuesta|selecciona|seleccione|elige|escoge|ordena|traduce|qué|cuál|cómo|dónde|cuándo|por|para|con|sin|sobre|entre|muy|más|menos|sí|no|yo|tú|él|ella|nosotros|ustedes|está|están|ser|estar|tener|hacer|verdadero|falso|siguiente|anterior|resultado)\b/i;

    const englishKeywords =
      /\b(complete|answer|select|choose|order|translate|what|where|when|how|why|who|which|the|is|are|was|were|be|have|has|had|do|does|did|will|would|should|could|can|may|might|this|that|these|those|and|or|but|if|then|than|true|false|next|previous|result)\b/i;

    const spanishMatches = (text.match(spanishKeywords) || []).length;
    const englishMatches = (text.match(englishKeywords) || []).length;

    if (spanishMatches > 0) {
      return "es-ES";
    }

    if (englishMatches > 0) {
      return "en-US";
    }

    return "es-ES";
  }, []);

  const convertMathSymbolsToWords = useCallback(
    (text: string, lang: string): string => {
      let result = text;

      if (lang.startsWith("es")) {
        result = result

          .replace(/_{2,}/g, " espacio en blanco ")
          .replace(/_/g, " espacio en blanco ")

          .replace(/\+/g, " más ")
          .replace(/−/g, " menos ")
          .replace(/-/g, " menos ")
          .replace(/×/g, " por ")
          .replace(/\*/g, " por ")
          .replace(/÷/g, " dividido ")
          .replace(/\//g, " dividido ")
          .replace(/=/g, " igual ")
          .replace(/</g, " menor que ")
          .replace(/>/g, " mayor que ")
          .replace(/≤/g, " menor o igual que ")
          .replace(/≥/g, " mayor o igual que ")
          .replace(/\(\)/g, " paréntesis ")
          .replace(/\(/g, " abre paréntesis ")
          .replace(/\)/g, " cierra paréntesis ");
      } else {
        result = result
          .replace(/_{2,}/g, " blank ")
          .replace(/_/g, " blank ")
          .replace(/\+/g, " plus ")
          .replace(/−/g, " minus ")
          .replace(/-/g, " minus ")
          .replace(/×/g, " times ")
          .replace(/\*/g, " times ")
          .replace(/÷/g, " divided by ")
          .replace(/\//g, " divided by ")
          .replace(/=/g, " equals ")
          .replace(/</g, " less than ")
          .replace(/>/g, " greater than ")
          .replace(/≤/g, " less than or equal to ")
          .replace(/≥/g, " greater than or equal to ")
          .replace(/\(\)/g, " parentheses ")
          .replace(/\(/g, " open parenthesis ")
          .replace(/\)/g, " close parenthesis ");
      }

      //
      return result.replace(/\s+/g, " ").trim();
    },
    []
  );

  const speak = useCallback(
    (text: string, lang?: string) => {
      if (!isSupported) {
        console.warn("Text-to-speech is not supported in this browser");
        return;
      }

      window.speechSynthesis.cancel();

      const detectedLang = lang || detectLanguage(text);

      const textToSpeak = convertMathSymbolsToWords(text, detectedLang);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = detectedLang;

      const voices = window.speechSynthesis.getVoices();
      const appropriateVoice = voices.find((voice) => {
        if (detectedLang.startsWith("es")) {
          return voice.lang.startsWith("es") || voice.lang.startsWith("spa");
        } else {
          return voice.lang.startsWith("en");
        }
      });

      if (appropriateVoice) {
        utterance.voice = appropriateVoice;
      }

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [
      isSupported,
      detectLanguage,
      convertMathSymbolsToWords,
      rate,
      pitch,
      volume
    ]
  );

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.resume();
    }
  }, [isSupported, isSpeaking]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported
  };
}
