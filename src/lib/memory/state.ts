import { DEFAULT_DIFFICULTY, DEFAULT_STABILITY } from "./constants";
import type { KanaMemoryState, MemoryItemState, MemoryItemType } from "./types";

export function createNewMemoryState(itemId: string, itemType: MemoryItemType = "kana"): MemoryItemState {
  return {
    itemId,
    itemType,
    introducedAt: null,
    dueAt: null,
    lastReviewedAt: null,
    lastResult: null,
    lapseCount: 0,
    reviewCount: 0,
    stability: DEFAULT_STABILITY,
    difficulty: DEFAULT_DIFFICULTY,
    status: "new",
  };
}

export function createNewKanaMemoryState(kanaId: string): KanaMemoryState {
  return createNewMemoryState(kanaId, "kana");
}
