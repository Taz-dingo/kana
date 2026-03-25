import { useCallback } from "react";
import { useStudyMemory } from "./useStudyMemory";
import type { KanaMemoryStateMap, KanaReviewResult } from "../lib/memory/types";

export function useKanaMemory(allKanaIds: string[]) {
  const {
    isReady,
    statesByType,
    dueIdsByType,
    countsByType,
    weakIdsByType,
    weakInsightsByType,
    todayProgressByType,
    replaceStates: replaceStudyStates,
    reviewItem,
  } = useStudyMemory({
    kana: allKanaIds,
  });

  const states = (statesByType.kana ?? {}) as KanaMemoryStateMap;
  const dueKanaIds = dueIdsByType.kana ?? [];
  const counts = countsByType.kana ?? {
    dueCount: 0,
    newCount: allKanaIds.length,
    learningCount: 0,
    reviewCount: 0,
    masteredCount: 0,
  };
  const weakKanaIds = weakIdsByType.kana ?? [];
  const weakKanaInsights = weakInsightsByType.kana ?? [];
  const todayProgress = todayProgressByType.kana ?? {
    reviewedTodayCount: 0,
    introducedTodayCount: 0,
    clearedDue: false,
    touchedToday: false,
  };

  const replaceStates = useCallback((nextStates: KanaMemoryStateMap) => {
    replaceStudyStates("kana", nextStates);
  }, [replaceStudyStates]);

  const reviewKana = useCallback((kanaId: string, result: KanaReviewResult) => {
    reviewItem("kana", kanaId, result);
  }, [reviewItem]);

  return {
    isReady,
    states,
    dueKanaIds,
    replaceStates,
    reviewKana,
    counts,
    weakKanaIds,
    weakKanaInsights,
    todayProgress,
  };
}
