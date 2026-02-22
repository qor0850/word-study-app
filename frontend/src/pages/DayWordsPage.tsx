import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, BookOpen, GraduationCap, Headphones } from "lucide-react";
import { useTranslation } from "react-i18next";
import { daysApi, api } from "../services/api";
import type { Word } from "../services/api";
import { AudioButton } from "../components/AudioButton";
import { useStudyContext } from "../contexts/StudyContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

const TOTAL_TOEIC_DAYS = 30;
const TOTAL_WORDBOOKS = 10;

export function DayWordsPage() {
  const { day } = useParams<{ day: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userId, basePath, isPersonal } = useStudyContext();
  const [wordbookNames] = useLocalStorage<Record<string, string>>(
    `personal_wordbook_names_${userId}`,
    {}
  );
  const dayNum = Number(day);
  const totalItems = isPersonal ? TOTAL_WORDBOOKS : TOTAL_TOEIC_DAYS;
  const pageTitle = isPersonal
    ? (wordbookNames[String(dayNum)] || t("wordbook.name", { n: dayNum }))
    : t("days.day", { n: dayNum });
  const backLabel = isPersonal ? t("wordbook.all") : t("days.allDays");

  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dayNum) return;
    setLoading(true);
    daysApi.getWords(dayNum, userId, `_t=${Date.now()}`).then(setWords).finally(() => setLoading(false));
  }, [dayNum, userId]);

  async function handleDelete(id: string, wordText: string) {
    if (!confirm(t("detail.deleteConfirm", { word: wordText }))) return;
    await api.delete(id);
    setWords((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb + nav */}
      <div className="flex items-center justify-between">
        <Link to={basePath} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={14} /> {backLabel}
        </Link>
        <div className="flex items-center gap-2">
          {dayNum > 1 && (
            <button
              onClick={() => navigate(`${basePath}/days/${dayNum - 1}`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              title={isPersonal ? t("wordbook.prev") : t("days.prevDay")}
            >
              <ArrowLeft size={13} /> {dayNum - 1}
            </button>
          )}
          {dayNum < totalItems && (
            <button
              onClick={() => navigate(`${basePath}/days/${dayNum + 1}`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              title={isPersonal ? t("wordbook.next") : t("days.nextDay")}
            >
              {dayNum + 1} <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {pageTitle}
          <span className="ml-2 text-base font-normal text-gray-400">
            {!loading && t("days.wordCount", { count: words.length })}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <Link
            to={`${basePath}/study?book=${dayNum}`}
            className="flex items-center gap-1 border border-brand-300 text-brand-700 font-semibold px-2.5 py-2 rounded-xl text-sm hover:bg-brand-50 transition-colors"
            title={t("study.title")}
          >
            <GraduationCap size={15} />
          </Link>
          <Link
            to={`${basePath}/listen?book=${dayNum}`}
            className="flex items-center gap-1 border border-brand-300 text-brand-700 font-semibold px-2.5 py-2 rounded-xl text-sm hover:bg-brand-50 transition-colors"
            title={t("listen.title")}
          >
            <Headphones size={15} />
          </Link>
          <Link
            to={`${basePath}/words/new?day=${dayNum}`}
            className="flex items-center gap-1.5 bg-brand-600 text-white font-semibold px-3 py-2 rounded-xl text-sm hover:bg-brand-700 transition-colors"
          >
            <Plus size={15} />
            {t("days.addWord")}
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-center py-20 text-gray-400">{t("common.loading")}</p>
      ) : words.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <BookOpen size={48} strokeWidth={1} />
          <p className="text-base font-medium">{t("days.noWords")}</p>
          <Link
            to={`${basePath}/words/new?day=${dayNum}`}
            className="text-brand-600 text-sm hover:underline"
          >
            {t("days.addWord")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {words.map((word, i) => (
            <WordRow
              key={word.id}
              word={word}
              index={i + 1}
              basePath={basePath}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RowProps {
  word: Word;
  index: number;
  basePath: string;
  onDelete: (id: string, word: string) => void;
}

function WordRow({ word, index, basePath, onDelete }: RowProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-xs text-gray-300 font-mono mt-1 shrink-0">{String(index).padStart(2, "0")}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`${basePath}/words/${word.id}`}
                className="text-base font-bold text-gray-900 hover:text-brand-600 transition-colors"
              >
                {word.word}
              </Link>
              <AudioButton word={word.word} />
            </div>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-sm text-gray-500 hover:text-gray-700 mt-1 text-left leading-relaxed line-clamp-1"
            >
              {word.meaning}
            </button>
            {expanded && word.example && (
              <p className="text-sm text-gray-400 italic mt-1">&ldquo;{word.example}&rdquo;</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            to={`${basePath}/words/${word.id}/edit`}
            className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors text-xs"
          >
            {t("common.edit")}
          </Link>
          <button
            onClick={() => onDelete(word.id, word.word)}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors text-xs"
          >
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
