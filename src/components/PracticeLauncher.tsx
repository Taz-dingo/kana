interface PracticeLauncherProps {
  dueCount: number;
  newCount: number;
  weakCount: number;
  onClose: () => void;
  onStartReview: () => void;
  onStartLearn: () => void;
  onStartWeak: () => void;
}

export default function PracticeLauncher({
  dueCount,
  newCount,
  weakCount,
  onClose,
  onStartReview,
  onStartLearn,
  onStartWeak,
}: PracticeLauncherProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/35 px-4 py-6" onClick={onClose}>
      <div
        className="w-full max-w-4xl border border-stone-300 bg-[#fbf8f1] shadow-[0_24px_80px_rgba(28,25,23,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-stone-300 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Study Panel</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-900">今天先学什么</h2>
              <p className="mt-2 text-sm leading-7 text-stone-500">
                先处理到期复习，再补少量新字符；如果最近有反复错误的字符，也可以单独做一轮弱项强化。
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-600 transition hover:border-stone-500 hover:text-stone-900"
            >
              关闭
            </button>
          </div>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-7 sm:py-6">
          <button
            type="button"
            onClick={onStartReview}
            disabled={dueCount === 0}
            className="border border-stone-300 bg-white p-5 text-left transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="text-xs uppercase tracking-[0.28em] text-stone-500">Review</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-stone-900">{dueCount}</div>
            <div className="mt-3 text-sm leading-7 text-stone-600">
              优先练习今天到期的字符，让系统先处理最可能遗忘的内容。
            </div>
            <div className="mt-5 text-sm text-stone-500">模式：复习优先</div>
          </button>

          <button
            type="button"
            onClick={onStartLearn}
            disabled={newCount === 0}
            className="border border-stone-300 bg-white p-5 text-left transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="text-xs uppercase tracking-[0.28em] text-stone-500">Learn</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-stone-900">{newCount}</div>
            <div className="mt-3 text-sm leading-7 text-stone-600">
              从未正式进入记忆系统的字符会先从这里开始，数量保持轻量，避免复习债过快膨胀。
            </div>
            <div className="mt-5 text-sm text-stone-500">模式：新学训练</div>
          </button>

          <button
            type="button"
            onClick={onStartWeak}
            disabled={weakCount === 0}
            className="border border-stone-300 bg-white p-5 text-left transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="text-xs uppercase tracking-[0.28em] text-stone-500">Weak Spots</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-stone-900">{weakCount}</div>
            <div className="mt-3 text-sm leading-7 text-stone-600">
              最近答错较多或稳定度较低的字符会集中出现在这里，适合做一轮强化记忆。
            </div>
            <div className="mt-5 text-sm text-stone-500">模式：弱项强化</div>
          </button>
        </div>
      </div>
    </div>
  );
}
