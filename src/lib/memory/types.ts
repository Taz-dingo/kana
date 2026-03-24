export type KanaReviewResult = "again" | "hard" | "good" | "easy";

export type KanaMemoryStatus = "new" | "learning" | "review" | "mastered";

export interface KanaMemoryState {
  kanaId: string;
  introducedAt: string | null;
  dueAt: string | null;
  lastReviewedAt: string | null;
  lastResult: KanaReviewResult | null;
  lapseCount: number;
  reviewCount: number;
  stability: number;
  difficulty: number;
  status: KanaMemoryStatus;
}

export type KanaMemoryStateMap = Record<string, KanaMemoryState>;

export interface MemoryRepository {
  loadStates(): Promise<KanaMemoryStateMap>;
  saveStates(states: KanaMemoryStateMap): Promise<void>;
}
