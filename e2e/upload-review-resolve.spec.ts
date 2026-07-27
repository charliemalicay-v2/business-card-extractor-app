import { test, expect } from "@playwright/test";
import { needsReviewCard, resolvedCard } from "./fixtures";

const API_ORIGIN = "http://localhost:8000";

// Flow 2: upload a conflicting card → needs_review → resolve conflict →
// record becomes confirmed.
test("uploading a conflicting card resolves to confirmed", async ({
  page,
}) => {
  await page.route(
    (url) => url.origin === API_ORIGIN && url.pathname === "/cards",
    async (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      await route.fulfill({ status: 201, json: needsReviewCard });
    }
  );

  await page.route(
    (url) =>
      url.origin === API_ORIGIN &&
      new RegExp(`^/cards/${needsReviewCard.id}$`).test(url.pathname),
    async (route) => {
      await route.fulfill({ status: 200, json: needsReviewCard });
    }
  );

  await page.route(
    (url) =>
      url.origin === API_ORIGIN &&
      new RegExp(`^/cards/${needsReviewCard.id}/review$`).test(url.pathname),
    async (route) => {
      const body = route.request().postDataJSON();
      expect(body).toEqual({ company: "Acme Corporation" });
      await route.fulfill({ status: 200, json: resolvedCard });
    }
  );

  await page.goto("/");

  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "conflicting_card.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image-bytes"),
    });

  await page.waitForURL(`**/cards/${needsReviewCard.id}`);

  await expect(page.getByText("Needs review")).toBeVisible();
  const saveButton = page.getByRole("button", { name: "Save review" });
  await expect(saveButton).toBeDisabled();

  // Resolve the `company` conflict by picking the QR candidate.
  await page.getByText("Acme Corporation").click();
  await expect(saveButton).toBeEnabled();

  await saveButton.click();

  await expect(page.getByText("Review saved")).toBeVisible();
  await expect(page.getByText("Confirmed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Needs review")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save review" })
  ).not.toBeVisible();
});
