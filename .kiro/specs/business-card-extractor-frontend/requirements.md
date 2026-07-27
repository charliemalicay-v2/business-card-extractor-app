# Requirements: Business Card Extractor Frontend

## Context

A Next.js frontend for the Business Card Extractor API (`business-card-extractor-api`,
docs at `docs/API_USAGE.md`). The API lets a user upload a business card image, runs
OCR/LLM extraction plus optional QR-code cross-checking, and produces a record whose
fields are either `confirmed`, `unverified`, or `conflict`ing. Conflicting records need
a human to resolve them via a review workflow. This is a single-user/internal tool — no
authentication.

Target stack: Next.js (App Router), TypeScript, axios, TanStack Query (`useQuery`/
`useMutation`), Tailwind CSS, shadcn/ui.

## User Roles

- **Operator** — the single internal user who uploads business cards, reviews
  conflicting records, and browses/searches past records. No other roles exist (no
  auth).

---

## Requirement 1: Card Upload

**User Story:** As an operator, I want to upload a business card image, so that the
system extracts its contact fields automatically.

**Acceptance Criteria:**
1. WHEN the operator selects or drops an image file THEN the system SHALL submit it to
   `POST /cards` as `multipart/form-data` under the field name `file`.
2. WHEN the selected file's declared size exceeds 10MB (`MAX_UPLOAD_SIZE_BYTES`) THEN
   the system SHALL block submission client-side and display a size-limit message
   before making the request.
3. WHEN the selected file's content-type is not an image type THEN the system SHALL
   block submission client-side and display an unsupported-format message before
   making the request.
4. WHILE the upload request is in flight, the system SHALL show a loading/progress
   state and disable re-submission.
5. WHEN the upload responds `201 Created` THEN the system SHALL navigate to the detail
   view for the returned record `id`.
6. WHEN the upload responds with an error THEN the system SHALL display a message
   specific to the returned `error_code`:
   - `unsupported_format` (400)
   - `file_too_large` (413)
   - `invalid_image` (400)
   - `not_a_business_card` (422) — message SHALL include whether the failure `stage`
     was `"shape"` or `"text_pattern"`
   - `ocr_no_text` (422)
   - `extraction_service_unavailable` (503) — message SHALL indicate the extraction
     backend is unavailable and offer a retry action
   - `persistence_failed` (500) — message SHALL offer a retry action

## Requirement 2: Record Detail View

**User Story:** As an operator, I want to view a single record's full extracted data,
so that I can verify what was captured and see any raw OCR output.

**Acceptance Criteria:**
1. WHEN the operator navigates to a record's detail route THEN the system SHALL fetch
   `GET /cards/{id}` and render the full `CardResponse`, including `raw_ocr_text`.
2. WHEN the record's overall `status` is `confirmed` or `needs_review` THEN the system
   SHALL display a corresponding status badge.
3. FOR EACH required field (`name`, `position`, `company`, `email`, `phone`):
   - IF the field's `status` is `confirmed` THEN the system SHALL display `value` with
     confirmed/success styling.
   - IF the field's `status` is `unverified` THEN the system SHALL display `value` with
     an indicator that only one source (OCR/LLM) was available.
   - IF the field's `status` is `conflict` THEN the system SHALL display both
     `ocr_llm_value` and `qr_value` side by side (since `value` is `null`) and surface
     a prompt to resolve it.
4. WHEN `optional_fields` is non-empty THEN the system SHALL render those fields in a
   separate section; WHEN it is empty THEN the system SHALL render nothing for it.
5. WHEN rendering the record THEN the system SHALL show the `qr` block's `detected` and
   `decoded` booleans as a visual indicator.
6. WHEN rendering the record THEN the system SHALL show `raw_ocr_text` in a
   collapsed/expandable section, collapsed by default.
7. WHEN rendering the record THEN the system SHALL display `created_at` and
   `updated_at` formatted for the operator's locale.
8. WHEN `GET /cards/{id}` responds `404` with `record_not_found` THEN the system SHALL
   display a not-found state instead of a broken detail view.

## Requirement 3: Review Resolution

