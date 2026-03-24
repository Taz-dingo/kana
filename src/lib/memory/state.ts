import { DEFAULT_DIFFICULTY, DEFAULT_STABILITY } from "./constants";
import type { KanaMemoryState } from "./types";

export function createNewKanaMemoryState(kanaId: string): KanaMemoryState {
  return {
    kanaId,
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
