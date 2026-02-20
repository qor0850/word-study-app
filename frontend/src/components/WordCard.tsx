import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Word } from "../services/api";
import { AudioButton } from "./AudioButton";

interface Props {
  word: Word;
  onDelete: (id: string) => void;
}

export function WordCard({ word, onDelete }: Props) {
  const { t } = useTranslation();

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/words/${word.id}`}
            className="text-xl font-bold text-gray-900 hover:text-brand-600 transition-colors"
          >
            {word.word}
          </Link>
          <AudioButton word={word.word} />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            to={`/words/${word.id}/edit`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            title={t("common.edit")}
          >
            <Pencil size={15} />
          </Link>
          <button
            onClick={() => onDelete(word.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title={t("common.delete")}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Meaning */}
      <p className="text-gray-700 text-sm leading-relaxed">{word.meaning}</p>

      {/* Example */}
      {word.example && (
        <p className="text-gray-400 text-sm italic">
          &ldquo;{word.example}&rdquo;
        </p>
      )}
    </article>
  );
}
