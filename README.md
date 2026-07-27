# Business Card Extractor — Frontend

Next.js (App Router) frontend for the Business Card Extractor API. Upload a
business card image, review OCR/QR extraction results, and resolve any
conflicting fields. Internal, single-user tool — no authentication.

Stack: Next.js · TypeScript · Tailwind CSS · shadcn/ui · axios · TanStack Query.

Full spec (requirements, design, tasks) lives in
[`.kiro/specs/business-card-extractor-frontend/`](.kiro/specs/business-card-extractor-frontend/).

## Setup

Requires Node 20+ and the
[business-card-extractor-api](../business-card-extractor-api) running locally
(defaults to `http://localhost:8000`).

```bash
npm ci
cp .env.example .env.local
```

`.env.local` only needs one variable:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

> This repo commits an `.npmrc` with `legacy-peer-deps=true` to work around a
> transitive `@babel/core` peer-dependency conflict pulled in by the test
> tooling. Plain `npm install` / `npm ci` will pick this up automatically.

## Running

```bash
npm run dev      # start the dev server at http://localhost:3000
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
npx tsc --noEmit # type-check
```

The app expects the API to be reachable at `NEXT_PUBLIC_API_BASE_URL`. Without
it running, pages will render their loading/error states rather than data.

## Testing

| Command              | What it runs                                      |
|----------------------|----------------------------------------------------|
| `npm test`           | Unit + integration tests (Vitest, single run)       |
| `npm run test:watch` | Same, in watch mode                                 |
| `npm run test:e2e`   | End-to-end tests (Playwright, mocks the API)        |

- **Unit/integration** (`vitest.config.ts`) use React Testing Library and MSW.
  MSW fixtures/handlers live in [`test/msw/`](test/msw/) and mirror the API's
  documented response shapes; component/page tests sit next to the code they
  cover (`*.test.ts` / `*.test.tsx`).
- **E2E** (`playwright.config.ts`) live in [`e2e/`](e2e/), one spec per core
  user flow. They mock the API via `page.route()` — no live backend needed —
  and automatically start `npm run dev` if a server isn't already running on
  port 3000.

```bash
npm test                                   # all unit/integration tests
npx vitest run lib/pagination.test.ts      # a single file
npm run test:e2e                           # all E2E specs
npx playwright test e2e/upload-confirmed.spec.ts   # a single spec
npx playwright show-report                 # view the last HTML report (CI only)
```

### CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push/PR
to `main`: lint, type-check, unit/integration tests, and build in one job;
Playwright E2E in a parallel job (uploads an HTML report artifact on
failure).

## Release workflow

Each feature/task lands on its own `release-x.y.z` branch, gets its own PR
into `main`, and is reviewed before merging — see recent history for the
pattern (`release-0.1.0` through `release-0.7.0`, one per `tasks.md` item).

```bash
git checkout main && git pull
git checkout -b release-x.y.z
# make changes, then:
git add -A
git commit -m "type: summary"
git push --set-upstream origin release-x.y.z
gh pr create --base main --head release-x.y.z --title "..." --body "..."
```

Before opening a PR, make sure the full local check suite passes:

```bash
npx tsc --noEmit && npm run lint && npm test && npm run test:e2e && npm run build
```

Once CI is green and the PR is reviewed, merge into `main` and delete the
release branch. The next task starts from a fresh `release-x.y.z` branch off
an up-to-date `main`.

## Release notes

### 0.7.0 — Cross-cutting polish, nav, full test suite ([#7](../../pull/7))
- Audited for auth headers/tokens and client-side conflict-detection
  re-implementation — none found.
- Added top-level nav (`TopNav`) between Upload and Records.
- Added the full test suite: Vitest + React Testing Library + MSW for
  unit/integration tests, Playwright for E2E, and the GitHub Actions CI
  pipeline that runs all of it on every push/PR.

### 0.6.0 — Review resolution flow and record list view ([#6](../../pull/6))
- Added `ConflictResolver` (pick OCR/QR/custom value) and wired it into the
  detail page's review-submission flow, with a success toast.
- Added the `/cards` list view: status filter, pagination, `NeedsReviewBadgeCount`.

### 0.5.0 — Record detail view ([#5](../../pull/5))
- Added `/cards/[id]`: field-by-field status display, QR indicator, raw OCR
  text, loading/not-found/error states.

### 0.4.0 — Upload flow ([#4](../../pull/4))
- Added `UploadDropzone`: click-to-browse and drag-and-drop upload with
  client-side validation and error handling, wired into the home page.

### 0.3.0 — Shared UI components ([#3](../../pull/3))
- Added `StatusBadge`, `QrIndicator`, `RawOcrText`, and `ApiErrorAlert`,
  shared across the upload, detail, and list views.

### 0.2.0 — API client and data layer ([#2](../../pull/2))
- Added the axios client, TypeScript types, error mapping, and TanStack
  Query hooks (`useCard`, `useCards`, `useUploadCard`, `useResolveReview`).

### 0.1.0 — Project scaffolding ([#1](../../pull/1))
- Initial Next.js + TypeScript + Tailwind + shadcn/ui setup, theming, and
  project structure.
