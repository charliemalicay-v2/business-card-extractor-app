import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { uploadCard } from "@/lib/api/cards";
import { queryKeys } from "@/lib/query-keys";

export function useUploadCard() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: uploadCard,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cardsAll() });
      router.push(`/cards/${data.id}`);
    },
  });
}
