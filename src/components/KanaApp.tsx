import { useMemo, useState } from "react";
import type { KanaEntry, KanaType } from "../data/kana";
import { getKanaChar, kanaRows } from "../data/kana";
import KanaGrid from "./KanaGrid";
import DetailPanel from "./DetailPanel";

export default function KanaApp() {
  const [type, setType] = useState<KanaType>("hiragana");
  const [selectedKana, setSelectedKana] = useState<KanaEntry | null>(null);

  const totalEntries = useMemo(
    () => kanaRows.reduce((count, row) => count + row.entries.filter(Boolean).length, 0),
    []
  );

  const currentFocusChar = selectedKana ? getKanaChar(selectedKana, type) : "—";

  const openFirstEntry = () => {
    const firstEntry = kanaRows[0]?.entries.find(Boolean);
    if (firstEntry) {
      setSelectedKana(firstEntry);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-stone-800">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="border-b border-stone-300/80 pb-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Kana Study</p>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <h1 className="text-5xl font-semibold tracking-[-0.04em] text-stone-900 sm:text-6xl">
                  五十音
                </h1>
                <span className="pb-2 text-base text-stone-500">平假名与片假名学习</span>
              </div>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
                先看整体，再点开单字。用更安静、更清楚的方式记住五十音，而不是把它做成一块炫技面板。
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={openFirstEntry}
                  className="rounded-full bg-stone-900 px-5 py-2.5 font-medium text-stone-50 transition hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
                >
                  从第一个字符开始
                </button>
                <div className="rounded-full border border-stone-300 bg-white/60 px-4 py-2.5 text-stone-500">
                  总览 → 对照 → 发音
                </div>
              </div>
            </div>

            <div className="grid gap-5 border border-stone-300/80 bg-white/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-stone-500">View</p>
                  <p className="mt-2 text-lg font-medium text-stone-900">
                    {type === "hiragana" ? "平假名总览" : "片假名总览"}
                  </p>
                </div>
                <div className="inline-flex rounded-full bg-stone-100 p-1">
                  <button
                    type="button"
                    onClick={() => setType("hiragana")}
                    className={`rounded-full px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-stone-400 ${
                      type === "hiragana"
                        ? "bg-stone-900 text-stone-50"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                    aria-pressed={type === "hiragana"}
                  >
                    平假名
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("katakana")}
                    className={`rounded-full px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-stone-400 ${
                      type === "katakana"
                        ? "bg-stone-900 text-stone-50"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                    aria-pressed={type === "katakana"}
                  >
                    片假名
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-stone-200 pt-4 text-sm">
                <div>
                  <div className="text-stone-500">已收录字符</div>
                  <div className="mt-2 text-3xl font-semibold text-stone-900">{totalEntries}</div>
                </div>
                <div>
                  <div className="text-stone-500">当前焦点</div>
                  <div className="mt-2 text-3xl font-semibold text-stone-900">{selectedKana ? selectedKana.romaji : "—"}</div>
                </div>
              </div>

              <div className="grid gap-3 border-t border-stone-200 pt-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-stone-500">Current</div>
                    <div className="mt-2 text-6xl font-semibold leading-none tracking-[-0.05em] text-stone-900">
                      {currentFocusChar}
                    </div>
                  </div>
                  <div className="text-right text-sm text-stone-500">
                    <div>{type === "hiragana" ? "主视图：平假名" : "主视图：片假名"}</div>
                    <div className="mt-1">{selectedKana ? "已选中单字，可直接查看详情" : "先点任意字符打开详情"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-8 lg:pt-10">
          <div className="mb-6 flex flex-col gap-4 border-b border-stone-300/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Overview</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-stone-900">五十音总览</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-stone-500">
              保留真实空位，减少误导；用更稳定的行列节奏帮助记忆。点击任意字符即可进入详情、对照另一套写法并播放发音。
            </p>
          </div>

          <KanaGrid
            rows={kanaRows}
            type={type}
            onKanaClick={setSelectedKana}
            selectedKanaId={selectedKana?.id}
          />
        </main>
      </div>

      <DetailPanel kana={selectedKana} activeType={type} onClose={() => setSelectedKana(null)} />
    </div>
  );
}
