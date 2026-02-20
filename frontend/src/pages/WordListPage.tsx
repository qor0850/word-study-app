import { useEffect, useState, useCallback } from "react";
import { Search, X, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import type { Word } from "../services/api";
import { WordCard } from "../components/WordCard";

export function WordListPage() {
  const { t } = useTranslation();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const fetchWords = useCallback(async (q: string) => {
    setLoading(true);
    try {
      setWords(await api.list(q || undefined));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchWords(query);
  }, [fetchWords, query]);

  async function handleDelete(id: string) {
    if (!confirm(t("common.deleteConfirm"))) return;
    await api.delete(id);
    fetchWords(query);
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("list.searchPlaceholder")}
          className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500">
        {loading ? t("common.loading") : t("list.wordCount", { count: words.length })}
      </p>

      {/* List */}
      {!loading && words.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <BookOpen size={52} strokeWidth={1} />
          <p className="text-lg font-medium">{t("list.emptyTitle")}</p>
          <p className="text-sm">{t("list.emptySubtitle")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {words.map((w) => (
            <WordCard key={w.id} word={w} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
