import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { WordForm } from "../components/WordForm";

export function WordNewPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={14} /> {t("common.allWords")}
      </Link>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-5">{t("pages.newWord")}</h1>
        <WordForm />
      </div>
    </div>
  );
}
