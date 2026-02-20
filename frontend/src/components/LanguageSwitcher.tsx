import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LANGS = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  function toggle() {
    const next = current === "ko" ? "en" : "ko";
    i18n.changeLanguage(next);
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
      title={LANGS.find((l) => l.code !== current)?.label}
    >
      <Globe size={15} />
      {LANGS.find((l) => l.code === current)?.label}
    </button>
  );
}
