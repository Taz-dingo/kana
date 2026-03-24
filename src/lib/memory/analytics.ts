import type { KanaMemoryStateMap } from "./types";

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
