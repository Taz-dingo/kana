import { useMemo, useState } from "react";
import type { KanaEntry, KanaType } from "../data/kana";
import { getKanaChar } from "../data/kana";
import type { WeakKanaInsight } from "../lib/memory/analytics";

type WeakFilter = "all" | "due" | "again" | "repeat" | "learning";

interface WeakKanaPanelProps {
  entries: KanaEntry[];
  activeType: KanaType;
  insights: WeakKanaInsight[];
  onOpenDetails: (entry: KanaEntry) => void;
  onStartWeakPractice: () => void;
}

function formatRelativeDay(isoString: string | null, now: Date) {
  if (!isoString) {
    return "暂无记录";
  }

  const value = new Date(isoString);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const current = new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const diffDays = Math.round((current - today) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    return "今天";
  }

  if (diffDays === -1) {
    return "昨天";
  }

  if (diffDays === 1) {
    return "明天";
  }

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} 天前`;
  }

  return `${diffDays} 天后`;
}

function isDue(insight: WeakKanaInsight, now: Date) {
  return Boolean(insight.dueAt && new Date(insight.dueAt).getTime() <= now.getTime());
}

function getWeakReason(insight: WeakKanaInsight, now: Date) {
  if (insight.lastResult === "again") {
    return "上次没有回忆出来，适合马上再看一遍。";
  }

  if (insight.lapseCount >= 3) {
    return `已经失误 ${insight.lapseCount} 次，值得单独强化。`;
  }

  if (insight.status === "learning") {
    return "还在学习阶段，短间隔再练一轮会更稳。";
  }

  if (isDue(insight, now)) {
    return "已经到复习时间，可以先处理。";
  }

  if (insight.lastResult === "hard") {
    return "虽然答对了，但回忆比较吃力。";
  }

  return "目前还不够稳，可以穿插复习。";
}

function getStatusLabel(insight: WeakKanaInsight, now: Date) {
  if (isDue(insight, now)) {
    return "待复习";
  }

  if (insight.lastResult === "again") {
    return "刚答错";
  }

  if (insight.status === "learning") {
    return "学习中";
  }

  if (insight.lastResult === "hard") {
    return "偏吃力";
  }

  return "需巩固";
}

function getInsightTags(insight: WeakKanaInsight, now: Date) {
  const tags: string[] = [];

  if (isDue(insight, now)) {
    tags.push("到期");
  }

  if (insight.lastResult === "again") {
    tags.push("答错");
  }

  if (insight.lapseCount >= 2) {
    tags.push("重复失误");
  }

  if (insight.status === "learning") {
    tags.push("学习中");
  }

  if (insight.lastResult === "hard") {
    tags.push("偏难");
  }

  return tags.slice(0, 3);
}

function matchesFilter(insight: WeakKanaInsight, filter: WeakFilter, now: Date) {
  switch (filter) {
    case "due":
      return isDue(insight, now);
    case "again":
      return insight.lastResult === "again";
    case "repeat":
      return insight.lapseCount >= 2;
    case "learning":
      return insight.status === "learning";
    default:
      return true;
  }
}

const filterLabels: Record<WeakFilter, string> = {
  all: "全部",
  due: "待复习",
  again: "刚答错",
  repeat: "重复失误",
  learning: "学习中",
};

export default function WeakKanaPanel({
  entries,
  activeType,
  insights,
  onOpenDetails,
  onStartWeakPractice,
}: WeakKanaPanelProps) {
  const [filter, setFilter] = useState<WeakFilter>("all");
  const now = new Date();

  const weakEntries = useMemo(
    () =>
      insights
        .map((insight) => {
          const entry = entries.find((item) => item.id === insight.itemId);
          return entry ? { entry, insight } : null;
        })
        .filter((item): item is { entry: KanaEntry; insight: WeakKanaInsight } => Boolean(item)),
    [entries, insights]
  );

  const summary = useMemo(
    () => ({
      total: weakEntries.length,
      dueCount: weakEntries.filter(({ insight }) => isDue(insight, now)).length,
      againCount: weakEntries.filter(({ insight }) => insight.lastResult === "again").length,
      learningCount: weakEntries.filter(({ insight }) => insight.status === "learning").length,
    }),
    [now, weakEntries]
  );

  const visibleEntries = useMemo(
    () => weakEntries.filter(({ insight }) => matchesFilter(insight, filter, now)),
    [filter, now, weakEntries]
  );

  return (
    <section className="border border-stone-300/80 bg-white/72 p-5">
      <div className="flex items-end justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">重点回看</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-stone-900">需要重点回看的字符</h2>
        </div>
        <button
          type="button"
          onClick={onStartWeakPractice}
          disabled={weakEntries.length === 0}
          className="rounded-full border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          练这一组
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-stone-200 py-4 text-sm text-stone-600">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-stone-500">弱项</div>
          <div className="mt-1 text-2xl font-semibold text-stone-900">{summary.total}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-stone-500">待复习</div>
          <div className="mt-1 text-2xl font-semibold text-stone-900">{summary.dueCount}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-stone-500">刚答错</div>
          <div className="mt-1 text-2xl font-semibold text-stone-900">{summary.againCount}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-stone-500">学习中</div>
          <div className="mt-1 text-2xl font-semibold text-stone-900">{summary.learningCount}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(filterLabels) as WeakFilter[]).map((item) => {
          const isActive = item === filter;

          return (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                isActive
                  ? "border-stone-900 bg-stone-900 text-stone-50"
                  : "border-stone-300 bg-white text-stone-600 hover:border-stone-500 hover:text-stone-900"
              }`}
            >
              {filterLabels[item]}
            </button>
          );
        })}
      </div>

      {visibleEntries.length > 0 ? (
        <div className="mt-4 divide-y divide-stone-200 border-t border-stone-200">
          {visibleEntries.map(({ entry, insight }) => (
            <article key={entry.id} className="py-4 first:pt-5 last:pb-1">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onOpenDetails(entry)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      lang="ja-JP"
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-stone-100 text-3xl font-semibold text-stone-900"
                    >
                      {getKanaChar(entry, activeType)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-medium text-stone-900">{entry.romaji}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.22em] text-stone-500">
                        {entry.row} · {entry.column.toUpperCase()} · {activeType === "hiragana" ? entry.katakana : entry.hiragana}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-stone-600">{getWeakReason(insight, now)}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
                    {getInsightTags(insight, now).map((tag) => (
                      <span key={tag} className="rounded-full border border-stone-300 bg-white px-2.5 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>

                <div className="shrink-0 text-right">
                  <div className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs text-stone-600">
                    {getStatusLabel(insight, now)}
                  </div>
                  <div className="mt-3 text-xs leading-5 text-stone-500">
                    <div>上次：{formatRelativeDay(insight.lastReviewedAt, now)}</div>
                    <div>下次：{formatRelativeDay(insight.dueAt, now)}</div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : weakEntries.length > 0 ? (
        <div className="mt-4 border-t border-stone-200 pt-4 text-sm leading-7 text-stone-500">
          当前筛选下没有字符，可以切回“全部”看看。
        </div>
      ) : (
        <div className="mt-4 border-t border-stone-200 pt-4 text-sm leading-7 text-stone-500">
          先做一轮学习或复习，这里会慢慢留下需要重点回看的字符。
        </div>
      )}
    </section>
  );
}
