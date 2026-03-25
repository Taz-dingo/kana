import { useEffect, useMemo, useState } from "react";
import type { KanaEntry, KanaType } from "../data/kana";
import { getKanaChar } from "../data/kana";
import type { KanaReviewResult, TodayProgress } from "../lib/memory/types";

interface PracticeSessionProps {
  entries: KanaEntry[];
  activeType: KanaType;
  entryIds: string[];
  mode: "review" | "learn";
  onClose: () => void;
  onReview: (kanaId: string, result: KanaReviewResult) => void;
  todayProgress: TodayProgress;
}

type QuestionType = "romaji_to_kana" | "kana_to_romaji";

interface PracticeQuestion {
  entry: KanaEntry;
  choices: KanaEntry[];
  questionType: QuestionType;
}

interface PracticeRecord {
  kanaId: string;
  correct: boolean;
}

function shuffleItems<T>(items: T[]) {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }

  return clone;
}

function buildQuestion(entries: KanaEntry[], entryId: string, askedCount: number): PracticeQuestion | null {
  const entry = entries.find((item) => item.id === entryId);

  if (!entry) {
    return null;
  }

  const distractors = shuffleItems(entries.filter((item) => item.id !== entry.id)).slice(0, 3);

  return {
    entry,
    choices: shuffleItems([entry, ...distractors]),
    questionType: askedCount % 2 === 0 ? "romaji_to_kana" : "kana_to_romaji",
  };
}

