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
              <p className="text-xs uppercase tracking-[0.32em] text-stone-500">今日学习</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-900">今天先学什么</h2>
              <p className="mt-2 text-sm leading-7 text-stone-500">
                先把今天该回看的内容过一遍，再补少量新字符；如果最近总有几项不稳，也可以单独再练一轮。
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
            <div className="text-xs uppercase tracking-[0.28em] text-stone-500">今日复习</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-stone-900">{dueCount}</div>
            <div className="mt-3 text-sm leading-7 text-stone-600">
              先把今天该复习的字符过一遍，保持记忆不断线。
            </div>
            <div className="mt-5 text-sm text-stone-500">适合先开始</div>
          </button>

          <button
            type="button"
            onClick={onStartLearn}
            disabled={newCount === 0}
            className="border border-stone-300 bg-white p-5 text-left transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="text-xs uppercase tracking-[0.28em] text-stone-500">新字符</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-stone-900">{newCount}</div>
            <div className="mt-3 text-sm leading-7 text-stone-600">
              从还没正式练过的字符开始，每次少量推进，更容易记稳。
            </div>
            <div className="mt-5 text-sm text-stone-500">适合慢慢加新内容</div>
          </button>

          <button
            type="button"
            onClick={onStartWeak}
            disabled={weakCount === 0}
            className="border border-stone-300 bg-white p-5 text-left transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="text-xs uppercase tracking-[0.28em] text-stone-500">重点回看</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-stone-900">{weakCount}</div>
            <div className="mt-3 text-sm leading-7 text-stone-600">
              把最近容易出错的字符单独拎出来，再补一轮。
            </div>
            <div className="mt-5 text-sm text-stone-500">适合集中补弱项</div>
          </button>
        </div>
      </div>
    </div>
  );
}
