import type { KanaEntry, KanaRow, KanaType } from "../data/kana";
import { kanaColumns } from "../data/kana";
import KanaCell from "./KanaCell";

interface KanaGridProps {
  rows: KanaRow[];
  type: KanaType;
  onKanaClick: (kana: KanaEntry) => void;
  selectedKanaId?: string;
}

export default function KanaGrid({ rows, type, onKanaClick, selectedKanaId }: KanaGridProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[56px_repeat(5,minmax(0,1fr))] gap-3 text-center text-[11px] font-medium uppercase tracking-[0.3em] text-stone-500 sm:grid-cols-[72px_repeat(5,minmax(0,1fr))] lg:grid-cols-[88px_repeat(5,minmax(0,1fr))]">
        <div />
        {kanaColumns.map((column) => (
          <div key={column}>{column}</div>
        ))}
      </div>

      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[56px_repeat(5,minmax(0,1fr))] gap-3 sm:grid-cols-[72px_repeat(5,minmax(0,1fr))] lg:grid-cols-[88px_repeat(5,minmax(0,1fr))]"
        >
          <div className="flex items-center justify-start border-t border-stone-300/80 pt-3 text-sm text-stone-600 sm:text-base">
            {row.label}
          </div>
          {row.entries.map((entry, index) => (
            <KanaCell
              key={entry?.id ?? `${row.id}-${kanaColumns[index]}-empty`}
              kana={entry}
              type={type}
              isSelected={entry?.id === selectedKanaId}
              onClick={onKanaClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
