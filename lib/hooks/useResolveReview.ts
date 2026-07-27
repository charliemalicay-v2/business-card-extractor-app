import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resolveReview } from "@/lib/api/cards";
import { queryKeys } from "@/lib/query-keys";
import type { ApiError, CardResponse } from "@/lib/types";

export function useResolveReview(id: string) {
  const queryClient = useQueryClient();

  return useMutation<CardResponse, ApiError, Record<string, string>>({
    mutationFn: (resolutions: Record<string, string>) =>
      resolveReview(id, resolutions),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.card(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.cardsLists() });
      toast.success(
        data.status === "confirmed"
          ? "Review saved — record confirmed."
          : "Review saved."
      );
    },
  });
}
