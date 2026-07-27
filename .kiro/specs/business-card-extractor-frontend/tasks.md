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

- [ ] 4. Upload flow (`/`)
- [ ] 4.1 `UploadDropzone`: file input + drag-and-drop, client-side content-type and
      10MB size pre-checks blocking submission with inline messages
  - _Requirements: 1.1, 1.2, 1.3_
- [ ] 4.2 Wire `UploadDropzone` to `useUploadCard`; loading state disables
      re-submission; on success navigate to `/cards/[id]`
  - _Requirements: 1.4, 1.5_
- [ ] 4.3 Wire mutation error state to `ApiErrorAlert` with retry for
      `extraction_service_unavailable` / `persistence_failed`
  - _Requirements: 1.6_
- [ ] 4.4 Build `app/page.tsx` composing the above
  - _Requirements: 1.1-1.6_

- [ ] 5. Record detail view (`/cards/[id]`)
- [ ] 5.1 `app/cards/[id]/page.tsx`: fetch via `useCard(id)`, loading skeleton, and
      dedicated not-found panel when `error_code === 'record_not_found'`
  - _Requirements: 2.1, 2.8, 5.3_
- [ ] 5.2 `FieldRow` component: switches rendering on `field.status`
      (confirmed/unverified plain value with indicator; conflict renders
      `ConflictResolver` instead of `value`)
  - _Requirements: 2.3_
- [ ] 5.3 Render `optional_fields` section conditionally, `StatusBadge`, `QrIndicator`,
      `RawOcrText`, and locale-formatted `created_at`/`updated_at`
  - _Requirements: 2.2, 2.4, 2.5, 2.6, 2.7_

- [ ] 6. Review resolution flow
- [ ] 6.1 `ConflictResolver` component: choice of `ocr_llm_value` / `qr_value` /
      custom free text, exposes resolved value via callback
  - _Requirements: 3.2_
- [ ] 6.2 Detail page aggregates all `ConflictResolver` outputs into a single
      `resolutions` object; hide review controls entirely when `status !== 'needs_review'`
  - _Requirements: 3.1, 3.3_
- [ ] 6.3 Submit button disabled until `resolutions` is non-empty; wire to
      `useResolveReview(id)`
  - _Requirements: 3.4_
- [ ] 6.4 On success: update detail view from response, reflect flip to `confirmed`
      immediately, invalidate list query; show success toast
  - _Requirements: 3.5_
- [ ] 6.5 Handle `invalid_review_payload` (400) and `record_not_found` (404) error
      responses via `ApiErrorAlert`
  - _Requirements: 3.6, 3.7_

- [ ] 7. List view (`/cards`)
- [ ] 7.1 `CardListFilters`: status `Select` (all/confirmed/needs_review) driving
      `useCards` params
  - _Requirements: 4.2_
- [ ] 7.2 `CardTable`: renders `items` (no `raw_ocr_text` expected), row click
      navigates to detail
  - _Requirements: 4.1, 4.3, 4.4_
- [ ] 7.3 Pagination controls using `total`/`page`/`page_size` from response
  - _Requirements: 4.5_
- [ ] 7.4 Empty-state messaging varied by active filter
  - _Requirements: 4.6_
- [ ] 7.5 `NeedsReviewBadgeCount`: small query surfacing `needs_review` total as a badge
  - _Requirements: 4.7_
- [ ] 7.6 Loading skeleton for list fetch
  - _Requirements: 5.3_

- [ ] 8. Cross-cutting polish
- [ ] 8.1 Verify no auth headers/tokens anywhere in the API client or hooks
  - _Requirements: 5.4_
- [ ] 8.2 Audit codebase to confirm no client-side re-implementation of
      whitespace/case conflict-detection logic — all status reads come from API
      response fields
  - _Requirements: 5.5_
- [ ] 8.3 Add basic top-level nav between Upload and List pages
  - _Requirements: (supports 1, 4 usability, not a hard requirement)_

- [ ] 9. Testing
- [ ] 9.1 Unit tests: `lib/api/errors.ts` mapping, `ConflictResolver`
      resolution-building logic, pagination math helper
  - _Requirements: 5.1, 3.2, 4.5_
- [ ] 9.2 Set up MSW with handlers matching `API_USAGE.md` request/response shapes for
      all four endpoints (success + documented error cases)
  - _Requirements: 1.6, 2.8, 3.6, 3.7_
- [ ] 9.3 Integration tests (RTL + MSW): `FieldRow` status branches, review
      submit-disabled-until-resolved rule, list filter/pagination state transitions
  - _Requirements: 2.3, 3.4, 4.2, 4.5_
- [ ] 9.4 E2E (Playwright) — flow 1: upload a no-QR card → lands on `confirmed` detail
      view
  - _Requirements: 1.1-1.5, 2.1-2.7_
- [ ] 9.5 E2E (Playwright) — flow 2: upload a conflicting card → `needs_review` →
      resolve conflict → record becomes `confirmed`
  - _Requirements: 3.1-3.5_
- [ ] 9.6 E2E (Playwright) — flow 3: list → filter by `needs_review` → paginate → open
      a record
  - _Requirements: 4.1-4.6_
