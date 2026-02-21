import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import type { Word, WordCreate } from "../services/api";
import { useStudyContext } from "../contexts/StudyContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface Props {
  initial?: Word;
}

export function WordForm({ initial }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userId, basePath, isPersonal } = useStudyContext();
  const [wordbookNames] = useLocalStorage<Record<string, string>>(
    `personal_wordbook_names_${userId}`,
    {}
  );
  const isEdit = Boolean(initial);
  const totalOptions = isPersonal ? 10 : 30;

  const [form, setForm] = useState<WordCreate>({
    word: initial?.word ?? "",
    meaning: initial?.meaning ?? "",
    example: initial?.example ?? "",
    study_day: initial?.study_day ?? undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof WordCreate, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const location = useLocation();
  useEffect(() => {
    if (!initial) {
      const params = new URLSearchParams(location.search);
      const day = params.get("day");
      if (day) set("study_day", String(Math.max(1, Number(day))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload: WordCreate = {
      word: form.word.trim(),
      meaning: form.meaning.trim(),
      example: form.example?.trim() || undefined,
      study_day: form.study_day ? Number(form.study_day) : undefined,
    };

    try {
      if (isEdit && initial) {
        await api.update(initial.id, payload);
        navigate(`${basePath}/words/${initial.id}`, { replace: true });
      } else {
        const created = await api.create({ ...payload, user_id: userId });
        navigate(`${basePath}/words/${created.id}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  function getOptionLabel(d: number): string {
    if (isPersonal) {
      return wordbookNames[String(d)] || t("wordbook.name", { n: d });
    }
    return t("days.day", { n: d });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("form.word")} <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={form.word}
          onChange={(e) => set("word", e.target.value)}
          placeholder={t("form.wordPlaceholder")}
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isPersonal ? t("wordbook.label") : t("form.studyDay")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={form.study_day ?? ""}
          onChange={(e) => set("study_day", e.target.value)}
          className="w-48 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="" disabled>
            {isPersonal ? t("wordbook.selectPlaceholder") : t("form.studyDayPlaceholder")}
          </option>
          {Array.from({ length: totalOptions }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {getOptionLabel(d)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("form.meaning")} <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          value={form.meaning}
          onChange={(e) => set("meaning", e.target.value)}
          placeholder={t("form.meaningPlaceholder")}
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("form.example")}{" "}
          <span className="text-gray-400 text-xs">({t("common.optional")})</span>
        </label>
        <textarea
          value={form.example ?? ""}
          onChange={(e) => set("example", e.target.value)}
          placeholder={t("form.examplePlaceholder")}
          rows={2}
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? t("form.saveChanges") : t("form.addWord")}
        </button>
      </div>
    </form>
  );
}
