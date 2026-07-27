import type { CardListFilters } from "@/lib/types";

export const queryKeys = {
  cardsAll: () => ["cards"] as const,
  cards: (filters: CardListFilters) => ["cards", filters] as const,
  card: (id: string) => ["cards", "detail", id] as const,
};
