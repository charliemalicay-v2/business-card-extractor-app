import { useQuery } from "@tanstack/react-query";
import { getCard } from "@/lib/api/cards";
import { queryKeys } from "@/lib/query-keys";

export function useCard(id: string) {
  return useQuery({
    queryKey: queryKeys.card(id),
    queryFn: () => getCard(id),
  });
}
