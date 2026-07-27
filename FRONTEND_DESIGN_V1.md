# Frontend Development Plan — v1

Based on `business-card-extractor-api/docs/API_USAGE.md`. Base URL:
`http://localhost:8000` (no auth required).

Stack: Next.js (App Router) · TypeScript · axios · TanStack Query · Tailwind CSS ·
shadcn/ui. Full spec (requirements/design/tasks) lives in
`.kiro/specs/business-card-extractor-frontend/`.

## Project setup (complete)

The project has been scaffolded and is ready for feature work. Next.js (App Router, TS,
Tailwind v4) is set up at the repo root, with axios and `@tanstack/react-query`
installed and shadcn/ui initialized using the `base-nova` style on a neutral base. The
API base URL is configurable via `NEXT_PUBLIC_API_BASE_URL` — committed as a default in
`.env.example` and set locally in the gitignored `.env.local`, pointing at
`http://localhost:8000`. The root layout wires up a `QueryClientProvider` and the
sonner `Toaster` through `app/providers.tsx`. A baseline set of shadcn components has
been generated — button, badge, card, table, select, pagination, alert, skeleton,
collapsible, dialog, input, and sonner. Build, lint, and typecheck have all been
verified clean via `npm run build`, `npm run lint`, and `tsc --noEmit`.

## API client and types

The data layer centers on a shared set of TypeScript types in `lib/types.ts`:
`CardResponse`, `FieldValue` (`value`, `status`, `ocr_llm_value`, `qr_value`), `QrInfo`
(`detected`, `decoded`), `CardListItem`, `ListResponse<T>`, and `ApiError`
(`error_code`, `message`, optional `stage`). Field status is a `"confirmed" |
"conflict" | "unverified"` union, and record status is `"confirmed" | "needs_review"`.

On top of these types, `lib/api/client.ts` provides an axios instance configured with
the base URL from `NEXT_PUBLIC_API_BASE_URL` and a response interceptor that normalizes
every non-2xx response into an `ApiError`. `lib/api/errors.ts` holds a central
`error_code` → `{ title, retryable }` copy map, and `lib/api/cards.ts` exposes the
typed request functions — `uploadCard`, `getCard`, `listCards`, `resolveReview`. A
`lib/query-keys.ts` factory centralizes TanStack Query cache keys, and `lib/hooks/`
wraps everything in `useCard`, `useCards`, `useUploadCard`, and `useResolveReview`
hooks, including cache invalidation between the list and detail queries.

## Upload flow (`POST /cards`)

The upload experience is built around a `UploadDropzone` component that accepts image
files via a file input or drag-and-drop, then submits them as `multipart/form-data`
under the field name `file`. Before submitting, the client pre-checks the image
content-type and confirms the file size is under `MAX_UPLOAD_SIZE_BYTES` (10MB by
default), blocking the request entirely if either check fails. While the upload is in
flight, the UI shows a loading/progress state and disables re-submission, since LLM
extraction can take a while. On a `201` response, the app routes straight to the detail
view for the new record.

Every upload error code needs its own message via a shared `ApiErrorAlert`:
`unsupported_format` (400), `file_too_large` (413), `invalid_image` (400),
`not_a_business_card` (422, which should surface whether the failing `stage` was
`shape` or `text_pattern`), `ocr_no_text` (422), `extraction_service_unavailable` (503,
with a retry affordance since it usually means the backend LLM is down), and
`persistence_failed` (500, also retryable).

## Record detail view (`GET /cards/{id}`)

The detail page fetches through `useCard(id)` and renders the full `CardResponse`,
including `raw_ocr_text`. An overall status badge shows whether the record is
`confirmed` or `needs_review`. Each required field (`name`, `position`, `company`,
`email`, `phone`) is rendered through a `FieldRow` component that branches on the
field's own status: `confirmed` fields show their value plainly with success styling,
`unverified` fields show their value with a subtle "only one source" indicator, and
`conflict` fields — where `value` is `null` — show `ocr_llm_value` and `qr_value` side
by side with an inline `ConflictResolver`.

Beyond the required fields, `optional_fields` (e.g. `website`) render in their own
section only when present, a `QrIndicator` shows the QR code's detected/decoded state,
and a collapsible `RawOcrText` section (closed by default) holds the raw OCR text.
Timestamps (`created_at`, `updated_at`) are formatted for the viewer's locale. If the
API returns a `404 record_not_found`, the page shows a dedicated not-found state rather
than a broken layout.

## Review resolution flow (`PATCH /cards/{id}/review`)

Review controls only appear when a record's status is `needs_review`. For each
conflicting field, a `ConflictResolver` lets the operator pick either the
`ocr_llm_value`, the `qr_value`, or enter a custom corrected value. The parent detail
page aggregates all of these resolutions into a single payload and submits only the
fields actually being resolved — never the whole record — with the submit button
disabled until at least one field has been resolved, mirroring the API's
empty-payload rejection rule.

On a `200` response, the record updates from the response body directly; if that
response clears every remaining conflict, the UI should reflect `confirmed` status
immediately without an extra fetch, and the list query should be invalidated so it
stays in sync. Two error cases need explicit handling: `invalid_review_payload` (400),
covering both an empty payload and a record that's no longer pending review (e.g.
someone else resolved it first), and `record_not_found` (404), if the record was
deleted mid-review.

## List view (`GET /cards`)

The list view is a `CardTable` with pagination controls for `page` and `page_size`,
paired with a `CardListFilters` status dropdown offering all / `confirmed` /
`needs_review`. A `NeedsReviewBadgeCount` highlights the `needs_review` total as an
actionable queue. List items omit `raw_ocr_text` by design, so the frontend shouldn't
expect it there — only the detail view carries it. Clicking a row navigates to that
record's detail view, and the response's `total` drives the pagination UI (total pages
= ceil(total / page_size)). An empty state, varied by the active filter, covers the
case where `items` comes back empty, and a loading skeleton covers the fetch itself.

## Cross-cutting concerns

Error handling flows through the same central `error_code` mapping used elsewhere
(`lib/api/errors.ts`), showing the API's own `message` as-is since it's documented as
safe and human-readable, with an `unknown_error` fallback for network failures that
don't map to a known code. Transient errors — `extraction_service_unavailable` and
`persistence_failed` — always get a retry affordance, and both the detail and list
views use loading skeletons rather than blank states while fetching. As an internal,
single-user tool, no auth headers or tokens are needed anywhere. Finally, the
whitespace/case-insensitive matching that determines conflict status happens entirely
server-side — the frontend should never re-implement that logic and should always read
field/record status directly from the API response.

## Testing (v1 exit criteria)

Unit tests cover the error mapping, the `ConflictResolver`'s resolution-building logic,
and the pagination math. MSW handlers stand in for all four endpoints, covering both
success and the documented error cases, backing integration tests (RTL + MSW) that
exercise the field status branches, the review submit-disabled rule, and
filter/pagination transitions. On top of that, three Playwright E2E flows should pass
before calling v1 done: uploading a card straight to a `confirmed` detail view;
uploading a card that lands in `needs_review`, resolving its conflict, and seeing it
flip to `confirmed`; and browsing the list, filtering to `needs_review`, paginating,
and opening a record.

---

Detailed task breakdown with requirement traceability: see
`.kiro/specs/business-card-extractor-frontend/tasks.md`.
