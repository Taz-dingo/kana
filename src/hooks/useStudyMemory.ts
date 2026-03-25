import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getTodayProgressForItems,
  getWeakMemoryIds,
  getWeakMemoryInsights,
} from "../lib/memory/analytics";
import { createMemoryItemKey } from "../lib/memory/item-key";
import { createLocalStorageMemoryRepository } from "../lib/memory/repository";
import {
  applyReviewResult,
  getDueItemIds,
  getMemoryCountsForItems,
  getOrCreateMemoryState,
} from "../lib/memory/scheduler";
import type {
  MemoryCounts,
  MemoryItemState,
  MemoryItemType,
  MemoryStateMap,
  ReviewResult,
  TodayProgress,
} from "../lib/memory/types";

type ItemCatalog = Partial<Record<MemoryItemType, string[]>>;
type MemoryStateLookup = Partial<Record<MemoryItemType, Record<string, MemoryItemState>>>;
type DueIdsLookup = Partial<Record<MemoryItemType, string[]>>;
type CountsLookup = Partial<Record<MemoryItemType, MemoryCounts>>;
type TodayProgressLookup = Partial<Record<MemoryItemType, TodayProgress>>;

const repository = createLocalStorageMemoryRepository();

function buildStateLookup(storedStates: MemoryStateMap) {
  return Object.values(storedStates).reduce<MemoryStateLookup>((result, state) => {
    const typedStates = result[state.itemType] ?? {};
    typedStates[state.itemId] = state;
    result[state.itemType] = typedStates;
    return result;
  }, {});
}

export function useStudyMemory(itemCatalog: ItemCatalog) {
  const [storedStates, setStoredStates] = useState<MemoryStateMap>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void repository.loadStates().then((loadedStates) => {
      if (cancelled) {
        return;
      }

      setStoredStates(loadedStates);
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const statesByType = useMemo(() => buildStateLookup(storedStates), [storedStates]);

  const dueIdsByType = useMemo(
    () =>
      Object.keys(itemCatalog).reduce<DueIdsLookup>((result, itemType) => {
        result[itemType as MemoryItemType] = getDueItemIds(storedStates, new Date(), itemType as MemoryItemType);
        return result;
      }, {}),
    [itemCatalog, storedStates]
  );

  const countsByType = useMemo(
    () =>
      Object.entries(itemCatalog).reduce<CountsLookup>((result, [itemType, itemIds]) => {
        result[itemType as MemoryItemType] = getMemoryCountsForItems(
          storedStates,
          itemIds ?? [],
          new Date(),
          itemType as MemoryItemType
        );
        return result;
      }, {}),
    [itemCatalog, storedStates]
  );

  const weakInsightsByType = useMemo(
    () =>
      Object.keys(itemCatalog).reduce<Partial<Record<MemoryItemType, ReturnType<typeof getWeakMemoryInsights>>>>(
        (result, itemType) => {
          result[itemType as MemoryItemType] = getWeakMemoryInsights(storedStates, {
            itemType: itemType as MemoryItemType,
          });
          return result;
        },
        {}
      ),
    [itemCatalog, storedStates]
  );

  const weakIdsByType = useMemo(
    () =>
      Object.keys(itemCatalog).reduce<DueIdsLookup>((result, itemType) => {
        result[itemType as MemoryItemType] = getWeakMemoryIds(storedStates, {
          itemType: itemType as MemoryItemType,
        });
        return result;
      }, {}),
    [itemCatalog, storedStates]
  );

  const todayProgressByType = useMemo(
    () =>
      Object.entries(itemCatalog).reduce<TodayProgressLookup>((result, [itemType, itemIds]) => {
        result[itemType as MemoryItemType] = getTodayProgressForItems(
          storedStates,
          itemIds ?? [],
          new Date(),
          itemType as MemoryItemType
        );
        return result;
      }, {}),
    [itemCatalog, storedStates]
  );

  const replaceStates = useCallback((itemType: MemoryItemType, nextStates: Record<string, MemoryItemState>) => {
    const nextStoredStates = Object.values(nextStates).reduce<MemoryStateMap>((result, state) => {
      result[createMemoryItemKey(itemType, state.itemId)] = {
        ...state,
        itemType,
      };
      return result;
    }, {});

    setStoredStates((currentStates) => {
      const remainingStates = Object.fromEntries(
        Object.entries(currentStates).filter(([, state]) => state.itemType !== itemType)
      );
      const mergedStates = {
        ...remainingStates,
        ...nextStoredStates,
      };
      void repository.saveStates(mergedStates);
      return mergedStates;
    });
  }, []);

  const reviewItem = useCallback((itemType: MemoryItemType, itemId: string, result: ReviewResult) => {
    setStoredStates((currentStates) => {
      const previousState = getOrCreateMemoryState(currentStates, itemId, itemType);
      const nextState = applyReviewResult(previousState, result);
      const stateKey = createMemoryItemKey(itemType, itemId);
      const nextStates = {
        ...currentStates,
        [stateKey]: nextState,
      };
      void repository.saveStates(nextStates);
      return nextStates;
    });
  }, []);

  return {
    isReady,
    storedStates,
    statesByType,
    dueIdsByType,
    countsByType,
    weakIdsByType,
    weakInsightsByType,
    todayProgressByType,
    replaceStates,
    reviewItem,
  };
}
