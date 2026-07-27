# Tasks: Business Card Extractor Frontend

Traces to `requirements.md` and `design.md` in this same directory.

- [x] 1. Project scaffolding
- [x] 1.1 Initialize Next.js (App Router, TypeScript) app; install axios,
      @tanstack/react-query, tailwindcss, and init shadcn/ui
  - Set up `app/`, `components/`, `lib/` directories per design.md
  - Configure `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (default
    `http://localhost:8000`) and `.env.example`
  - _Requirements: 6.1, 6.4, 6.5_
- [x] 1.2 Add `QueryClientProvider` and shadcn `Toaster` to `app/layout.tsx`
  - _Requirements: 6.3_
- [x] 1.3 Generate baseline shadcn/ui components: button, badge, card, table, select,
      pagination, alert, skeleton, collapsible, dialog, input
  - _Requirements: 6.4_
- [x] 1.4 Theme setup: replace default `create-next-app` landing page with a branded
      placeholder, add Inter (body) / Space Grotesk (heading) fonts via `next/font`,
      and apply the project color palette
      (https://colorhunt.co/palette/e8edf22c3947547a95c2a56d) across light/dark theme
      tokens in `app/globals.css`
  - _Requirements: 6.4_

- [x] 2. Types, API client, and data layer
- [x] 2.1 Define types in `lib/types.ts`: `FieldStatus`, `RecordStatus`, `FieldValue`,
      `QrInfo`, `CardFields`, `CardResponse`, `CardListItem`, `ListResponse<T>`,
      `ApiError`
  - _Requirements: 6.3, design "Data Models"_
- [x] 2.2 Create `lib/api/client.ts`: axios instance with `baseURL` from env, response
      interceptor normalizing errors to `ApiError`
  - _Requirements: 6.2, 6.5, 5.1_
- [x] 2.3 Create `lib/api/errors.ts`: `ERROR_COPY` map (title + retryable per
      `error_code`) covering `unsupported_format`, `file_too_large`, `invalid_image`,
      `not_a_business_card`, `ocr_no_text`, `extraction_service_unavailable`,
      `persistence_failed`, `record_not_found`, `invalid_review_payload`, plus an
      `unknown_error` fallback
  - _Requirements: 5.1, 5.2, 1.6, 3.6, 3.7, 2.8_
- [x] 2.4 Create `lib/api/cards.ts`: `uploadCard`, `getCard`, `listCards`,
      `resolveReview` typed functions
  - _Requirements: 1.1, 2.1, 3.3, 4.1, 4.2_
- [x] 2.5 Create `lib/query-keys.ts` centralized query key factory
  - _Requirements: 6.3_
- [x] 2.6 Create hooks: `useCard`, `useCards`, `useUploadCard`, `useResolveReview` in
      `lib/hooks/`, including cache invalidation/`setQueryData` per design.md
  - Known follow-up: `useResolveReview`'s `invalidateQueries(cardsAll())` also
    invalidates the just-set `card(id)` query (prefix match), causing one redundant
    refetch after review resolution — flagged in PR #2 review, non-blocking
  - _Requirements: 6.3, 3.5_

- [x] 3. Shared UI components
- [x] 3.1 `StatusBadge` (record-level: confirmed/needs_review) and field-level status
      badge/icon (confirmed/unverified/conflict)
  - Implemented as `StatusBadge` + `FieldStatusBadge` in
    `components/cards/StatusBadge.tsx`
  - _Requirements: 2.2, 2.3_
- [x] 3.2 `QrIndicator` (detected/decoded icons)
  - `components/cards/QrIndicator.tsx` — three states: no QR / detected-not-decoded /
    detected-and-decoded
  - _Requirements: 2.5_
- [x] 3.3 `RawOcrText` collapsible section, closed by default
  - `components/cards/RawOcrText.tsx`
  - _Requirements: 2.6_
- [x] 3.4 `UploadErrorAlert` / generic `ApiErrorAlert`: renders `ERROR_COPY` title +
      API `message` + `stage` (when present) + conditional Retry button
  - `components/shared/ApiErrorAlert.tsx` — marked `"use client"` (renders an
    interactive Retry button); must be rendered from a client parent, which holds for
    all real usage sites (Tasks 4-6)
  - _Requirements: 1.6, 5.1, 5.2_

- [x] 4. Upload flow (`/`)
- [x] 4.1 `UploadDropzone`: file input + drag-and-drop, client-side content-type and
      10MB size pre-checks blocking submission with inline messages
  - `components/upload/UploadDropzone.tsx` — pre-checks reuse the existing
    `unsupported_format`/`file_too_large` `ERROR_COPY` entries via `ApiErrorAlert`
  - _Requirements: 1.1, 1.2, 1.3_
- [x] 4.2 Wire `UploadDropzone` to `useUploadCard`; loading state disables
      re-submission; on success navigate to `/cards/[id]`
  - Fixed a `useMutation` typing gap while wiring this up: the hook defaulted its
    error type to `Error` instead of the `ApiError` the axios interceptor actually
    rejects with — `useUploadCard`/`useResolveReview` now explicitly type
    `useMutation<CardResponse, ApiError, ...>`
  - _Requirements: 1.4, 1.5_
- [x] 4.3 Wire mutation error state to `ApiErrorAlert` with retry for
      `extraction_service_unavailable` / `persistence_failed`
  - Retry re-runs validation + upload against the last selected file
  - _Requirements: 1.6_
- [x] 4.4 Build `app/page.tsx` composing the above
  - Also fixed an event-bubbling bug found during review: the hidden file input
    lived inside the `role="button"` dropzone div, so a keyboard Enter on the input
    itself double-triggered the native file picker; fixed with `tabIndex={-1}` +
    `stopPropagation()` on the input
  - _Requirements: 1.1-1.6_

- [x] 5. Record detail view (`/cards/[id]`)
- [x] 5.1 `app/cards/[id]/page.tsx`: fetch via `useCard(id)`, loading skeleton, and
      dedicated not-found panel when `error_code === 'record_not_found'`
  - Fixed the same `useQuery` error-typing gap as Task 4's mutation hooks:
    `useCard` now explicitly types `useQuery<CardResponse, ApiError>` so
    `error.error_code` is usable for the not-found branch
  - Generic `ApiErrorAlert` handles any other fetch error; guards against `card`
    being `undefined`/`error` being `null` in edge cases `tsc` correctly flagged
  - _Requirements: 2.1, 2.8, 5.3_
- [x] 5.2 `FieldRow` component: switches rendering on `field.status`
      (confirmed/unverified plain value with indicator; conflict renders
      `ConflictResolver` instead of `value`)
  - `components/cards/FieldRow.tsx` — for now, `conflict` renders a read-only
    OCR-vs-QR side-by-side display (Requirement 2.3 scope); swapping in the
    interactive `ConflictResolver` is Task 6.1's job, this component is built to
    slot it in without rework
  - _Requirements: 2.3_
- [x] 5.3 Render `optional_fields` section conditionally, `StatusBadge`, `QrIndicator`,
      `RawOcrText`, and locale-formatted `created_at`/`updated_at`
  - _Requirements: 2.2, 2.4, 2.5, 2.6, 2.7_

- [x] 6. Review resolution flow
- [x] 6.1 `ConflictResolver` component: choice of `ocr_llm_value` / `qr_value` /
      custom free text, exposes resolved value via callback
  - `components/cards/ConflictResolver.tsx` — click-to-select OCR/QR candidate
    buttons + a "Custom" toggle revealing a free-text input; reports resolved
    value (or `undefined` when unset) via `onChange`
  - Fixed during review: candidate buttons used `disabled={!value}` (falsy check),
    which would wrongly disable a candidate whose value is `""` rather than
    genuinely absent — changed to `== null` to match the actual `string | null` type
  - _Requirements: 3.2_
- [x] 6.2 Detail page aggregates all `ConflictResolver` outputs into a single
      `resolutions` object; hide review controls entirely when `status !== 'needs_review'`
  - `app/cards/[id]/page.tsx` — `FieldRow` now takes an `onResolutionChange` prop,
    only meaningful for `conflict` fields
  - _Requirements: 3.1, 3.3_
- [x] 6.3 Submit button disabled until `resolutions` is non-empty; wire to
      `useResolveReview(id)`
  - _Requirements: 3.4_
- [x] 6.4 On success: update detail view from response, reflect flip to `confirmed`
      immediately, invalidate list query; show success toast
  - Toast added in `useResolveReview`'s `onSuccess`, worded differently depending on
    whether the record fully flipped to `confirmed` or still has remaining conflicts
  - _Requirements: 3.5_
- [x] 6.5 Handle `invalid_review_payload` (400) and `record_not_found` (404) error
      responses via `ApiErrorAlert`
  - _Requirements: 3.6, 3.7_
  - Verified end-to-end with Playwright + Chromium against a mock backend matching
    `API_USAGE.md`'s response shapes: load → select QR candidate → submit disabled
    → enabled → PATCH → flips to `confirmed` → toast → controls disappear, zero
    console errors. Stronger verification than Tasks 4-5's static-only checks; this
    setup is a reasonable seed for Task 9's Playwright suite

- [x] 7. List view (`/cards`)
- [x] 7.1 `CardListFilters`: status `Select` (all/confirmed/needs_review) driving
      `useCards` params
  - Fixed the same `useQuery` error-typing gap as `useCard` proactively, in
    `lib/hooks/useCards.ts`, before anything depended on `error.error_code`
  - _Requirements: 4.2_
- [x] 7.2 `CardTable`: renders `items` (no `raw_ocr_text` expected), row click
      navigates to detail
  - `components/cards/CardTable.tsx` — row is keyboard-accessible
    (`role="button"`, `tabIndex`, Enter/Space) in addition to click
  - _Requirements: 4.1, 4.3, 4.4_
- [x] 7.3 Pagination controls using `total`/`page`/`page_size` from response
  - Simple Previous/Next buttons + "Page X of Y (N total)" summary; changing the
    status filter resets to page 1
  - _Requirements: 4.5_
- [x] 7.4 Empty-state messaging varied by active filter
  - _Requirements: 4.6_
- [x] 7.5 `NeedsReviewBadgeCount`: small query surfacing `needs_review` total as a badge
  - `components/cards/NeedsReviewBadgeCount.tsx` — `page_size: 1` query just for the
    `total`; renders nothing when zero
  - _Requirements: 4.7_
- [x] 7.6 Loading skeleton for list fetch
  - _Requirements: 5.3_
  - Verified end-to-end with Playwright against a mock backend serving 15 records
    across two pages: correct badge count, correct pagination summary/row counts on
    both pages, Next correctly disables on the last page, filter switch correctly
    resets to page 1 and re-filters, row click navigates to the right detail URL —
    zero console errors across all 9 assertions

- [x] 8. Cross-cutting polish
- [x] 8.1 Verify no auth headers/tokens anywhere in the API client or hooks
  - Grepped the whole codebase for `Authorization`, `Bearer`, `apiKey`, `token`,
    `credentials`, `localStorage`/`sessionStorage`/`cookie` (case-insensitive) —
    zero matches anywhere in `lib/` or the rest of the app
  - _Requirements: 5.4_
- [x] 8.2 Audit codebase to confirm no client-side re-implementation of
      whitespace/case conflict-detection logic — all status reads come from API
      response fields
  - Only hit for `.trim()`/`toLowerCase`/etc. was `ConflictResolver.tsx`'s
    `.trim()` on the operator's own custom-text input (legitimate "is this empty"
    validation for enabling submit, not conflict re-derivation); no code anywhere
    compares `ocr_llm_value`/`qr_value` directly
  - _Requirements: 5.5_