export default function PracticeSession({
  entries,
  activeType,
  entryIds,
  mode,
  onClose,
  onReview,
  todayProgress,
}: PracticeSessionProps) {
  const [queueIds, setQueueIds] = useState(entryIds);
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [records, setRecords] = useState<PracticeRecord[]>([]);

  useEffect(() => {
    setQueueIds(entryIds);
    setAskedIds([]);
    setSelectedChoiceId(null);
    setRecords([]);
  }, [entryIds, mode]);

  const remainingIds = useMemo(() => queueIds.filter((id) => !askedIds.includes(id)), [askedIds, queueIds]);
  const question = useMemo(
    () => (remainingIds[0] ? buildQuestion(entries, remainingIds[0], askedIds.length) : null),
    [askedIds.length, entries, remainingIds]
  );

  const isCorrect = selectedChoiceId === question?.entry.id;
  const correctCount = records.filter((record) => record.correct).length;
  const wrongIds = Array.from(new Set(records.filter((record) => !record.correct).map((record) => record.kanaId)));
  const wrongEntries = wrongIds
    .map((kanaId) => entries.find((entry) => entry.id === kanaId))
    .filter((entry): entry is KanaEntry => Boolean(entry));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleChoose = (choiceId: string) => {
    if (selectedChoiceId || !question) {
      return;
    }

    setSelectedChoiceId(choiceId);
    setRecords((current) => [
      ...current,
      {
        kanaId: question.entry.id,
        correct: choiceId === question.entry.id,
      },
    ]);
  };

  const handleRate = (result: KanaReviewResult) => {
    if (!question) {
      return;
    }

    onReview(question.entry.id, result);
    setAskedIds((current) => [...current, question.entry.id]);
    setSelectedChoiceId(null);
  };

  const handleRetryWrongAnswers = () => {
    setQueueIds(wrongIds);
    setAskedIds([]);
    setSelectedChoiceId(null);
    setRecords([]);
  };

  if (!question) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/35 px-4 py-6" onClick={onClose}>
        <div
          className="w-full max-w-2xl border border-stone-300 bg-[#fbf8f1] p-6 shadow-[0_24px_80px_rgba(28,25,23,0.16)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="text-xs uppercase tracking-[0.32em] text-stone-500">本轮结果</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-900">本轮完成</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="border border-stone-300 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-stone-500">本轮类型</div>
              <div className="mt-2 text-2xl font-semibold text-stone-900">{mode === "review" ? "复习" : "新学"}</div>
            </div>
            <div className="border border-stone-300 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-stone-500">答对</div>
              <div className="mt-2 text-2xl font-semibold text-stone-900">{correctCount}</div>
            </div>
            <div className="border border-stone-300 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-stone-500">答错</div>
              <div className="mt-2 text-2xl font-semibold text-stone-900">{wrongEntries.length}</div>
            </div>
          </div>

          <div className="mt-6 border border-stone-300 bg-white p-4">
            <div className="text-xs uppercase tracking-[0.28em] text-stone-500">今日进度</div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-stone-600">
              <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1">今日已复习 {todayProgress.reviewedTodayCount}</span>
              <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1">今日新学 {todayProgress.introducedTodayCount}</span>
              {todayProgress.clearedDue ? (
                <span className="rounded-full border border-emerald-700 bg-emerald-50 px-3 py-1 text-emerald-700">今日待复习已清空</span>
              ) : null}
            </div>
          </div>

          {wrongEntries.length > 0 ? (
            <div className="mt-6 border border-stone-300 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-stone-500">需要再看</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {wrongEntries.map((entry) => (
                  <div key={entry.id} className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-sm text-stone-600">
                    <span lang="ja-JP" className="mr-2 text-stone-900">{getKanaChar(entry, activeType)}</span>
                    {entry.romaji}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm leading-7 text-stone-600">这轮没有答错，这一批字符已经比较稳了。</p>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            {wrongEntries.length > 0 ? (
              <button
                type="button"
                onClick={handleRetryWrongAnswers}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-stone-500"
              >
                只练错题
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-700"
            >
              返回总览
            </button>
          </div>
        </div>
      </div>
    );
  }

  const promptTitle = question.questionType === "romaji_to_kana" ? "根据罗马音选字符" : "根据字符选读音";
  const promptBody =
    question.questionType === "romaji_to_kana"
      ? `从下面选出对应的 ${activeType === "hiragana" ? "平假名" : "片假名"}`
      : "从下面选出正确的罗马音";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/35 px-4 py-6" onClick={onClose}>
      <div
        className="w-full max-w-2xl border border-stone-300 bg-[#fbf8f1] shadow-[0_24px_80px_rgba(28,25,23,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-stone-300 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.32em] text-stone-500">练习</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-900">{promptTitle}</h2>
              <p className="mt-2 text-sm text-stone-500">
                这一轮：{mode === "review" ? "复习优先" : "新学训练"} · 还剩 {remainingIds.length} 个
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

        <div className="grid gap-6 px-5 py-5 sm:px-7 sm:py-6">
          <div className="border border-stone-300 bg-white p-5 text-center">
            <div className="text-xs uppercase tracking-[0.28em] text-stone-500">
              {question.questionType === "romaji_to_kana" ? "罗马音" : activeType === "hiragana" ? "平假名" : "片假名"}
            </div>
            {question.questionType === "romaji_to_kana" ? (
              <div className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-stone-900">{question.entry.romaji}</div>
            ) : (
              <div lang="ja-JP" className="mt-3 text-6xl font-semibold tracking-[-0.04em] text-stone-900">
                {getKanaChar(question.entry, activeType)}
              </div>
            )}
            <div className="mt-3 text-sm text-stone-500">{promptBody}</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {question.choices.map((choice, index) => {
              const isAnswer = selectedChoiceId !== null && choice.id === question.entry.id;
              const isPicked = choice.id === selectedChoiceId;
              const stateClass =
                selectedChoiceId === null
                  ? "border-stone-300 bg-white hover:border-stone-500 hover:bg-stone-50"
                  : isAnswer
                    ? "border-emerald-700 bg-emerald-50"
                    : isPicked
                      ? "border-amber-700 bg-amber-50"
                      : "border-stone-300 bg-white/70 opacity-70";

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleChoose(choice.id)}
                  disabled={selectedChoiceId !== null}
                  className={`border p-5 text-left transition ${stateClass}`}
                >
                  <div className="text-xs uppercase tracking-[0.28em] text-stone-500">选项 {index + 1}</div>
                  {question.questionType === "romaji_to_kana" ? (
                    <div lang="ja-JP" className="mt-4 text-6xl font-semibold leading-none text-stone-900">
                      {getKanaChar(choice, activeType)}
                    </div>
                  ) : (
                    <div className="mt-4 text-4xl font-semibold leading-none tracking-[-0.04em] text-stone-900">
                      {choice.romaji}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedChoiceId ? (
            <div className="border border-stone-300 bg-white p-5">
              <div className="text-sm leading-7 text-stone-600">
                {isCorrect
                  ? "答对了。选一个最贴近刚才回忆感觉的评价就好。"
                  : `选错了。正确答案是 ${question.questionType === "romaji_to_kana" ? `${getKanaChar(question.entry, activeType)}（${question.entry.romaji}）` : `${question.entry.romaji}（${getKanaChar(question.entry, activeType)}）`}。先把它重新记一遍。`}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {isCorrect ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRate("hard")}
                      className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-stone-500"
                    >
                      有点难
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRate("good")}
                      className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-700"
                    >
                      记住了
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRate("easy")}
                      className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-stone-500"
                    >
                      很轻松
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRate("again")}
                    className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-700"
                  >
                    没记住，继续
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
