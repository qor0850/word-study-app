import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { daysApi, api } from "../services/api";
import type { Word } from "../services/api";
import { useStudyContext } from "../contexts/StudyContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

const SPEED_OPTIONS = [
  { label: "0.5×", value: 0.5 },
  { label: "0.75×", value: 0.75 },
  { label: "1×", value: 1.0 },
  { label: "1.25×", value: 1.25 },
];

const PAUSE_AFTER_WORD_MS = 800;   // gap after word TTS before showing meaning
const MEANING_DISPLAY_MS = 2500;   // how long meaning is shown before next word

export function ListenPage() {
  const { t } = useTranslation();
  const { userId, basePath, isPersonal } = useStudyContext();
  const [searchParams] = useSearchParams();
  const totalItems = isPersonal ? 10 : 30;

  const [wordbookNames] = useLocalStorage<Record<string, string>>(
    `personal_wordbook_names_${userId}`,
    {}
  );

  // source: "all" | "1".."10"
  const initBook = searchParams.get("book") ?? "all";
  const [source, setSource] = useState<string>(initBook);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [repeat, setRepeat] = useState(false);
  const [phase, setPhase] = useState<"word" | "meaning" | "gap">("word");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load words when source changes
  useEffect(() => {
    setIsPlaying(false);
    clearTimers();
    window.speechSynthesis?.cancel();
    setIndex(0);
    setShowMeaning(false);
    setPhase("word");
    setLoading(true);

    const load =
      source === "all"
        ? api.list(undefined, undefined, userId)
        : daysApi.getWords(Number(source), userId);

    load.then(setWords).finally(() => setLoading(false));
  }, [source, userId]);

  function clearTimers() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || words.length === 0) return;
    playWord(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, index, words]);

  function playWord(i: number) {
    clearTimers();
    if (i >= words.length) {
      if (repeat) {
        setIndex(0);
      } else {
        setIsPlaying(false);
      }
      return;
    }
    setShowMeaning(false);
    setPhase("word");

    const word = words[i];
    if (!("speechSynthesis" in window)) {
      // No TTS: just show and advance
      timerRef.current = setTimeout(() => {
        setShowMeaning(true);
        setPhase("meaning");
        timerRef.current = setTimeout(() => advance(i), MEANING_DISPLAY_MS / speed);
      }, 1000 / speed);
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(word.word);
    utter.lang = "en-US";
    utter.rate = speed * 0.85;
    utterRef.current = utter;

    utter.onend = () => {
      if (!isPlaying) return;
      setPhase("meaning");
      timerRef.current = setTimeout(() => {
        setShowMeaning(true);
        timerRef.current = setTimeout(() => advance(i), MEANING_DISPLAY_MS / speed);
      }, PAUSE_AFTER_WORD_MS / speed);
    };

    window.speechSynthesis.speak(utter);
  }

  function advance(i: number) {
    const next = i + 1;
    if (next >= words.length) {
      if (repeat) {
        setIndex(0);
        // useEffect re-triggers
      } else {
        setIsPlaying(false);
        setPhase("word");
        setShowMeaning(false);
      }
    } else {
      setIndex(next);
    }
  }

  function togglePlay() {
    if (isPlaying) {
      setIsPlaying(false);
      window.speechSynthesis?.cancel();
      clearTimers();
    } else {
      if (index >= words.length) setIndex(0);
      setIsPlaying(true);
    }
  }

  function jumpTo(i: number) {
    window.speechSynthesis?.cancel();
    clearTimers();
    setShowMeaning(false);
    setPhase("word");
    setIndex(i);
    if (isPlaying) playWord(i);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const current = words[index];
  const isDone = !isPlaying && index >= words.length - 1 && showMeaning === false && words.length > 0;

  function getSourceLabel(s: string) {
    if (s === "all") return t("listen.allWords");
    const n = Number(s);
    if (isPersonal) return wordbookNames[s] || t("wordbook.name", { n });
    return t("days.day", { n });
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("listen.title")}</h1>

      {/* Source selector */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          {t("listen.selectSource")}
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSource("all")}
            className={`px-3 h-9 rounded-xl text-sm font-medium transition-colors ${
              source === "all"
                ? "bg-brand-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
            }`}
          >
            {t("listen.allWords")}
          </button>
          {Array.from({ length: totalItems }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setSource(String(n))}
              className={`px-3 h-9 rounded-xl text-sm font-medium transition-colors ${
                source === String(n)
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
              }`}
              title={isPersonal ? (wordbookNames[String(n)] || t("wordbook.name", { n })) : undefined}
            >
              {isPersonal ? (wordbookNames[String(n)] || n) : n}
            </button>
          ))}
        </div>
      </div>

      {/* Speed + Repeat controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">{t("listen.speed")}</span>
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSpeed(opt.value)}
              className={`px-2.5 h-7 rounded-lg text-xs font-medium transition-colors ${
                speed === opt.value
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setRepeat((r) => !r)}
          className={`flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-medium border transition-colors ${
            repeat
              ? "bg-brand-100 border-brand-300 text-brand-700"
              : "bg-white border-gray-200 text-gray-500 hover:border-brand-300"
          }`}
        >
          <RefreshCw size={11} />
          {t("listen.repeat")}
        </button>
      </div>

      {/* Main card */}
      {loading ? (
        <p className="text-center py-20 text-gray-400">{t("common.loading")}</p>
      ) : words.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p>{t("listen.noWords")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{getSourceLabel(source)}</span>
            <span>{index + 1} / {words.length}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${((index + 1) / words.length) * 100}%` }}
            />
          </div>

          {/* Flashcard */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 min-h-[240px] flex flex-col justify-between gap-4">
            <div className="flex-1 flex flex-col justify-center gap-4">
              {/* Word */}
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  {current?.word}
                </span>
                {phase === "word" && isPlaying && (
                  <Volume2 size={20} className="text-brand-500 animate-pulse" />
                )}
              </div>

              {/* Meaning reveal */}
              <div className={`transition-all duration-500 ${showMeaning ? "opacity-100" : "opacity-0"}`}>
                <p className="text-lg text-gray-700 leading-relaxed">{current?.meaning}</p>
                {current?.example && (
                  <p className="text-sm text-gray-400 italic mt-2">&ldquo;{current.example}&rdquo;</p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-50">
              <button
                onClick={() => jumpTo(Math.max(0, index - 1))}
                disabled={index === 0}
                className="p-2.5 rounded-xl border text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <SkipBack size={18} />
              </button>

              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors shadow-md"
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>

              <button
                onClick={() => jumpTo(Math.min(words.length - 1, index + 1))}
                disabled={index >= words.length - 1}
                className="p-2.5 rounded-xl border text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <SkipForward size={18} />
              </button>
            </div>
          </div>

          {/* Word list mini-map */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {words.map((w, i) => (
              <button
                key={w.id}
                onClick={() => jumpTo(i)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  i === index
                    ? "bg-brand-600 text-white"
                    : i < index
                    ? "bg-brand-100 text-brand-600"
                    : "bg-gray-100 text-gray-400"
                }`}
                title={w.word}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