- [x] 8.3 Add basic top-level nav between Upload and List pages
  - `components/layout/TopNav.tsx`, wired into `app/layout.tsx`; "Records" link
    stays active while viewing `/cards/[id]` detail pages too (via
    `pathname.startsWith`), not just the list itself
  - Verified end-to-end with Playwright: nav renders, active-state highlighting
    correct on both routes, navigation works both directions, zero console errors
    across 8 assertions
  - _Requirements: (supports 1, 4 usability, not a hard requirement)_

- [x] 9. Testing
  - Test infra added: Vitest + React Testing Library + MSW for unit/integration,
    Playwright for E2E; `npm test` / `test:watch` / `test:e2e` scripts
- [x] 9.1 Unit tests: `lib/api/errors.ts` mapping, `ConflictResolver`
      resolution-building logic, pagination math helper
  - Extracted the inline pagination calc from `app/cards/page.tsx` into
    `lib/pagination.ts` (`getTotalPages`) first, to make it unit-testable
  - 23 tests across `lib/api/errors.test.ts`, `lib/pagination.test.ts`,
    `components/cards/ConflictResolver.test.tsx`
  - _Requirements: 5.1, 3.2, 4.5_
- [x] 9.2 Set up MSW with handlers matching `API_USAGE.md` request/response shapes for
      all four endpoints (success + documented error cases)
  - `test/msw/` — fixtures matching `API_USAGE.md`'s documented examples exactly
    (Scenario 1 confirmed/no-QR, Scenario 3 needs_review/conflict), default
    handlers for all four endpoints, plus a full `errorHandlers` set covering
    every documented error code
  - Fixed while wiring this up: `apiClient`'s `baseURL` resolved to `undefined`
    under Vitest (`.env.local` isn't loaded outside Next's runtime), so axios sent
    relative URLs that never matched MSW's absolute-URL handlers, producing a real
    "Network Error" — fixed by injecting `NEXT_PUBLIC_API_BASE_URL` via
    `vitest.config.ts`'s `test.env`
  - _Requirements: 1.6, 2.8, 3.6, 3.7_
