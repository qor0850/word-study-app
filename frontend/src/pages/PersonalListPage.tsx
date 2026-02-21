import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, Pencil, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { personalApi } from "../services/api";
import type { UserSummary } from "../services/api";
import { useLocalStorage } from "../hooks/useLocalStorage";

export function PersonalListPage() {
  const { t } = useTranslation();
  const [summaries, setSummaries] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useLocalStorage<Record<string, string>>(
    "personal_user_names",
    {}
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    personalApi.summary().then(setSummaries).finally(() => setLoading(false));
  }, []);

  const countMap = new Map(summaries.map((s) => [s.user_id, s.word_count]));

  function startEdit(uid: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(uid);
    setEditValue(userNames[String(uid)] || t("personal.user", { n: uid }));
  }

  function saveEdit(uid: number) {
    const name = editValue.trim();
    if (name) setUserNames({ ...userNames, [String(uid)]: name });
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("personal.title")}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t("personal.selectUser")}</p>
      </div>

      {loading ? (
        <p className="text-center py-20 text-gray-400">{t("common.loading")}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((uid) => {
            const count = countMap.get(uid) ?? 0;
            const name = userNames[String(uid)] || t("personal.user", { n: uid });
            const isEditing = editingId === uid;

            return (
              <div
                key={uid}
                className="relative flex flex-col items-center justify-center rounded-2xl border bg-white border-gray-100 shadow-sm p-5 text-center transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand-200"
              >
                {isEditing ? (
                  <div className="w-full space-y-2">
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(uid);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="w-full border border-brand-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-400"
                      maxLength={20}
                    />
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => saveEdit(uid)}
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
                    <Link to={`/personal/${uid}`} className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center mb-2">
                        <User size={20} className="text-brand-600" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{name}</span>
                      <span
                        className={`text-xs mt-0.5 ${
                          count > 0 ? "text-brand-600 font-medium" : "text-gray-300"
                        }`}
                      >
                        {count > 0
                          ? t("personal.wordCount", { count })
                          : t("personal.noWords")}
                      </span>
                    </Link>
                    <button
                      onClick={(e) => startEdit(uid, e)}
                      className="absolute top-2 right-2 p-1 text-gray-300 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                      title={t("personal.editName")}
                    >
                      <Pencil size={12} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
