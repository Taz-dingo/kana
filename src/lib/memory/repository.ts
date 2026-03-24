import { KANA_MEMORY_STORAGE_KEY } from "./constants";
import type { KanaMemoryStateMap, MemoryRepository } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function createLocalStorageMemoryRepository(storageKey = KANA_MEMORY_STORAGE_KEY): MemoryRepository {
  return {
    async loadStates() {
      if (typeof window === "undefined") {
        return {};
      }

      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return {};
      }

      try {
        const parsed = JSON.parse(raw) as unknown;
        return isRecord(parsed) ? (parsed as KanaMemoryStateMap) : {};
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
