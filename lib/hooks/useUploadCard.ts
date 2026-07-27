import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { uploadCard } from "@/lib/api/cards";
import { queryKeys } from "@/lib/query-keys";
import type { ApiError, CardResponse } from "@/lib/types";

export function useUploadCard() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<CardResponse, ApiError, File>({
    mutationFn: uploadCard,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cardsLists() });
      router.push(`/cards/${data.id}`);
    },
  });
}
