import { useQuery } from "@tanstack/react-query";
import { getCard } from "@/lib/api/cards";
import { queryKeys } from "@/lib/query-keys";
import type { ApiError, CardResponse } from "@/lib/types";

export function useCard(id: string) {
  return useQuery<CardResponse, ApiError>({
    queryKey: queryKeys.card(id),
    queryFn: () => getCard(id),
  });
}
