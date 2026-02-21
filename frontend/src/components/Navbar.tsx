import { Link, useLocation } from "react-router-dom";
import { BookOpen, GraduationCap, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const isToeic = pathname.startsWith("/toeic");
  const isPersonal = pathname.startsWith("/personal");

  const activeClass =
    "bg-white/20 text-white font-semibold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5";
  const inactiveClass =
    "text-white/80 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors";

  return (
    <nav className="bg-brand-600 text-white shadow-md sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-90">
          <BookOpen size={22} />
          WordApp
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/personal" className={isPersonal ? activeClass : inactiveClass}>
            <User size={16} />
            {t("nav.personal")}
          </Link>
          <Link to="/toeic" className={isToeic ? activeClass : inactiveClass}>
            <GraduationCap size={16} />
            {t("nav.toeic")}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
