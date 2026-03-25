import { useMemo, useState } from "react";
import type { KanaEntry, KanaType } from "../data/kana";
import { getKanaChar, kanaRows } from "../data/kana";
import { useKanaMemory } from "../hooks/useKanaMemory";
import DetailPanel from "./DetailPanel";
import KanaGrid from "./KanaGrid";
import PracticeLauncher from "./PracticeLauncher";
import PracticeSession from "./PracticeSession";
import WeakKanaPanel from "./WeakKanaPanel";

type PracticeMode = "review" | "learn" | "weak" | null;

export default function KanaApp() {
  const [type, setType] = useState<KanaType>("hiragana");
  const [focusedKana, setFocusedKana] = useState<KanaEntry | null>(null);
  const [detailKana, setDetailKana] = useState<KanaEntry | null>(null);
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

  const { counts, dueKanaIds, isReady, reviewKana, states, todayProgress, weakKanaIds, weakKanaInsights } = useKanaMemory(
    orderedEntries.map((entry) => entry.id)
  );

  const newEntryIds = useMemo(
    () => orderedEntries.map((entry) => entry.id).filter((id) => !states[id] || states[id].status === "new"),
    [orderedEntries, states]
  );
  const learnEntryIds = useMemo(() => newEntryIds.slice(0, 8), [newEntryIds]);

  const focusedIndex = useMemo(() => {
    if (!focusedKana) {
      return -1;
    }

    return orderedEntries.findIndex((entry) => entry.id === focusedKana.id);
  }, [orderedEntries, focusedKana]);

  const previousKana = focusedIndex > 0 ? orderedEntries[focusedIndex - 1] : null;
  const nextKana = focusedIndex >= 0 && focusedIndex < orderedEntries.length - 1 ? orderedEntries[focusedIndex + 1] : null;
  const currentFocusChar = focusedKana ? getKanaChar(focusedKana, type) : "—";
  const currentFocusLabel = focusedKana ? focusedKana.romaji : "还未选择";
  const progressLabel = focusedIndex >= 0 ? `${focusedIndex + 1} / ${orderedEntries.length}` : `0 / ${orderedEntries.length}`;
  const canOpenPractice = isReady && (dueKanaIds.length > 0 || newEntryIds.length > 0 || weakKanaIds.length > 0);
  const sessionEntryIds =
    practiceMode === "review"
      ? dueKanaIds
      : practiceMode === "learn"
        ? learnEntryIds
        : practiceMode === "weak"
          ? weakKanaIds
          : [];

  const focusFirstEntry = () => {
    const firstEntry = orderedEntries[0];
    if (firstEntry) {
      setFocusedKana(firstEntry);
    }
  };

  const openDetails = (entry: KanaEntry) => {
    setFocusedKana(entry);
    setDetailKana(entry);
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

  const focusPrevious = () => {
    if (!previousKana) {
      return;
    }

    setFocusedKana(previousKana);
    setDetailKana(previousKana);
  };

  const focusNext = () => {
    if (!nextKana) {
      return;
    }

    setFocusedKana(nextKana);
    setDetailKana(nextKana);
  };

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-stone-800">
      <header className="sticky top-0 z-30 border-b border-stone-300/80 bg-[#f7f3ea]/92 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-stone-500">假名学习</p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-stone-900 sm:text-4xl">五十音</h1>
              <span className="pb-1 text-sm text-stone-500">先看字形，再看详情，再做练习</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="inline-flex rounded-full bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => setType("hiragana")}
                className={`rounded-full px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-stone-400 ${
                  type === "hiragana" ? "bg-stone-900 text-stone-50" : "text-stone-600 hover:text-stone-900"
                }`}
                aria-pressed={type === "hiragana"}
              >
                平假名
              </button>
              <button
                type="button"
                onClick={() => setType("katakana")}
                className={`rounded-full px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-stone-400 ${
                  type === "katakana" ? "bg-stone-900 text-stone-50" : "text-stone-600 hover:text-stone-900"
                }`}
                aria-pressed={type === "katakana"}
              >
                片假名
              </button>
            </div>

            <button
              type="button"
              onClick={focusFirstEntry}
              className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-stone-500"
            >
              从头浏览
            </button>
            <button
              type="button"
              onClick={() => setIsPracticeLauncherOpen(true)}
              disabled={!canOpenPractice}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              开始练习
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start xl:grid-cols-[minmax(0,1fr)_400px]">
          <main className="min-w-0">
            <section className="border-b border-stone-300/80 pb-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-stone-500">字符表</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-stone-900">
                    {type === "hiragana" ? "平假名总览" : "片假名总览"}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
                    点击任意字符先在右侧聚焦；需要更多信息时，再打开完整详情。
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-stone-600 sm:grid-cols-4">
                  <div>
                    <div className="text-stone-500">总字符</div>
                    <div className="mt-1 text-2xl font-semibold text-stone-900">{totalEntries}</div>
                  </div>
                  <div>
                    <div className="text-stone-500">待复习</div>
                    <div className="mt-1 text-2xl font-semibold text-stone-900">{isReady ? counts.dueCount : "—"}</div>
                  </div>
                  <div>
                    <div className="text-stone-500">新字符</div>
                    <div className="mt-1 text-2xl font-semibold text-stone-900">{isReady ? counts.newCount : "—"}</div>
                  </div>
                  <div>
                    <div className="text-stone-500">重点回看</div>
                    <div className="mt-1 text-2xl font-semibold text-stone-900">{isReady ? weakKanaIds.length : "—"}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-5 lg:max-h-[calc(100svh-11rem)] lg:overflow-auto lg:pr-2">
              <KanaGrid
                rows={kanaRows}
                type={type}
                onKanaClick={setFocusedKana}
                selectedKanaId={focusedKana?.id}
              />
            </section>
          </main>

          <aside className="space-y-6 lg:sticky lg:top-[88px] lg:max-h-[calc(100svh-7rem)] lg:overflow-auto lg:pr-1">
            <section className="border border-stone-300/80 bg-white/72 p-5">
              <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-stone-500">当前字符</p>
                  <div className="mt-2 flex items-end gap-3">
                    <div lang="ja-JP" className="text-5xl font-semibold leading-none tracking-[-0.05em] text-stone-900">
                      {currentFocusChar}
                    </div>
                    <div className="pb-1 text-sm text-stone-500">{currentFocusLabel}</div>
                  </div>
                </div>
                <div className="text-right text-xs text-stone-500">
                  <div>{type === "hiragana" ? "视图：平假名" : "视图：片假名"}</div>
                  <div className="mt-1">进度 {progressLabel}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-stone-200 py-4 text-sm text-stone-600">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-500">今日进度</div>
                  <div className="mt-2">已复习 {isReady ? todayProgress.reviewedTodayCount : "—"}</div>
                  <div className="mt-1">新学 {isReady ? todayProgress.introducedTodayCount : "—"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-500">相邻字符</div>
                  <div className="mt-2">上一项 {focusedKana ? previousKana?.romaji ?? "—" : "—"}</div>
                  <div className="mt-1">下一项 {focusedKana ? nextKana?.romaji ?? "最后一项" : "—"}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {focusedKana ? (
                  <button
                    type="button"
                    onClick={() => setDetailKana(focusedKana)}
                    className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-700"
                  >
                    打开详情
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={focusFirstEntry}
                    className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-700"
                  >
                    先选一个字符
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsPracticeLauncherOpen(true)}
                  disabled={!canOpenPractice}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  选择练习
                </button>
                {isReady && todayProgress.clearedDue ? (
                  <span className="rounded-full border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    今日复习已清空
                  </span>
                ) : null}
              </div>
            </section>

            {isReady ? (
              <WeakKanaPanel
                entries={orderedEntries}
                activeType={type}
                insights={weakKanaInsights}
                onOpenDetails={openDetails}
                onStartWeakPractice={startWeak}
              />
            ) : null}
          </aside>
        </div>
      </div>

      <DetailPanel
        kana={detailKana}
        activeType={type}
        onClose={() => setDetailKana(null)}
        onPrevious={previousKana ? focusPrevious : undefined}
        onNext={nextKana ? focusNext : undefined}
        previousKana={previousKana}
        nextKana={nextKana}
        currentIndex={focusedIndex}
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
