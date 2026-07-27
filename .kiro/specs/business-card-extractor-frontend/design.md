# Design: Business Card Extractor Frontend

Traces to `requirements.md` in this same directory.

## Overview

A Next.js (App Router) single-user internal tool with three routes: upload/home, list,
and record detail (which also hosts the review-resolution UI). Server state (list,
detail, upload, review) is owned entirely by TanStack Query; axios is the transport.
UI is composed from shadcn/ui primitives styled with Tailwind. No auth, no server-side
data fetching beyond what TanStack Query needs — pages are client components that fetch
via hooks, kept simple since this is an internal tool with no SEO/SSR requirement.

## Architecture

```
app/
  layout.tsx                 # root layout, QueryClientProvider, Toaster
  page.tsx                   # "/" — upload screen
  cards/
    page.tsx                 # "/cards" — list + filter + pagination
    [id]/
      page.tsx                # "/cards/[id]" — detail + review

components/
  upload/
    UploadDropzone.tsx
    UploadErrorAlert.tsx
  cards/
    StatusBadge.tsx           # confirmed | needs_review | conflict | unverified
    FieldRow.tsx               # renders one field per its status
    ConflictResolver.tsx       # per-field OCR/QR/custom picker
    QrIndicator.tsx
    RawOcrText.tsx             # collapsible
    CardTable.tsx               # list table
    CardListFilters.tsx         # status filter + pagination controls
    NeedsReviewBadgeCount.tsx
  ui/                          # shadcn/ui generated components (button, badge, card,
                                # table, dialog, skeleton, alert, pagination, etc.)

lib/
  api/
    client.ts                  # axios instance, base URL from env
    cards.ts                   # typed API functions: uploadCard, getCard, listCards,
                                # resolveReview
    errors.ts                  # ApiError shape + error_code -> message/UX mapping
  hooks/
    useCard.ts                 # useQuery(['card', id])
    useCards.ts                 # useQuery(['cards', filters])
    useUploadCard.ts             # useMutation
    useResolveReview.ts          # useMutation
  query-keys.ts                 # centralized query key factory
  types.ts                      # CardResponse, FieldValue, QrInfo, ListResponse, etc.
```

## Components and Interfaces

### `lib/api/client.ts`
Single axios instance:
```ts
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
```
A response interceptor normalizes axios errors into `ApiError` (see Error Handling)
so callers never touch `AxiosError` directly.

### `lib/api/cards.ts`
Thin typed wrapper functions used by hooks — no React/query concerns here:
- `uploadCard(file: File): Promise<CardResponse>` — builds `FormData`, posts to
  `/cards`.
- `getCard(id: string): Promise<CardResponse>` — `GET /cards/{id}`.
- `listCards(params: { status?: RecordStatus; page: number; page_size: number }):
  Promise<ListResponse<CardListItem>>` — `GET /cards`.
- `resolveReview(id: string, resolutions: Record<string, string>): Promise<CardResponse>`
  — `PATCH /cards/{id}/review`.

### `lib/hooks/*`
- `useCard(id)` → `useQuery({ queryKey: queryKeys.card(id), queryFn: () => getCard(id) })`
- `useCards(filters)` → `useQuery({ queryKey: queryKeys.cards(filters), queryFn: ... })`
- `useUploadCard()` → `useMutation`; on success, `router.push('/cards/' + data.id)` and
  invalidate `queryKeys.cardsAll()`.
- `useResolveReview(id)` → `useMutation`; on success, `setQueryData(queryKeys.card(id),
  data)` (use the response directly, no extra fetch) and invalidate `queryKeys.cardsAll()`
  so the list's `needs_review` count/rows stay correct.

### `lib/query-keys.ts`
```ts
export const queryKeys = {
  cardsAll: () => ['cards'] as const,
  cards: (filters: CardListFilters) => ['cards', filters] as const,
  card: (id: string) => ['cards', 'detail', id] as const,
};
```

### Page: `/` (Upload)
- `UploadDropzone` (shadcn `Card` + native file input/drag handlers) — client-side
  validates content-type and size (10MB) before calling `useUploadCard().mutate(file)`.
- Shows `Skeleton`/spinner while `isPending`; shows `UploadErrorAlert` (shadcn `Alert`,
  destructive variant) mapped from the mutation's `ApiError` on failure, with a Retry
  button that re-triggers `mutate` for `extraction_service_unavailable` /
  `persistence_failed`.

### Page: `/cards` (List)
- `CardListFilters`: shadcn `Select` for status (`all | confirmed | needs_review`),
  drives a `status` state var; `Pagination` component for `page`/`page_size`.
- `CardTable`: shadcn `Table`; each row = `StatusBadge` + the five fields (name,
  company, email at minimum for compactness) + `updated_at`; row `onClick` → `router.push`.
- Empty state: shadcn `Empty`/plain centered message + illustration text, varies by
  active filter ("No records yet" vs "No records need review").
- `NeedsReviewBadgeCount`: small `useCards({ status: 'needs_review', page: 1, page_size: 1 })`
  read of `total`, rendered as a badge near the filter control or in nav.

### Page: `/cards/[id]` (Detail + Review)
- `useCard(id)`; on `isError` with `error_code === 'record_not_found'` render a
  dedicated not-found panel instead of the normal layout.
- `StatusBadge` for overall status.
- `FieldRow` per required field, switched on `field.status`:
  - `confirmed`/`unverified` → value + badge/icon.
  - `conflict` → renders `ConflictResolver` inline instead of a plain value.
- `optional_fields`: rendered only if `Object.keys(optional_fields).length > 0`.
- `QrIndicator`: two-icon indicator (detected/decoded).
- `RawOcrText`: shadcn `Collapsible`, closed by default.
- Timestamps via `Intl.DateTimeFormat` (or `date-fns` `format`) using browser locale.

