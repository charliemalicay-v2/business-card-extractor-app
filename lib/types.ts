export type FieldStatus = "confirmed" | "conflict" | "unverified";

export type RecordStatus = "confirmed" | "needs_review";

export interface FieldValue {
  value: string | null;
  status: FieldStatus;
  ocr_llm_value: string | null;
  qr_value: string | null;
}

export interface QrInfo {
  detected: boolean;
  decoded: boolean;
}

export interface CardFields {
  name: FieldValue;
  position: FieldValue;
  company: FieldValue;
  email: FieldValue;
  phone: FieldValue;
}

export interface CardResponse {
  id: string;
  status: RecordStatus;
  fields: CardFields;
  optional_fields: Record<string, string>;
  qr: QrInfo;
  raw_ocr_text: string;
  created_at: string;
  updated_at: string;
}

export type CardListItem = Omit<CardResponse, "raw_ocr_text">;

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export type ErrorCode =
  | "unsupported_format"
  | "file_too_large"
  | "invalid_image"
  | "not_a_business_card"
  | "ocr_no_text"
  | "extraction_service_unavailable"
  | "persistence_failed"
  | "record_not_found"
  | "invalid_review_payload"
  | "unknown_error";

export interface ApiError {
  error_code: ErrorCode;
  message: string;
  stage?: "shape" | "text_pattern";
}

export interface CardListFilters {
  status?: RecordStatus;
  page: number;
  page_size: number;
}
