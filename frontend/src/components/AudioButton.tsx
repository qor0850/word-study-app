import { Volume2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface Props {
  word: string;
}

export function AudioButton({ word }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  function useTtsApi() {
    // Google Translate TTS endpoint (free, no key needed)
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=en&client=tw-ob`;
    
    const audio = new Audio(ttsUrl);
    audio.onended = () => setLoading(false);
    audio.onerror = () => {
      setLoading(false);
      console.error("TTS API failed");
    };
    audio.play().catch((err) => {
      setLoading(false);
      console.error("Audio playback failed:", err);
    });
  }

  function speak() {
    setLoading(true);
    
    // Try web speech API first (better for desktop)
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(word);
        utter.rate = 0.9;
        utter.volume = 1;

        function chooseAndSpeak() {
          const voices = window.speechSynthesis.getVoices() || [];
          const voice = voices.find((v) => v.lang && v.lang.startsWith("en")) || voices[0];
          if (voice) {
            utter.voice = voice;
            utter.lang = voice.lang || "en-US";
          } else {
            utter.lang = "en-US";
          }
          window.speechSynthesis.speak(utter);
          setLoading(false);
        }

        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          const handler = () => {
            chooseAndSpeak();
            window.speechSynthesis.removeEventListener("voiceschanged", handler);
          };
          window.speechSynthesis.addEventListener("voiceschanged", handler);
          setTimeout(() => {
            if (window.speechSynthesis.getVoices().length > 0) chooseAndSpeak();
          }, 200);
        } else {
          chooseAndSpeak();
        }
        utter.onerror = (e) => {
          console.error("SpeechSynthesis error:", e);
          setLoading(false);
          useTtsApi();
        };
        return;
      } catch (err) {
        console.error("speak() failed:", err);
      }
    }
    
    // Fallback to Google Translate API
    useTtsApi();
  }

  return (
    <button
      onClick={speak}
      disabled={loading}
      title={t("audio.play", { word })}
      className="p-2 rounded-full bg-brand-100 text-brand-600 hover:bg-brand-500 hover:text-white transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
    </button>
  );
}
