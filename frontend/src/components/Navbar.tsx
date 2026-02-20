import { Link } from "react-router-dom";
import { BookOpen, Plus, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="bg-brand-600 text-white shadow-md sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-90">
          <BookOpen size={22} />
          WordApp
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/study"
            className="flex items-center gap-1.5 text-white/90 hover:opacity-90 px-3 py-1.5 rounded-lg text-sm"
          >
            <Play size={16} />
            {t("nav.study")}
          </Link>
          <LanguageSwitcher />
          <Link
            to="/words/new"
            className="flex items-center gap-1.5 bg-white text-brand-600 font-semibold px-3 py-1.5 rounded-lg text-sm hover:bg-brand-50 transition-colors ml-1"
          >
            <Plus size={16} />
            {t("nav.addWord")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
