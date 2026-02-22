import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Plus, Pencil, Check, X, GraduationCap, Headphones, Trash2, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { daysApi } from "../services/api";
import type { DaySummary } from "../services/api";
import { useStudyContext } from "../contexts/StudyContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

const TOTAL_WORDBOOKS = 10;
const MAX_MEMOS = 5;

export interface Memo {
  id: string;
  title: string;
  content: string;
}

export function DayListPage() {
  const { t } = useTranslation();
  const { userId, basePath, isPersonal } = useStudyContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"wordbook" | "memo">("wordbook");

  // Wordbook state
  const [days, setDays] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [wordbookNames, setWordbookNames] = useLocalStorage<Record<string, string>>(
    `personal_wordbook_names_${userId}`,
    {}
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // Memo state
  const [memos, setMemos] = useLocalStorage<Memo[]>(`personal_memos_${userId}`, []);

  useEffect(() => {
    setLoading(true);
    daysApi.list(userId).then(setDays).finally(() => setLoading(false));
  }, [userId]);

  const countMap = new Map(days.map((d) => [d.day_number, d.word_count]));
  const totalWords = days.reduce((sum, d) => sum + d.word_count, 0);

  // Wordbook edit
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
  function cancelEdit() { setEditingId(null); }

  // Memo actions
  function addMemo() {
    if (memos.length >= MAX_MEMOS) return;
    const newMemo: Memo = {
      id: Date.now().toString(),
      title: t("memo.defaultTitle", { n: memos.length + 1 }),
      content: "",
    };
    const updated = [...memos, newMemo];
    setMemos(updated);
    navigate(`${basePath}/memo/${newMemo.id}`);
  }

  function deleteMemo(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("memo.deleteConfirm"))) return;
    setMemos(memos.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isPersonal ? t("wordbook.title") : t("days.title")}
          </h1>
          {!loading && activeTab === "wordbook" && (
            <p className="text-sm text-gray-400 mt-0.5">
              {t("list.wordCount", { count: totalWords })}
            </p>
          )}
          {isPersonal && activeTab === "memo" && (
            <p className="text-sm text-gray-400 mt-0.5">
              {t("memo.count", { count: memos.length, max: MAX_MEMOS })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "wordbook" && (
            <>
              <Link
                to={`${basePath}/study`}
                className="flex items-center gap-1.5 border border-brand-300 text-brand-700 font-semibold px-3 py-2 rounded-xl text-sm hover:bg-brand-50 transition-colors"
              >
                <GraduationCap size={15} />
                {t("study.title")}
              </Link>
              <Link
                to={`${basePath}/listen`}
                className="flex items-center gap-1.5 border border-brand-300 text-brand-700 font-semibold px-3 py-2 rounded-xl text-sm hover:bg-brand-50 transition-colors"
              >
                <Headphones size={15} />
                {t("listen.title")}
              </Link>
              <Link
                to={`${basePath}/words/new`}
                className="flex items-center gap-1.5 bg-brand-600 text-white font-semibold px-3 py-2 rounded-xl text-sm hover:bg-brand-700 transition-colors"
              >
                <Plus size={15} />
                {t("nav.addWord")}
              </Link>
            </>
          )}
          {isPersonal && activeTab === "memo" && (
            <button
              onClick={addMemo}
              disabled={memos.length >= MAX_MEMOS}
              className="flex items-center gap-1.5 bg-brand-600 text-white font-semibold px-3 py-2 rounded-xl text-sm hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={15} />
              {t("memo.add")}
            </button>
          )}
        </div>
      </div>

      {/* Tabs (personal only) */}
      {isPersonal && (
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("wordbook")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "wordbook"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpen size={14} />
            {t("wordbook.tab")}
          </button>
          <button
            onClick={() => setActiveTab("memo")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "memo"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText size={14} />
            {t("memo.tab")}
          </button>
        </div>
      )}

      {/* Content */}
      {loading && activeTab === "wordbook" ? (
        <p className="text-center py-20 text-gray-400">{t("common.loading")}</p>
      ) : activeTab === "wordbook" && isPersonal ? (
        /* Personal wordbooks */
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
                      <button onClick={() => saveEdit(n)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Check size={14} />
                      </button>
                      <button onClick={cancelEdit} className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link to={`${basePath}/days/${n}`} className="flex flex-col items-center w-full">
                      <div className="flex items-center justify-center mb-1">
                        <BookOpen size={18} className={count > 0 ? "text-brand-500" : "text-gray-300"} />
                      </div>
                      <span className="text-sm font-bold leading-tight">{name}</span>
                      <span className={`text-xs mt-0.5 ${count > 0 ? "text-brand-600 font-medium" : "text-gray-300"}`}>
                        {count > 0 ? t("days.wordCount", { count }) : t("days.noWords")}
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
      ) : activeTab === "wordbook" ? (
        /* TOEIC days */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {days.map((day) => (
            <DayCard key={day.day_number} day={day} basePath={basePath} />
          ))}
        </div>
      ) : (
        /* Memo tab */
        memos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <FileText size={48} strokeWidth={1} />
            <p className="text-base font-medium">{t("memo.empty")}</p>
            <button
              onClick={addMemo}
              className="text-brand-600 text-sm hover:underline"
            >
              {t("memo.add")}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {memos.map((memo) => (
              <Link
                key={memo.id}
                to={`${basePath}/memo/${memo.id}`}
                className="flex items-start justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-brand-200 transition-all group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <FileText size={18} className="text-brand-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{memo.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {memo.content || t("memo.noContent")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => deleteMemo(memo.id, e)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 ml-2 opacity-0 group-hover:opacity-100"
                  title={t("common.delete")}
                >
                  <Trash2 size={14} />
                </button>
              </Link>
            ))}
            {memos.length < MAX_MEMOS && (
              <button
                onClick={addMemo}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-gray-200 text-gray-400 hover:border-brand-300 hover:text-brand-500 text-sm transition-colors"
              >
                <Plus size={15} />
                {t("memo.add")}
              </button>
            )}
          </div>
        )
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
        hasWords ? "bg-white border-brand-200 text-gray-900" : "bg-gray-50 border-gray-100 text-gray-400"
      }`}
    >
      <div className="flex items-center justify-center mb-1">
        <BookOpen size={18} className={hasWords ? "text-brand-500" : "text-gray-300"} />
      </div>
      <span className="text-sm font-bold">{t("days.day", { n: day.day_number })}</span>
      <span className={`text-xs mt-0.5 ${hasWords ? "text-brand-600 font-medium" : "text-gray-300"}`}>
        {hasWords ? t("days.wordCount", { count: day.word_count }) : t("days.noWords")}
      </span>
    </Link>
  );
}
