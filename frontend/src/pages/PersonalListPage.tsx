import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { personalApi } from "../services/api";
import type { UserSummary } from "../services/api";

export function PersonalListPage() {
  const { t } = useTranslation();
  const [summaries, setSummaries] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    personalApi.summary().then(setSummaries).finally(() => setLoading(false));
  }, []);

  const countMap = new Map(summaries.map((s) => [s.user_id, s.word_count]));

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
            return (
              <Link
                key={uid}
                to={`/personal/${uid}`}
                className="flex flex-col items-center justify-center rounded-2xl border bg-white border-gray-100 shadow-sm p-5 text-center transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand-200"
              >
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center mb-2">
                  <User size={20} className="text-brand-600" />
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {t("personal.user", { n: uid })}
                </span>
                <span className={`text-xs mt-0.5 ${count > 0 ? "text-brand-600 font-medium" : "text-gray-300"}`}>
                  {count > 0 ? t("personal.wordCount", { count }) : t("personal.noWords")}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
