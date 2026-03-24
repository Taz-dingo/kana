import { useCallback, useEffect, useMemo, useState } from "react";
import { getTodayProgress, getWeakKanaIds } from "../lib/memory/analytics";
import { createLocalStorageMemoryRepository } from "../lib/memory/repository";
import { applyReviewResult, getMemoryCounts, getOrCreateKanaState } from "../lib/memory/scheduler";
import type { KanaMemoryStateMap, KanaReviewResult } from "../lib/memory/types";

const repository = createLocalStorageMemoryRepository();

export function useKanaMemory(allKanaIds: string[]) {
  const [states, setStates] = useState<KanaMemoryStateMap>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void repository.loadStates().then((loadedStates) => {
      if (cancelled) {
        return;
      }

      setStates(loadedStates);
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const replaceStates = useCallback((nextStates: KanaMemoryStateMap) => {
    setStates(nextStates);
    void repository.saveStates(nextStates);
  }, []);

  const reviewKana = useCallback((kanaId: string, result: KanaReviewResult) => {
    setStates((currentStates) => {
      const previousState = getOrCreateKanaState(currentStates, kanaId);
      const nextState = applyReviewResult(previousState, result);
      const nextStates = {
        ...currentStates,
        [kanaId]: nextState,
      };
      void repository.saveStates(nextStates);
      return nextStates;
    });
  }, []);

  const counts = useMemo(() => getMemoryCounts(states, allKanaIds), [allKanaIds, states]);
  const weakKanaIds = useMemo(() => getWeakKanaIds(states), [states]);
  const todayProgress = useMemo(() => getTodayProgress(states, allKanaIds), [allKanaIds, states]);

  return {
    isReady,
    states,
    replaceStates,
    reviewKana,
    counts,
    weakKanaIds,
    todayProgress,
  };
}
