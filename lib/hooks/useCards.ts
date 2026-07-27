import { useQuery } from "@tanstack/react-query";
import { listCards } from "@/lib/api/cards";
import { queryKeys } from "@/lib/query-keys";
import type { ApiError, CardListFilters, CardListItem, ListResponse } from "@/lib/types";

export function useCards(filters: CardListFilters) {
  return useQuery<ListResponse<CardListItem>, ApiError>({
    queryKey: queryKeys.cards(filters),
    queryFn: () => listCards(filters),
  });
}
