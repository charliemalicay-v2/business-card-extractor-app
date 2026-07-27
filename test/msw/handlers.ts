import { http, HttpResponse } from "msw";
import { BASE_URL, confirmedCard, needsReviewCard, resolvedCard } from "./fixtures";

// Default happy-path handlers, matching API_USAGE.md's documented shapes.
// Individual tests can override any of these via `server.use(...)`.
export const handlers = [
  http.post(`${BASE_URL}/cards`, () => {
    return HttpResponse.json(confirmedCard, { status: 201 });
  }),

  http.get(`${BASE_URL}/cards/:id`, ({ params }) => {
    if (params.id === needsReviewCard.id) {
      return HttpResponse.json(needsReviewCard);
    }
    if (params.id === confirmedCard.id) {
      return HttpResponse.json(confirmedCard);
    }
    return HttpResponse.json(
      {
        error_code: "record_not_found",
        message: `No record found with id ${params.id}.`,
      },
      { status: 404 }
    );
  }),

  http.get(`${BASE_URL}/cards`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const all = [confirmedCard, needsReviewCard];
    const filtered = status
      ? all.filter((card) => card.status === status)
      : all;
    return HttpResponse.json({
      items: filtered.map(
        ({ id, status: cardStatus, fields, optional_fields, qr, created_at, updated_at }) => ({
          id,
          status: cardStatus,
          fields,
          optional_fields,
          qr,
          created_at,
          updated_at,
        })
      ),
      total: filtered.length,
      page: 1,
      page_size: 10,
    });
  }),

  http.patch(`${BASE_URL}/cards/:id/review`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    if (Object.keys(body).length === 0) {
      return HttpResponse.json(
        {
          error_code: "invalid_review_payload",
          message: "At least one resolved field value must be provided.",
        },
        { status: 400 }
      );
    }
    return HttpResponse.json(resolvedCard);
  }),
];

// Documented error-case handlers (API_USAGE.md "Error scenarios" table),
// applied per-test via `server.use(errorHandlers.xxx)`.
export const errorHandlers = {
  unsupportedFormat: http.post(`${BASE_URL}/cards`, () =>
    HttpResponse.json(
      {
        error_code: "unsupported_format",
        message: "Unsupported file type.",
      },
      { status: 400 }
    )
  ),
  fileTooLarge: http.post(`${BASE_URL}/cards`, () =>
    HttpResponse.json(
      {
        error_code: "file_too_large",
        message: "File exceeds the maximum allowed size of 10485760 bytes.",
      },
      { status: 413 }
    )
  ),
  invalidImage: http.post(`${BASE_URL}/cards`, () =>
    HttpResponse.json(
      { error_code: "invalid_image", message: "Empty or corrupted file." },
      { status: 400 }
    )
  ),
  notABusinessCard: http.post(`${BASE_URL}/cards`, () =>
    HttpResponse.json(
      {
        error_code: "not_a_business_card",
        message: "Image does not appear to be a business card.",
        stage: "shape",
      },
      { status: 422 }
    )
  ),
  ocrNoText: http.post(`${BASE_URL}/cards`, () =>
    HttpResponse.json(
      { error_code: "ocr_no_text", message: "OCR found no usable text." },
      { status: 422 }
    )
  ),
  extractionServiceUnavailable: http.post(`${BASE_URL}/cards`, () =>
    HttpResponse.json(
      {
        error_code: "extraction_service_unavailable",
        message: "Local LLM model isn't loaded/available.",
      },
      { status: 503 }
    )
  ),
  persistenceFailed: http.post(`${BASE_URL}/cards`, () =>
    HttpResponse.json(
      { error_code: "persistence_failed", message: "Database write failed." },
      { status: 500 }
    )
  ),
  recordNotFound: http.get(`${BASE_URL}/cards/:id`, () =>
    HttpResponse.json(
      { error_code: "record_not_found", message: "No record found." },
      { status: 404 }
    )
  ),
  invalidReviewPayloadNotPending: http.patch(
    `${BASE_URL}/cards/:id/review`,
    () =>
      HttpResponse.json(
        {
          error_code: "invalid_review_payload",
          message: "Record is not pending review.",
        },
        { status: 400 }
      )
  ),
  reviewRecordNotFound: http.patch(`${BASE_URL}/cards/:id/review`, () =>
    HttpResponse.json(
      { error_code: "record_not_found", message: "No record found." },
      { status: 404 }
    )
  ),
};
