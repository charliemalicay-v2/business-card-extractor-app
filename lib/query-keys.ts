import type { CardListFilters } from "@/lib/types";

export const queryKeys = {
  cardsLists: () => ["cards", "list"] as const,
  cards: (filters: CardListFilters) => ["cards", "list", filters] as const,
  card: (id: string) => ["cards", "detail", id] as const,
};
