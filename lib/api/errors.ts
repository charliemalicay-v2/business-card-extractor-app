import type { ErrorCode } from "@/lib/types";

export interface ErrorCopy {
  title: string;
  retryable: boolean;
}

export const ERROR_COPY: Record<ErrorCode, ErrorCopy> = {
  unsupported_format: { title: "Unsupported file type", retryable: false },
  file_too_large: { title: "File too large", retryable: false },
  invalid_image: { title: "Invalid or corrupted image", retryable: false },
  not_a_business_card: {
    title: "Doesn't look like a business card",
    retryable: false,
  },
  ocr_no_text: { title: "No readable text found", retryable: false },
  extraction_service_unavailable: {
    title: "Extraction service unavailable",
    retryable: true,
  },
  persistence_failed: { title: "Save failed", retryable: true },
  record_not_found: { title: "Record not found", retryable: false },
  invalid_review_payload: { title: "Could not save review", retryable: false },
  unknown_error: { title: "Something went wrong", retryable: true },
};

export function getErrorCopy(errorCode: string): ErrorCopy {
  return (ERROR_COPY as Record<string, ErrorCopy>)[errorCode] ?? ERROR_COPY.unknown_error;
}
