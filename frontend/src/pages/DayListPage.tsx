import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus, Pencil, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { daysApi } from "../services/api";
import type { DaySummary } from "../services/api";
import { useStudyContext } from "../contexts/StudyContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

const TOTAL_WORDBOOKS = 10;

export function DayListPage() {
  const { t } = useTranslation();
  const { userId, basePath, isPersonal } = useStudyContext();
  const [days, setDays] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [wordbookNames, setWordbookNames] = useLocalStorage<Record<string, string>>(
    `personal_wordbook_names_${userId}`,
    {}
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    setLoading(true);
    daysApi.list(userId).then(setDays).finally(() => setLoading(false));
  }, [userId]);

  const countMap = new Map(days.map((d) => [d.day_number, d.word_count]));
  const totalWords = days.reduce((sum, d) => sum + d.word_count, 0);

  function startEdit(n: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(n);
    setEditValue(wordbookNames[String(n)] || t("wordbook.name", { n }));
  }

  function saveEdit(n: number) {
    const name = editValue.trim();
    if (name) setWordbookNames({ ...wordbookNames, [String(n)]: name });
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isPersonal ? t("wordbook.title") : t("days.title")}
          </h1>
          {!loading && (
            <p className="text-sm text-gray-400 mt-0.5">
              {t("list.wordCount", { count: totalWords })}
            </p>
          )}
        </div>
        <Link
          to={`${basePath}/words/new`}
          className="flex items-center gap-1.5 bg-brand-600 text-white font-semibold px-3 py-2 rounded-xl text-sm hover:bg-brand-700 transition-colors"
        >
          <Plus size={15} />
          {t("nav.addWord")}
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-center py-20 text-gray-400">{t("common.loading")}</p>
      ) : isPersonal ? (
        /* Personal: fixed 10 wordbooks with editable names */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: TOTAL_WORDBOOKS }, (_, i) => i + 1).map((n) => {
            const count = countMap.get(n) ?? 0;
            const name = wordbookNames[String(n)] || t("wordbook.name", { n });
            const isEditing = editingId === n;

            return (
              <div
                key={n}
                className={`relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
                  count > 0
                    ? "bg-white border-brand-200 text-gray-900 hover:shadow-md hover:-translate-y-0.5"
                    : "bg-gray-50 border-gray-100 text-gray-400 hover:shadow-sm hover:bg-white"
                }`}
              >
                {isEditing ? (
                  <div className="w-full space-y-2">
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(n);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="w-full border border-brand-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-400"
                      maxLength={20}
                    />
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => saveEdit(n)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-gray-400 hover:bg-gray-50 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link
                      to={`${basePath}/days/${n}`}
                      className="flex flex-col items-center w-full"
                    >
                      <div className="flex items-center justify-center mb-1">
                        <BookOpen
                          size={18}
                          className={count > 0 ? "text-brand-500" : "text-gray-300"}
                        />
                      </div>
                      <span className="text-sm font-bold leading-tight">{name}</span>
                      <span
                        className={`text-xs mt-0.5 ${
                          count > 0 ? "text-brand-600 font-medium" : "text-gray-300"
                        }`}
                      >
                        {count > 0
                          ? t("days.wordCount", { count })
                          : t("days.noWords")}
                      </span>
                    </Link>
                    <button
                      onClick={(e) => startEdit(n, e)}
                      className="absolute top-2 right-2 p-1 text-gray-300 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                      title={t("wordbook.rename")}
                    >
                      <Pencil size={12} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* TOEIC: show days from API */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {days.map((day) => (
            <DayCard key={day.day_number} day={day} basePath={basePath} />
          ))}
        </div>
      )}
    </div>
  );
}

function DayCard({ day, basePath }: { day: DaySummary; basePath: string }) {
  const { t } = useTranslation();
  const hasWords = day.word_count > 0;

  return (
    <Link
      to={`${basePath}/days/${day.day_number}`}
      className={`relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${
        hasWords
          ? "bg-white border-brand-200 text-gray-900"
          : "bg-gray-50 border-gray-100 text-gray-400"
      }`}
    >
      <div className="flex items-center justify-center mb-1">
        <BookOpen size={18} className={hasWords ? "text-brand-500" : "text-gray-300"} />
      </div>
      <span className="text-sm font-bold">{t("days.day", { n: day.day_number })}</span>
      <span
        className={`text-xs mt-0.5 ${
          hasWords ? "text-brand-600 font-medium" : "text-gray-300"
        }`}
      >
        {hasWords ? t("days.wordCount", { count: day.word_count }) : t("days.noWords")}
      </span>
    </Link>
  );
}
