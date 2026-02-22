import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStudyContext } from "../contexts/StudyContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Memo } from "./DayListPage";

export function MemoPage() {
  const { memoId } = useParams<{ memoId: string }>();
  const { t } = useTranslation();
  const { userId, basePath } = useStudyContext();

  const [memos, setMemos] = useLocalStorage<Memo[]>(`personal_memos_${userId}`, []);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [saved, setSaved] = useState(false);

  const memoIndex = memos.findIndex((m) => m.id === memoId);
  const memo = memos[memoIndex];

  function updateField(field: keyof Memo, value: string) {
    if (memoIndex < 0) return;
    const updated = [...memos];
    updated[memoIndex] = { ...updated[memoIndex], [field]: value };
    setMemos(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  function startEditTitle() {
    setTitleValue(memo?.title ?? "");
    setEditingTitle(true);
  }

  function saveTitle() {
    const title = titleValue.trim();
    if (title) updateField("title", title);
    setEditingTitle(false);
  }

  if (!memo) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>{t("memo.notFound")}</p>
        <Link to={basePath} className="text-brand-600 text-sm hover:underline mt-2 inline-block">
          {t("wordbook.all")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back */}
      <Link
        to={basePath}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        onClick={() => {
          // switch to memo tab by passing state not needed – tab is handled by URL
        }}
      >
        <ArrowLeft size={14} />
        {t("memo.tab")}
      </Link>

      {/* Editor card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          {editingTitle ? (
            <>
              <input
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") setEditingTitle(false);
                }}
                className="flex-1 border border-brand-300 rounded-lg px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-400"
                maxLength={30}
              />
              <button onClick={saveTitle} className="p-1 text-green-600 hover:bg-green-50 rounded">
                <Check size={15} />
              </button>
              <button onClick={() => setEditingTitle(false)} className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                <X size={15} />
              </button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm font-semibold text-gray-800">{memo.title}</span>
              <span className={`text-xs text-green-600 mr-2 transition-opacity duration-300 ${saved ? "opacity-100" : "opacity-0"}`}>
                {t("memo.saved")}
              </span>
              <button
                onClick={startEditTitle}
                className="p-1 text-gray-300 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                title={t("memo.editTitle")}
              >
                <Pencil size={13} />
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <textarea
          value={memo.content}
          onChange={(e) => updateField("content", e.target.value)}
          placeholder={t("memo.placeholder")}
          className="w-full h-[500px] px-4 py-3 text-sm text-gray-700 leading-relaxed resize-none focus:outline-none placeholder-gray-300"
        />
      </div>

      <p className="text-xs text-gray-300 text-center">{t("memo.autoSave")}</p>
    </div>
  );
}
