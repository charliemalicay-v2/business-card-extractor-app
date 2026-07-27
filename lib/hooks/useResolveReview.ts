import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resolveReview } from "@/lib/api/cards";
import { queryKeys } from "@/lib/query-keys";

export function useResolveReview(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resolutions: Record<string, string>) =>
      resolveReview(id, resolutions),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.card(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.cardsAll() });
    },
  });
}