### `ConflictResolver`
Local component state per field: `selected: 'ocr' | 'qr' | 'custom'` and
`customValue: string`. Exposes the resolved string up to a parent-level review form via
a callback/controlled value. The detail page aggregates all `ConflictResolver` outputs
into a single `resolutions: Record<string, string>` object; submit button disabled
while that object is empty. On submit, calls `useResolveReview(id).mutate(resolutions)`.

## Data Models

```ts
type FieldStatus = 'confirmed' | 'conflict' | 'unverified';
type RecordStatus = 'confirmed' | 'needs_review';

interface FieldValue {
  value: string | null;
  status: FieldStatus;
  ocr_llm_value: string | null;
  qr_value: string | null;
}

interface QrInfo {
  detected: boolean;
  decoded: boolean;
}

interface CardFields {
  name: FieldValue;
  position: FieldValue;
  company: FieldValue;
  email: FieldValue;
  phone: FieldValue;
}

interface CardResponse {
  id: string;
  status: RecordStatus;
  fields: CardFields;
  optional_fields: Record<string, string>;
  qr: QrInfo;
  raw_ocr_text: string;
  created_at: string;
  updated_at: string;
}

// List items are CardResponse minus raw_ocr_text
type CardListItem = Omit<CardResponse, 'raw_ocr_text'>;

interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

interface ApiError {
  error_code: string;
  message: string;
  stage?: 'shape' | 'text_pattern'; // only on not_a_business_card
}
```

## Error Handling

`lib/api/errors.ts` defines:
```ts
const ERROR_COPY: Record<string, { title: string; retryable: boolean }> = {
  unsupported_format: { title: 'Unsupported file type', retryable: false },
  file_too_large: { title: 'File too large', retryable: false },
  invalid_image: { title: 'Invalid or corrupted image', retryable: false },
  not_a_business_card: { title: 'Doesn\'t look like a business card', retryable: false },
  ocr_no_text: { title: 'No readable text found', retryable: false },
  extraction_service_unavailable: { title: 'Extraction service unavailable', retryable: true },
  persistence_failed: { title: 'Save failed', retryable: true },
  record_not_found: { title: 'Record not found', retryable: false },
  invalid_review_payload: { title: 'Could not save review', retryable: false },
};
```
The axios response interceptor converts any error response body into `ApiError`
(falling back to a generic `unknown_error` entry for network failures/timeouts so the
UI never crashes on an unmapped code). Components read `error.error_code` /
`error.message` and look up `ERROR_COPY` for title + retryable flag, then render the
API's own `message` as the body text (per requirement 5.1, it's documented as safe to
show verbatim) plus `stage` when present for `not_a_business_card`.

All mutations and queries surface errors via shadcn `Alert` (destructive) inline near
the relevant action, not global toasts — keeps the retry action co-located. A global
`Toaster` (sonner, shadcn-integrated) is available for secondary confirmations (e.g.
"Review saved") but not required for error display.

## Testing Strategy

- **Unit**: `lib/api/errors.ts` mapping, `ConflictResolver` resolution-building logic,
  pagination math (`total` → page count).
- **Integration (React Testing Library + MSW)**: mock the four endpoints per the
  documented request/response shapes in `API_USAGE.md`; test each `FieldRow` status
  branch, the review submit-disabled-until-resolved rule, and list filter/pagination
  state transitions.
- **E2E (Playwright)**: the three flows called out in the checklist —
  1. upload → `confirmed` detail view,
  2. upload → `needs_review` → resolve conflicting field → record becomes `confirmed`,
  3. list → filter by `needs_review` → paginate → open a record.
- Mock the backend at the HTTP layer (MSW for unit/integration, Playwright route
  interception or a running local API for E2E) rather than mocking axios/TanStack Query
  internals.

## Environment & Config

- `NEXT_PUBLIC_API_BASE_URL` — required, defaults to `http://localhost:8000` in
  `.env.local` for dev.
- No other env vars needed (no auth).

## Key Decisions

### Decision: Client components + TanStack Query over Next.js Server Components/Server Actions
**Context:** Next.js App Router encourages RSC + Server Actions for data fetching.
**Options Considered:**
1. Server Components fetching directly, Server Actions for mutations — Pros: less
   client JS, no query library needed. Cons: requirement 6.3 explicitly mandates
   TanStack Query; loses built-in cache invalidation/optimistic-update ergonomics for a
   frequently-refetched, filter-heavy list + a review flow that needs precise
   cache updates.
2. Client components + axios + TanStack Query — Pros: matches explicit stack
   requirement, well-suited to interactive filter/pagination/review UI, straightforward
   cache invalidation between list and detail queries. Cons: ships more client JS,
   irrelevant for an internal tool with no SEO needs.
**Decision:** Option 2.
**Rationale:** Requirement 6 explicitly mandates axios + TanStack Query; the app's
interactivity (filters, pagination, optimistic-ish review resolution) fits the
client-query model better than server actions.

### Decision: Review resolution granularity — page-level aggregation vs. per-field submit
**Context:** API allows partial `PATCH` payloads (a subset of conflicting fields).
**Options Considered:**
1. Each `ConflictResolver` submits its own field immediately on selection — Pros:
   simpler component, no parent aggregation. Cons: N requests for N conflicts, more
   error-handling surface, janky UX (per-field spinners).
2. Parent detail page aggregates all resolver outputs into one object, single "Save
   Review" submit — Pros: one request, one success/error state, matches how an operator
   naturally works (review all conflicts, then save). Cons: slightly more state lifting.
**Decision:** Option 2.
**Rationale:** Matches requirement 3.3/3.4 (single payload, submit disabled until at
least one resolution present) and gives a cleaner UX/error story.
