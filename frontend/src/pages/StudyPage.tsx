import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { daysApi } from "../services/api";
import type { Word } from "../services/api";
import { useStudyContext } from "../contexts/StudyContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

const TOTAL_TOEIC_DAYS = 30;
const TOTAL_WORDBOOKS = 10;

export function StudyPage() {
  const { t } = useTranslation();
  const { userId, isPersonal } = useStudyContext();
  const [searchParams] = useSearchParams();
  const totalItems = isPersonal ? TOTAL_WORDBOOKS : TOTAL_TOEIC_DAYS;
  const [wordbookNames] = useLocalStorage<Record<string, string>>(
    `personal_wordbook_names_${userId}`,
    {}
  );

  const initBook = Number(searchParams.get("book")) || 1;
  const [selectedDay, setSelectedDay] = useState(Math.min(Math.max(initBook, 1), totalItems));
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    setIndex(0);
    setRevealed(false);
    setDone(false);
    daysApi.getWords(selectedDay, userId).then(setWords).finally(() => setLoading(false));
  }, [selectedDay, userId]);

  function next() {
    if (index + 1 >= words.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
    }
  }

  function prev() {
    if (index > 0) {
      setIndex((i) => i - 1);
      setRevealed(false);
    }
  }

  function restart() {
    setIndex(0);
    setRevealed(false);
    setDone(false);
  }

  function speak(word: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }

  const current = words[index];
  const currentLabel = isPersonal
    ? (wordbookNames[String(selectedDay)] || t("wordbook.name", { n: selectedDay }))
    : t("days.day", { n: selectedDay });

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("study.title")}</h1>

      {/* Day / Wordbook selector */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          {isPersonal ? t("wordbook.select") : t("study.selectDay")}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: totalItems }, (_, i) => i + 1).map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 h-9 rounded-xl text-sm font-medium transition-colors ${
                selectedDay === d
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
              }`}
              title={isPersonal ? (wordbookNames[String(d)] || t("wordbook.name", { n: d })) : undefined}
            >
              {isPersonal
                ? (wordbookNames[String(d)] || d)
                : d}
            </button>
          ))}
        </div>
      </div>

      {/* Card area */}
      {loading ? (
        <p className="text-center py-16 text-gray-400">{t("common.loading")}</p>
      ) : words.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p>{t("study.noWords")}</p>
        </div>
      ) : done ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center space-y-4">
          <p className="text-4xl">🎉</p>
          <p className="text-xl font-bold text-gray-900">{t("study.complete")}</p>
          <p className="text-sm text-gray-400">
            {currentLabel} — {t("days.wordCount", { count: words.length })}
          </p>
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            <RotateCcw size={15} />
            {t("study.restart")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{currentLabel}</span>
            <span>{t("study.progress", { current: index + 1, total: words.length })}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: `${((index + 1) / words.length) * 100}%` }}
            />
          </div>

          {/* Flashcard */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 min-h-[260px] flex flex-col justify-between gap-5">
            {/* Word + pronounce */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">{current.word}</span>
              <button
                onClick={() => speak(current.word)}
                className="p-2 rounded-full bg-brand-100 text-brand-600 hover:bg-brand-500 hover:text-white transition-colors"
                title={t("audio.play", { word: current.word })}
              >
                <Volume2 size={18} />
              </button>
            </div>

            {/* Meaning reveal */}
            <div className="flex-1">
              <button
                onClick={() => setRevealed((r) => !r)}
                className="flex items-center gap-1.5 text-sm text-brand-600 hover:underline mb-3"
              >
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                {revealed ? t("study.hideMeaning") : t("study.showMeaning")}
              </button>
              {revealed && (
                <div className="space-y-2 animate-fadeIn">
                  <p className="text-gray-800 leading-relaxed">{current.meaning}</p>
                  {current.example && (
                    <p className="text-gray-400 italic text-sm">&ldquo;{current.example}&rdquo;</p>
                  )}
                </div>
              )}
            </div>

            {/* Nav buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={prev}
                disabled={index === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={15} />
                {t("study.prev")}
              </button>
              <button
                onClick={next}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                {index + 1 < words.length ? t("study.next") : t("study.complete")}
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
