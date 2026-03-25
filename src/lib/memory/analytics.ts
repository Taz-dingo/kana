import { getMemoryCounts, getMemoryCountsForItems } from "./scheduler";
import type {
  KanaMemoryStateMap,
  KanaMemoryStatus,
  KanaReviewResult,
  MemoryItemType,
  MemoryStateMap,
  TodayProgress,
} from "./types";

export interface WeakMemoryInsight {
  itemId: string;
  itemType: MemoryItemType;
  score: number;
  lapseCount: number;
  difficulty: number;
  stability: number;
  reviewCount: number;
  status: KanaMemoryStatus;
  lastResult: KanaReviewResult | null;
  lastReviewedAt: string | null;
  dueAt: string | null;
}

export type WeakKanaInsight = WeakMemoryInsight;

interface WeakInsightOptions {
  itemType?: MemoryItemType;
  limit?: number;
  now?: Date;
}

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

export function getWeakMemoryIds(states: MemoryStateMap, options: WeakInsightOptions = {}) {
  return getWeakMemoryInsights(states, options)
    .map((state) => state.itemId);
}

export function getWeakMemoryInsights(
  states: MemoryStateMap,
  { itemType, limit = 8, now = new Date() }: WeakInsightOptions = {}
): WeakMemoryInsight[] {
  const nowTime = now.getTime();

  return Object.values(states)
    .filter((state) => {
      if (itemType && state.itemType !== itemType) {
        return false;
      }

      if (state.reviewCount === 0) {
        return false;
      }

      const dueTime = state.dueAt ? new Date(state.dueAt).getTime() : null;
      const isDue = dueTime !== null && dueTime <= nowTime;

      return (
        state.lapseCount > 0 ||
        state.lastResult === "again" ||
        state.lastResult === "hard" ||
        state.difficulty >= 6 ||
        state.status === "learning" ||
        isDue
      );
    })
    .map((state) => ({
      itemId: state.itemId,
      itemType: state.itemType,
      score:
        state.lapseCount * 10 +
        state.difficulty * 2 -
        state.stability +
        (state.lastResult === "again" ? 6 : 0) +
        (state.lastResult === "hard" ? 2 : 0) +
        (state.status === "learning" ? 3 : 0),
      lapseCount: state.lapseCount,
      difficulty: state.difficulty,
      stability: state.stability,
      reviewCount: state.reviewCount,
      status: state.status,
      lastResult: state.lastResult,
      lastReviewedAt: state.lastReviewedAt,
      dueAt: state.dueAt,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((state) => ({
      itemId: state.itemId,
      itemType: state.itemType,
      score: state.score,
      lapseCount: state.lapseCount,
      difficulty: state.difficulty,
      stability: state.stability,
      reviewCount: state.reviewCount,
      status: state.status,
      lastResult: state.lastResult,
      lastReviewedAt: state.lastReviewedAt,
      dueAt: state.dueAt,
    }));
}

export function getWeakKanaIds(states: KanaMemoryStateMap, limit = 8) {
  return getWeakMemoryIds(states, {
    itemType: "kana",
    limit,
  });
}

export function getWeakKanaInsights(states: KanaMemoryStateMap, now = new Date(), limit = 8): WeakKanaInsight[] {
  return getWeakMemoryInsights(states, {
    itemType: "kana",
    now,
    limit,
  });
}

export function getTodayProgressForItems(
  states: MemoryStateMap,
  allItemIds: string[],
  now = new Date(),
  itemType?: MemoryItemType
): TodayProgress {
  const typedStates = Object.values(states).filter((state) => !itemType || state.itemType === itemType);
  const reviewedTodayCount = typedStates.filter((state) => isSameLocalDay(state.lastReviewedAt, now)).length;
  const introducedTodayCount = typedStates.filter((state) => isSameLocalDay(state.introducedAt, now)).length;
  const counts = getMemoryCountsForItems(states, allItemIds, now, itemType);
  const clearedDue = counts.dueCount === 0 && reviewedTodayCount > 0;
  const touchedToday = reviewedTodayCount > 0 || introducedTodayCount > 0;

  return {
    reviewedTodayCount,
    introducedTodayCount,
    clearedDue,
    touchedToday,
  };
}

export function getTodayProgress(states: KanaMemoryStateMap, allKanaIds: string[], now = new Date()) {
  return getTodayProgressForItems(states, allKanaIds, now, "kana");
}
