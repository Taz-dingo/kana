import { MASTERED_STABILITY_THRESHOLD } from "./constants";
import { createNewKanaMemoryState } from "./state";
import type { KanaMemoryState, KanaMemoryStateMap, KanaReviewResult } from "./types";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getOrCreateKanaState(states: KanaMemoryStateMap, kanaId: string) {
  return states[kanaId] ?? createNewKanaMemoryState(kanaId);
}

export function getDueKanaIds(states: KanaMemoryStateMap, now = new Date()) {
  const currentTime = now.getTime();

  return Object.values(states)
    .filter((state) => state.dueAt && new Date(state.dueAt).getTime() <= currentTime)
    .sort((left, right) => new Date(left.dueAt ?? 0).getTime() - new Date(right.dueAt ?? 0).getTime())
    .map((state) => state.kanaId);
}

export function getMemoryCounts(states: KanaMemoryStateMap, allKanaIds: string[], now = new Date()) {
  const dueIds = new Set(getDueKanaIds(states, now));
  let learningCount = 0;
  let reviewCount = 0;
  let masteredCount = 0;
  let newCount = 0;

  for (const kanaId of allKanaIds) {
    const state = states[kanaId];
    if (!state || state.status === "new") {
      newCount += 1;
      continue;
    }

    if (state.status === "learning") {
      learningCount += 1;
      continue;
    }

    if (state.status === "mastered") {
      masteredCount += 1;
      continue;
    }

    if (dueIds.has(kanaId)) {
      reviewCount += 1;
    }
  }

  return {
    dueCount: dueIds.size,
    newCount,
    learningCount,
    reviewCount,
    masteredCount,
  };
}

function getNextIntervalMs(result: KanaReviewResult, stability: number) {
  switch (result) {
    case "again":
      return 10 * MINUTE_MS;
    case "hard":
      return Math.max(DAY_MS, stability * 1.2 * DAY_MS);
    case "good":
      return Math.max(2 * DAY_MS, stability * 2 * DAY_MS);
    case "easy":
      return Math.max(4 * DAY_MS, stability * 3 * DAY_MS);
  }
}

export function applyReviewResult(
  state: KanaMemoryState,
  result: KanaReviewResult,
  now = new Date()
): KanaMemoryState {
  const reviewCount = state.reviewCount + 1;
  const lapseCount = result === "again" ? state.lapseCount + 1 : state.lapseCount;
  const difficultyDelta =
    result === "again" ? 1.2 : result === "hard" ? 0.4 : result === "good" ? -0.15 : -0.5;
  const stabilityMultiplier =
    result === "again" ? 0.45 : result === "hard" ? 1.15 : result === "good" ? 1.8 : 2.4;
  const difficulty = clamp(state.difficulty + difficultyDelta, 1, 10);
  const stability = clamp(state.stability * stabilityMultiplier, 0.2, 365);
  const dueAt = new Date(now.getTime() + getNextIntervalMs(result, stability)).toISOString();
  const introducedAt = state.introducedAt ?? now.toISOString();
  const status =
    result === "again"
      ? "learning"
      : stability >= MASTERED_STABILITY_THRESHOLD
        ? "mastered"
        : reviewCount >= 2
          ? "review"
          : "learning";

  return {
    ...state,
    introducedAt,
    dueAt,
    lastReviewedAt: now.toISOString(),
    lastResult: result,
    lapseCount,
    reviewCount,
    stability,
    difficulty,
    status,
  };
}
