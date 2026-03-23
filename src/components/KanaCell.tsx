import type { KanaEntry, KanaType } from "../data/kana";
import { getKanaChar } from "../data/kana";

interface KanaCellProps {
  kana: KanaEntry | null;
  type: KanaType;
  isSelected?: boolean;
  onClick: (kana: KanaEntry) => void;
}

export default function KanaCell({ kana, type, isSelected = false, onClick }: KanaCellProps) {
  if (!kana) {
    return (
      <div
        aria-hidden="true"
        className="flex min-h-[120px] items-center justify-center border-t border-dashed border-stone-300/80 text-[11px] uppercase tracking-[0.3em] text-stone-400 sm:min-h-[140px]"
      >
        —
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick(kana)}
      className={`flex min-h-[120px] flex-col justify-between border-t bg-white/55 px-3 py-3 text-left transition sm:min-h-[140px] sm:px-4 sm:py-4 ${
        isSelected
          ? "border-stone-900 shadow-[inset_0_0_0_1px_rgba(28,25,23,0.16)]"
          : "border-stone-300/80 hover:border-stone-500 hover:bg-white"
      }`}
      aria-label={`${kana.romaji}，${type === "hiragana" ? "平假名" : "片假名"}`}
    >
      <div className="flex items-start justify-between gap-3 text-[11px] uppercase tracking-[0.24em] text-stone-400">
        <span>{kana.column}</span>
        <span className="truncate text-right">{kana.row}</span>
      </div>

      <div className="mt-3 flex-1">
        <div className="text-[46px] font-semibold leading-none tracking-[-0.04em] text-stone-900 sm:text-[58px]">
          {getKanaChar(kana, type)}
        </div>
      </div>

      <div className="mt-4 text-sm uppercase tracking-[0.28em] text-stone-500">{kana.romaji}</div>
    </button>
  );
}