- [x] 9.3 Integration tests (RTL + MSW): `FieldRow` status branches, review
      submit-disabled-until-resolved rule, list filter/pagination state transitions
  - 7 tests across `components/cards/FieldRow.test.tsx`,
    `app/cards/[id]/page.test.tsx`, `app/cards/page.test.tsx`
  - Caught a genuine accessibility regression in `components/cards/CardTable.tsx`:
    rows had `role="button"` on the `<tr>`, which overrides its implicit `row`
    role, stripping table semantics (row count, arrow-key nav) from screen
    readers — surfaced as an unexpected `getAllByRole("row")` count mismatch,
    traced to the real cause rather than loosened to match; fixed by dropping the
    role override (row stays keyboard-operable via `tabIndex` + `onKeyDown`)
  - _Requirements: 2.3, 3.4, 4.2, 4.5_
- [x] 9.4 E2E (Playwright) — flow 1: upload a no-QR card → lands on `confirmed` detail
      view
  - `e2e/upload-confirmed.spec.ts`
  - _Requirements: 1.1-1.5, 2.1-2.7_
- [x] 9.5 E2E (Playwright) — flow 2: upload a conflicting card → `needs_review` →
      resolve conflict → record becomes `confirmed`
  - `e2e/upload-review-resolve.spec.ts`
  - _Requirements: 3.1-3.5_
- [x] 9.6 E2E (Playwright) — flow 3: list → filter by `needs_review` → paginate → open
      a record
  - `e2e/list-filter-paginate.spec.ts`; API mocked via `page.route()`, scoped to
    `url.origin === API_ORIGIN` — an earlier pathname-only predicate accidentally
    intercepted Next's own same-origin client navigation too, corrupting routing
    into raw JSON page dumps; fixed by adding the origin check
  - _Requirements: 4.1-4.6_
  - Final verification: `tsc --noEmit`, `npm run lint`, `vitest run` (30/30),
    `playwright test` (3/3), and `npm run build` all pass together
