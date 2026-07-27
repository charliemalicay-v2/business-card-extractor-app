import { test, expect } from "@playwright/test";
import { confirmedNoQrCard } from "./fixtures";

const API_ORIGIN = "http://localhost:8000";

// Flow 1: upload a no-QR card → lands on a `confirmed` detail view.
test("uploading a no-QR card lands on the confirmed detail view", async ({
  page,
}) => {
  await page.route(
    (url) => url.origin === API_ORIGIN && url.pathname === "/cards",
    async (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      await route.fulfill({ status: 201, json: confirmedNoQrCard });
    }
  );

  await page.route(
    (url) =>
      url.origin === API_ORIGIN &&
      new RegExp(`^/cards/${confirmedNoQrCard.id}$`).test(url.pathname),
    async (route) => {
      await route.fulfill({ status: 200, json: confirmedNoQrCard });
    }
  );

  await page.goto("/");

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "jane_doe_card.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("fake-image-bytes"),
  });

  await page.waitForURL(`**/cards/${confirmedNoQrCard.id}`);

  await expect(page.getByText("Confirmed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Jane Doe")).toBeVisible();
  await expect(page.getByText("Acme Corp")).toBeVisible();
  await expect(page.getByText("jane@acme.com")).toBeVisible();
  // No conflicts on this record, so there's nothing to review/save.
  await expect(
    page.getByRole("button", { name: "Save review" })
  ).not.toBeVisible();
});
