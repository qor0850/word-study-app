import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import type { Word } from "../services/api";
import { WordForm } from "../components/WordForm";
import { useStudyContext } from "../contexts/StudyContext";

export function WordEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { basePath } = useStudyContext();
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(id).then(setWord).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center py-20 text-gray-400">{t("common.loading")}</p>;
  if (!word) return <p className="text-center py-20 text-gray-400">{t("detail.notFound")}</p>;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <Link to={`${basePath}/words/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={14} /> {t("common.back")}
      </Link>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-5">
          {t("pages.editWord", { word: word.word })}
        </h1>
        <WordForm initial={word} />
      </div>
    </div>
  );
}
