import { apiClient } from "@/lib/api/client";
import type {
  CardListFilters,
  CardListItem,
  CardResponse,
  ListResponse,
} from "@/lib/types";

export async function uploadCard(file: File): Promise<CardResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<CardResponse>("/cards", formData);
  return data;
}

export async function getCard(id: string): Promise<CardResponse> {
  const { data } = await apiClient.get<CardResponse>(`/cards/${id}`);
  return data;
}

export async function listCards(
  filters: CardListFilters
): Promise<ListResponse<CardListItem>> {
  const { data } = await apiClient.get<ListResponse<CardListItem>>("/cards", {
    params: filters,
  });
  return data;
}

export async function resolveReview(
  id: string,
  resolutions: Record<string, string>
): Promise<CardResponse> {
  const { data } = await apiClient.patch<CardResponse>(
    `/cards/${id}/review`,
    resolutions
  );
  return data;
}
