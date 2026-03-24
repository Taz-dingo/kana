import { getMemoryCounts } from "./scheduler";
import type { KanaMemoryStateMap } from "./types";

function isSameLocalDay(isoString: string | null, now: Date) {
  if (!isoString) {
    return false;
  }

  const date = new Date(isoString);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function getWeakKanaIds(states: KanaMemoryStateMap, limit = 8) {
  return Object.values(states)
    .filter((state) => state.reviewCount > 0)
    .sort((left, right) => {
      const leftScore = left.lapseCount * 10 + left.difficulty * 2 - left.stability;
      const rightScore = right.lapseCount * 10 + right.difficulty * 2 - right.stability;
      return rightScore - leftScore;
    })
    .slice(0, limit)
    .map((state) => state.kanaId);
}

export function getTodayProgress(states: KanaMemoryStateMap, allKanaIds: string[], now = new Date()) {
  const reviewedTodayCount = Object.values(states).filter((state) => isSameLocalDay(state.lastReviewedAt, now)).length;
  const introducedTodayCount = Object.values(states).filter((state) => isSameLocalDay(state.introducedAt, now)).length;
  const counts = getMemoryCounts(states, allKanaIds, now);
  const clearedDue = counts.dueCount === 0 && reviewedTodayCount > 0;
  const touchedToday = reviewedTodayCount > 0 || introducedTodayCount > 0;

  return {
    reviewedTodayCount,
    introducedTodayCount,
    clearedDue,
    touchedToday,
  };
}
