import type { KanaEntry, KanaType } from "../data/kana";
import { getKanaChar } from "../data/kana";
import type { WeakKanaInsight } from "../lib/memory/analytics";

interface WeakKanaPanelProps {
  entries: KanaEntry[];
  activeType: KanaType;
  insights: WeakKanaInsight[];
  onOpenDetails: (entry: KanaEntry) => void;
  onStartWeakPractice: () => void;
}

function formatRelativeDay(isoString: string | null, now: Date) {
  if (!isoString) {
    return "还没有复习记录";
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

function getWeakReason(insight: WeakKanaInsight, now: Date) {
  if (insight.lastResult === "again") {
    return "上次这一项没有回忆出来，建议尽快回看。";
  }

  if (insight.lapseCount >= 3) {
    return `累计失误 ${insight.lapseCount} 次，已经形成重复薄弱点。`;
  }

  if (insight.status === "learning") {
    return "还处在学习期，稳定度不够，适合在短间隔内再练一轮。";
  }

  if (insight.dueAt && new Date(insight.dueAt).getTime() <= now.getTime()) {
    return "已经到复习时间了，先把它重新拉回记忆。";
  }

  if (insight.difficulty >= 7) {
    return "主观难度偏高，适合单独拿出来强化辨认。";
  }

  if (insight.lastResult === "hard") {
    return "虽然答对了，但上次回忆比较吃力，值得趁现在再巩固。";
  }

  return "稳定度还不够高，单独回看会比混在大盘里更容易补短板。";
}

function getStatusLabel(insight: WeakKanaInsight, now: Date) {
  if (insight.dueAt && new Date(insight.dueAt).getTime() <= now.getTime()) {
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

export default function WeakKanaPanel({
  entries,
  activeType,
  insights,
  onOpenDetails,
  onStartWeakPractice,
}: WeakKanaPanelProps) {
  const now = new Date();
  const weakEntries = insights
    .map((insight) => {
      const entry = entries.find((item) => item.id === insight.itemId);
      return entry ? { entry, insight } : null;
    })
    .filter((item): item is { entry: KanaEntry; insight: WeakKanaInsight } => Boolean(item));

  return (
    <section className="mb-8 border border-stone-300/80 bg-white/70 p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Weak Review</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-900">跨 session 弱项回看</h2>
          <p className="mt-3 text-sm leading-7 text-stone-500">
            这里会保留最近一段时间里最容易反复出错、最费力或已经到期的字符。它不是一次性错题页，而是把真正需要补的薄弱点单独拎出来。
          </p>
        </div>
        <button
          type="button"
          onClick={onStartWeakPractice}
          disabled={weakEntries.length === 0}
          className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-700 transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          练这批弱项
        </button>
      </div>

      {weakEntries.length > 0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {weakEntries.map(({ entry, insight }) => (
            <article key={entry.id} className="border border-stone-300 bg-[#fcfaf5] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-stone-500">{entry.row}</div>
                  <div className="mt-3 flex items-end gap-3">
                    <div lang="ja-JP" className="text-5xl font-semibold leading-none tracking-[-0.05em] text-stone-900">
                      {getKanaChar(entry, activeType)}
                    </div>
                    <div className="pb-1 text-sm text-stone-500">
                      {entry.romaji} · {activeType === "hiragana" ? entry.katakana : entry.hiragana}
                    </div>
                  </div>
                </div>
                <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs text-stone-600">
                  {getStatusLabel(insight, now)}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-stone-600">{getWeakReason(insight, now)}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-sm text-stone-600">
                <span className="rounded-full border border-stone-300 bg-white px-3 py-1">
                  失误 {insight.lapseCount} 次
                </span>
                <span className="rounded-full border border-stone-300 bg-white px-3 py-1">
                  难度 {insight.difficulty.toFixed(1)}
                </span>
                <span className="rounded-full border border-stone-300 bg-white px-3 py-1">
                  稳定度 {insight.stability.toFixed(1)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500">
                <span>上次练习：{formatRelativeDay(insight.lastReviewedAt, now)}</span>
                <span>下次复习：{formatRelativeDay(insight.dueAt, now)}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onOpenDetails(entry)}
                  className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-700"
                >
                  查看详情
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 border border-dashed border-stone-300 bg-[#fcfaf5] p-5 text-sm leading-7 text-stone-500">
          目前还没有形成跨 session 弱项。先做一轮学习或复习，系统会在这里逐步沉淀出需要单独回看的字符。
        </div>
      )}
    </section>
  );
}
