import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { daysApi } from "../services/api";
import type { DaySummary } from "../services/api";
import { useStudyContext } from "../contexts/StudyContext";

export function DayListPage() {
  const { t } = useTranslation();
  const { userId, basePath } = useStudyContext();
  const [days, setDays] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    daysApi.list(userId).then(setDays).finally(() => setLoading(false));
  }, [userId]);

  const totalWords = days.reduce((sum, d) => sum + d.word_count, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("days.title")}</h1>
          {!loading && (
            <p className="text-sm text-gray-400 mt-0.5">
              {t("list.wordCount", { count: totalWords })}
            </p>
          )}
        </div>
        <Link
          to={`${basePath}/words/new`}
          className="flex items-center gap-1.5 bg-brand-600 text-white font-semibold px-3 py-2 rounded-xl text-sm hover:bg-brand-700 transition-colors"
        >
          <Plus size={15} />
          {t("nav.addWord")}
        </Link>
      </div>

      {/* Day Grid */}
      {loading ? (
        <p className="text-center py-20 text-gray-400">{t("common.loading")}</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {days.map((day) => (
            <DayCard key={day.day_number} day={day} basePath={basePath} />
          ))}
        </div>
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
        hasWords
          ? "bg-white border-brand-200 text-gray-900"
          : "bg-gray-50 border-gray-100 text-gray-400"
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
