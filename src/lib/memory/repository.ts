import { LEGACY_KANA_MEMORY_STORAGE_KEY, MEMORY_STORAGE_KEY } from "./constants";
import { createMemoryItemKey, parseMemoryItemKey } from "./item-key";
import type { MemoryItemState, MemoryStateMap, MemoryRepository } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeMemoryState(value: unknown, fallbackId: string): MemoryItemState | null {
  if (!isRecord(value)) {
    return null;
  }

  const parsedKey = parseMemoryItemKey(fallbackId);
  const itemId =
    typeof value.itemId === "string"
      ? value.itemId
      : typeof value.kanaId === "string"
        ? value.kanaId
        : parsedKey?.itemId
          ? parsedKey.itemId
          : fallbackId;
  const itemType =
    value.itemType === "kana" ||
    value.itemType === "vocabulary" ||
    value.itemType === "grammar" ||
    value.itemType === "sentence"
      ? value.itemType
      : parsedKey?.itemType ?? "kana";

  return {
    itemId,
    itemType,
    introducedAt: typeof value.introducedAt === "string" ? value.introducedAt : null,
    dueAt: typeof value.dueAt === "string" ? value.dueAt : null,
    lastReviewedAt: typeof value.lastReviewedAt === "string" ? value.lastReviewedAt : null,
    lastResult:
      value.lastResult === "again" ||
      value.lastResult === "hard" ||
      value.lastResult === "good" ||
      value.lastResult === "easy"
        ? value.lastResult
        : null,
    lapseCount: typeof value.lapseCount === "number" ? value.lapseCount : 0,
    reviewCount: typeof value.reviewCount === "number" ? value.reviewCount : 0,
    stability: typeof value.stability === "number" ? value.stability : 0.5,
    difficulty: typeof value.difficulty === "number" ? value.difficulty : 5,
    status:
      value.status === "new" ||
      value.status === "learning" ||
      value.status === "review" ||
      value.status === "mastered"
        ? value.status
        : "new",
  };
}

function normalizeLoadedStates(value: unknown): MemoryStateMap {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<MemoryStateMap>((result, [stateKey, stateValue]) => {
    const normalized = normalizeMemoryState(stateValue, stateKey);

    if (!normalized) {
      return result;
    }

    result[createMemoryItemKey(normalized.itemType, normalized.itemId)] = normalized;
    return result;
  }, {});
}

export function createLocalStorageMemoryRepository(storageKey = MEMORY_STORAGE_KEY): MemoryRepository {
  return {
    async loadStates() {
      if (typeof window === "undefined") {
        return {};
      }

      const raw = window.localStorage.getItem(storageKey);
      const legacyRaw = window.localStorage.getItem(LEGACY_KANA_MEMORY_STORAGE_KEY);
      const source = raw ?? legacyRaw;

      if (!source) {
        return {};
      }

      try {
        const parsed = JSON.parse(source) as unknown;
        const normalizedStates = normalizeLoadedStates(parsed);

        if (!raw && Object.keys(normalizedStates).length > 0) {
          window.localStorage.setItem(storageKey, JSON.stringify(normalizedStates));
        }

        return normalizedStates;
      } catch {
        return {};
      }
    },
    async saveStates(states) {
      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.setItem(storageKey, JSON.stringify(states));
    },
  };
}
