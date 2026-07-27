import { describe, expect, it } from "vitest";
import { ERROR_COPY, getErrorCopy } from "@/lib/api/errors";
import type { ErrorCode } from "@/lib/types";

describe("getErrorCopy", () => {
  const documentedCodes: ErrorCode[] = [
    "unsupported_format",
    "file_too_large",
    "invalid_image",
    "not_a_business_card",
    "ocr_no_text",
    "extraction_service_unavailable",
    "persistence_failed",
    "record_not_found",
    "invalid_review_payload",
  ];

  it.each(documentedCodes)("has copy for documented error_code %s", (code) => {
    expect(getErrorCopy(code)).toBe(ERROR_COPY[code]);
  });

  it("marks extraction_service_unavailable and persistence_failed as retryable", () => {
    expect(getErrorCopy("extraction_service_unavailable").retryable).toBe(true);
    expect(getErrorCopy("persistence_failed").retryable).toBe(true);
  });

  it("marks all other documented codes as non-retryable", () => {
    const nonRetryable = documentedCodes.filter(
      (code) =>
        code !== "extraction_service_unavailable" && code !== "persistence_failed"
    );
    nonRetryable.forEach((code) => {
      expect(getErrorCopy(code).retryable).toBe(false);
    });
  });

  it("falls back to unknown_error for an unrecognized code", () => {
    expect(getErrorCopy("something_the_server_invented")).toBe(
      ERROR_COPY.unknown_error
    );
  });

  it("falls back to unknown_error for an empty string", () => {
    expect(getErrorCopy("")).toBe(ERROR_COPY.unknown_error);
  });
});
