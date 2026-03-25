export type ReviewResult = "again" | "hard" | "good" | "easy";

export type MemoryStatus = "new" | "learning" | "review" | "mastered";
export type MemoryItemType = "kana" | "vocabulary" | "grammar" | "sentence";

export interface MemoryCounts {
  dueCount: number;
  newCount: number;
  learningCount: number;
  reviewCount: number;
  masteredCount: number;
}

export interface TodayProgress {
  reviewedTodayCount: number;
  introducedTodayCount: number;
  clearedDue: boolean;
  touchedToday: boolean;
}

export interface MemoryItemState {
  itemId: string;
  itemType: MemoryItemType;
  introducedAt: string | null;
  dueAt: string | null;
  lastReviewedAt: string | null;
  lastResult: ReviewResult | null;
  lapseCount: number;
  reviewCount: number;
  stability: number;
  difficulty: number;
  status: MemoryStatus;
}

export type MemoryStateMap = Record<string, MemoryItemState>;

export type KanaReviewResult = ReviewResult;
export type KanaMemoryStatus = MemoryStatus;
export type KanaMemoryState = MemoryItemState;
export type KanaMemoryStateMap = MemoryStateMap;

export interface MemoryRepository {
  loadStates(): Promise<MemoryStateMap>;
  saveStates(states: MemoryStateMap): Promise<void>;
}
