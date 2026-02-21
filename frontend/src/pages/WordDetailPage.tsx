import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import type { Word } from "../services/api";
import { AudioButton } from "../components/AudioButton";
import { useStudyContext } from "../contexts/StudyContext";

export function WordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { basePath } = useStudyContext();
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(id).then(setWord).finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!word || !confirm(t("detail.deleteConfirm", { word: word.word }))) return;
    await api.delete(word.id);
    navigate(basePath, { replace: true });
  }

  if (loading) return <p className="text-center py-20 text-gray-400">{t("common.loading")}</p>;
  if (!word) return <p className="text-center py-20 text-gray-400">{t("detail.notFound")}</p>;

  const dateStr = new Date(word.created_at).toLocaleDateString(i18n.language);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link to={basePath} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={14} /> {t("common.allWords")}
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Word + actions */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">{word.word}</h1>
              <AudioButton word={word.word} />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`${basePath}/words/${word.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Pencil size={14} /> {t("common.edit")}
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> {t("common.delete")}
            </button>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Meaning */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            {t("detail.meaning")}
          </h2>
          <p className="text-gray-800 leading-relaxed">{word.meaning}</p>
        </section>

        {/* Example */}
        {word.example && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
              {t("detail.example")}
            </h2>
            <p className="text-gray-600 italic leading-relaxed">&ldquo;{word.example}&rdquo;</p>
          </section>
        )}

        <p className="text-xs text-gray-300">
          {t("detail.addedOn", { date: dateStr })}
        </p>
      </div>
    </div>
  );
}
