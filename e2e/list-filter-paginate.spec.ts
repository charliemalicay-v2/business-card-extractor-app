import { test, expect } from "@playwright/test";
import { confirmedNoQrCard, makeListItem } from "./fixtures";

const API_ORIGIN = "http://localhost:8000";

// Flow 3: list → filter by needs_review → paginate → open a record.
test("list view filters, paginates, and navigates to a record", async ({
  page,
}) => {
  const allItems = [
    ...Array.from({ length: 12 }, (_, i) =>
      makeListItem({ id: `confirmed-${i + 1}`, status: "confirmed", name: `Confirmed ${i + 1}` })
    ),
    ...Array.from({ length: 3 }, (_, i) =>
      makeListItem({ id: `review-${i + 1}`, status: "needs_review", name: `Review ${i + 1}` })
    ),
  ];

  await page.route(
    (url) => url.origin === API_ORIGIN && url.pathname === "/cards",
    async (route) => {
      const requestUrl = new URL(route.request().url());
      const status = requestUrl.searchParams.get("status");
      const pageParam = Number(requestUrl.searchParams.get("page") ?? "1");
      const pageSize = Number(requestUrl.searchParams.get("page_size") ?? "10");
      const filtered = status
        ? allItems.filter((item) => item.status === status)
        : allItems;
      const start = (pageParam - 1) * pageSize;
      await route.fulfill({
        status: 200,
        json: {
          items: filtered.slice(start, start + pageSize),
          total: filtered.length,
          page: pageParam,
          page_size: pageSize,
        },
      });
    }
  );

  await page.route(
    (url) => url.origin === API_ORIGIN && /^\/cards\/review-1$/.test(url.pathname),
    async (route) => {
      await route.fulfill({
        status: 200,
        json: { ...confirmedNoQrCard, id: "review-1", status: "needs_review" },
      });
    }
  );

  await page.goto("/cards");

  await expect(page.getByText("Page 1 of 2 (15 total)")).toBeVisible();
  await expect(page.getByText("3 needs review")).toBeVisible();

  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Needs review" }).click();

  await expect(page.getByText("Page 1 of 1 (3 total)")).toBeVisible();
  await expect(page.getByText("Review 1")).toBeVisible();
  await expect(page.getByText("Confirmed 1")).not.toBeVisible();

  await page.getByText("Review 1").click();

  await page.waitForURL("**/cards/review-1");
  await expect(page.getByText("Needs review").first()).toBeVisible();
});
