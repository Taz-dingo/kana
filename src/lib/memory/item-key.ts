import type { MemoryItemType } from "./types";

function isMemoryItemType(value: string): value is MemoryItemType {
  return value === "kana" || value === "vocabulary" || value === "grammar" || value === "sentence";
}

export function createMemoryItemKey(itemType: MemoryItemType, itemId: string) {
  return `${itemType}:${itemId}`;
}

export function parseMemoryItemKey(itemKey: string) {
  const [itemType, ...rest] = itemKey.split(":");
  const itemId = rest.join(":");

  if (isMemoryItemType(itemType) && itemId) {
    return {
      itemType,
      itemId,
    } as const;
  }

  return null;
}

export function createKanaItemKey(kanaId: string) {
  return createMemoryItemKey("kana", kanaId);
}