**User Story:** As an operator, I want to resolve conflicting fields on a record, so
that the record can be finalized as `confirmed`.

**Acceptance Criteria:**
1. WHEN a record's `status` is `needs_review` THEN the system SHALL display review
   controls; WHEN it is `confirmed` THEN the system SHALL NOT display review controls.
2. FOR EACH field with `status === "conflict"`, the system SHALL let the operator
   choose `ocr_llm_value`, choose `qr_value`, or enter a custom free-text value as the
   resolution.
3. WHEN the operator submits a resolution THEN the system SHALL send `PATCH
   /cards/{id}/review` containing only the fields being resolved, omitting fields not
   being resolved in this submission.
4. IF no field has been given a resolved value THEN the system SHALL disable the
   submit action (mirroring the API's empty-payload rejection).
5. WHEN the review submission responds `200 OK` THEN the system SHALL update the
   displayed record from the response and, IF all conflicts are now resolved, reflect
   the record as `confirmed` immediately without requiring a manual refresh.
6. WHEN the review submission responds `400` with `invalid_review_payload` THEN the
   system SHALL display the returned message (covers both an empty payload and a
   record that is no longer pending review, e.g. resolved concurrently elsewhere).
7. WHEN the review submission responds `404` with `record_not_found` THEN the system
   SHALL display a message indicating the record no longer exists.

## Requirement 4: Record List & Filtering

**User Story:** As an operator, I want to browse and filter past records, so that I can
find records needing attention or look up past uploads.

**Acceptance Criteria:**
1. WHEN the operator opens the list view THEN the system SHALL fetch `GET /cards` with
   the current `page` and `page_size` and render the results in a table/list.
2. WHEN the operator selects a status filter (`all`, `confirmed`, `needs_review`) THEN
   the system SHALL re-fetch `GET /cards` with the corresponding `status` query
   parameter (omitted for `all`).
3. WHEN list results are fetched THEN the system SHALL NOT expect or attempt to render
   `raw_ocr_text` for list items (it is omitted by the API).
4. WHEN the operator clicks/selects a row THEN the system SHALL navigate to that
   record's detail view.
5. WHEN the list response is returned THEN the system SHALL use `total` to compute and
   display pagination (total pages = ceil(`total` / `page_size`)) and expose
   next/previous or page-number controls.
6. WHEN `items` is empty THEN the system SHALL display an empty-state message
   appropriate to the active filter.
7. WHERE feasible, the list view SHALL surface a count or highlight of `needs_review`
   records as an actionable queue.

## Requirement 5: Cross-Cutting Error Handling & Resilience

**User Story:** As an operator, I want clear, consistent feedback when something goes
wrong, so that I know what happened and whether I can retry.

**Acceptance Criteria:**
1. WHEN any API call returns a non-2xx response THEN the system SHALL map the
   response's `error_code` to a user-facing message via a single central mapping, and
   SHALL display the API's `message` field as-is (it is documented as safe/human
   readable).
2. WHEN an error is transient (`extraction_service_unavailable`, `persistence_failed`)
   THEN the system SHALL offer a retry affordance.
3. WHILE a detail or list fetch is loading THEN the system SHALL display a loading
   skeleton rather than a blank screen.
4. The system SHALL NOT implement any authentication/authorization UI or send auth
   headers, consistent with the API being a single-user/internal tool.
5. The system SHALL NOT re-implement field conflict detection (whitespace/case
   normalization) on the client — conflict/confirmed/unverified status SHALL always be
   read directly from the API response.

## Requirement 6: Technical Constraints

**Acceptance Criteria:**
1. The application SHALL be built with Next.js (App Router) and TypeScript.
2. All HTTP calls to the Business Card Extractor API SHALL go through axios via a
   single configured client instance.
3. All server-state fetching/mutation (list, detail, upload, review) SHALL use TanStack
   Query (`useQuery` for reads, `useMutation` for the upload and review writes),
   including appropriate cache invalidation (e.g. resolving a review invalidates the
   list and that record's detail query).
4. All styling SHALL use Tailwind CSS with shadcn/ui components as the base UI
   component layer.
5. The API base URL SHALL be configurable via an environment variable, not hardcoded.
