import { useMemo, useState } from "react";
import type { KanaEntry, KanaType } from "../data/kana";
import { getKanaChar, kanaRows } from "../data/kana";
import { getDueKanaIds } from "../lib/memory/scheduler";
import { useKanaMemory } from "../hooks/useKanaMemory";
import DetailPanel from "./DetailPanel";
import KanaGrid from "./KanaGrid";
import PracticeLauncher from "./PracticeLauncher";
import PracticeSession from "./PracticeSession";

type PracticeMode = "review" | "learn" | "weak" | null;

export default function KanaApp() {
  const [type, setType] = useState<KanaType>("hiragana");
  const [selectedKana, setSelectedKana] = useState<KanaEntry | null>(null);
  const [isPracticeLauncherOpen, setIsPracticeLauncherOpen] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(null);

  const totalEntries = useMemo(
    () => kanaRows.reduce((count, row) => count + row.entries.filter(Boolean).length, 0),
    []
  );

  const orderedEntries = useMemo(
    () => kanaRows.flatMap((row) => row.entries.filter((entry): entry is KanaEntry => Boolean(entry))),
    []
  );

  const { counts, isReady, reviewKana, states, todayProgress, weakKanaIds } = useKanaMemory(
    orderedEntries.map((entry) => entry.id)
  );

  const dueEntryIds = useMemo(() => getDueKanaIds(states), [states]);
  const newEntryIds = useMemo(
    () => orderedEntries.map((entry) => entry.id).filter((id) => !states[id] || states[id].status === "new"),
    [orderedEntries, states]
  );
  const learnEntryIds = useMemo(() => newEntryIds.slice(0, 8), [newEntryIds]);

  const selectedIndex = useMemo(() => {
    if (!selectedKana) {
      return -1;
    }

    return orderedEntries.findIndex((entry) => entry.id === selectedKana.id);
  }, [orderedEntries, selectedKana]);

  const previousKana = selectedIndex > 0 ? orderedEntries[selectedIndex - 1] : null;
  const nextKana = selectedIndex >= 0 && selectedIndex < orderedEntries.length - 1 ? orderedEntries[selectedIndex + 1] : null;
  const currentFocusChar = selectedKana ? getKanaChar(selectedKana, type) : "—";
  const progressLabel = selectedIndex >= 0 ? `${selectedIndex + 1} / ${orderedEntries.length}` : `0 / ${orderedEntries.length}`;
  const canOpenPractice = isReady && (dueEntryIds.length > 0 || newEntryIds.length > 0 || weakKanaIds.length > 0);
  const sessionEntryIds =
    practiceMode === "review"
      ? dueEntryIds
      : practiceMode === "learn"
        ? learnEntryIds
        : practiceMode === "weak"
          ? weakKanaIds
          : [];

  const openFirstEntry = () => {
    const firstEntry = orderedEntries[0];
    if (firstEntry) {
      setSelectedKana(firstEntry);
    }
  };

  const closePractice = () => {
    setPracticeMode(null);
    setIsPracticeLauncherOpen(false);
  };

  const startReview = () => {
    setPracticeMode("review");
    setIsPracticeLauncherOpen(false);
  };

  const startLearn = () => {
    setPracticeMode("learn");
    setIsPracticeLauncherOpen(false);
  };

  const startWeak = () => {
    setPracticeMode("weak");
    setIsPracticeLauncherOpen(false);
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
                <button
                  type="button"
                  onClick={() => setIsPracticeLauncherOpen(true)}
                  disabled={!canOpenPractice}
                  className="rounded-full border border-stone-300 bg-white/80 px-4 py-2.5 text-stone-700 transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  进入学习面板
                </button>
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
                    <div lang="ja-JP" className="mt-2 text-6xl font-semibold leading-none tracking-[-0.05em] text-stone-900">
                      {currentFocusChar}
                    </div>
                  </div>
                  <div className="text-right text-sm text-stone-500">
                    <div>{type === "hiragana" ? "主视图：平假名" : "主视图：片假名"}</div>
                    <div className="mt-1">{selectedKana ? `学习进度：${progressLabel}` : "先点任意字符打开详情"}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs text-stone-500">
                  <span>{selectedKana ? `上一项：${previousKana?.romaji ?? "—"}` : "还未开始连续浏览"}</span>
                  <span>{selectedKana ? `下一项：${nextKana?.romaji ?? "已到最后一个"}` : `共 ${orderedEntries.length} 个字符`}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-stone-200 pt-4 text-sm">
                <div>
                  <div className="text-stone-500">今日待复习</div>
                  <div className="mt-2 text-3xl font-semibold text-stone-900">{isReady ? counts.dueCount : "—"}</div>
                </div>
                <div>
                  <div className="text-stone-500">待学习新字符</div>
                  <div className="mt-2 text-3xl font-semibold text-stone-900">{isReady ? counts.newCount : "—"}</div>
                </div>
                <div>
                  <div className="text-stone-500">弱项强化</div>
                  <div className="mt-2 text-3xl font-semibold text-stone-900">{isReady ? weakKanaIds.length : "—"}</div>
                </div>
              </div>

              <div className="grid gap-3 border-t border-stone-200 pt-4 text-sm">
                <div className="text-stone-500">今日进度</div>
                <div className="flex flex-wrap gap-2 text-stone-600">
                  <span className="rounded-full border border-stone-300 bg-white px-3 py-1">已复习 {isReady ? todayProgress.reviewedTodayCount : "—"}</span>
                  <span className="rounded-full border border-stone-300 bg-white px-3 py-1">已引入 {isReady ? todayProgress.introducedTodayCount : "—"}</span>
                  {isReady && todayProgress.clearedDue ? (
                    <span className="rounded-full border border-emerald-700 bg-emerald-50 px-3 py-1 text-emerald-700">今日复习已清空</span>
                  ) : null}
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

      <DetailPanel
        kana={selectedKana}
        activeType={type}
        onClose={() => setSelectedKana(null)}
        onPrevious={previousKana ? () => setSelectedKana(previousKana) : undefined}
        onNext={nextKana ? () => setSelectedKana(nextKana) : undefined}
        previousKana={previousKana}
        nextKana={nextKana}
        currentIndex={selectedIndex}
        totalCount={orderedEntries.length}
      />

      {isPracticeLauncherOpen ? (
        <PracticeLauncher
          dueCount={counts.dueCount}
          newCount={counts.newCount}
          weakCount={weakKanaIds.length}
          onClose={() => setIsPracticeLauncherOpen(false)}
          onStartReview={startReview}
          onStartLearn={startLearn}
          onStartWeak={startWeak}
        />
      ) : null}

      {practiceMode ? (
        <PracticeSession
          entries={orderedEntries}
          activeType={type}
          entryIds={sessionEntryIds}
          mode={practiceMode === "weak" ? "review" : practiceMode}
          onClose={closePractice}
          onReview={reviewKana}
          todayProgress={todayProgress}
        />
      ) : null}
    </div>
  );
}
