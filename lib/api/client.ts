import axios, { AxiosError } from "axios";
import type { ApiError } from "@/lib/types";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

function isApiErrorBody(data: unknown): data is ApiError {
  return (
    typeof data === "object" &&
    data !== null &&
    "error_code" in data &&
    "message" in data
  );
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && isApiErrorBody(error.response.data)) {
      return Promise.reject(error.response.data);
    }

    const fallback: ApiError = {
      error_code: "unknown_error",
      message: error.message || "Something went wrong. Please try again.",
    };
    return Promise.reject(fallback);
  }
);
