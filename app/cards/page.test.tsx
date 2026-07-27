import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/render";
import { server } from "@/test/msw/server";
import { BASE_URL, confirmedCard } from "@/test/msw/fixtures";
import type { CardListItem } from "@/lib/types";
import CardsListPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function makeItems(count: number): CardListItem[] {
  return Array.from({ length: count }, (_, i) => ({
    ...confirmedCard,
    id: `id-${i + 1}`,
    fields: {
      ...confirmedCard.fields,
      name: { ...confirmedCard.fields.name, value: `Person ${i + 1}` },
    },
  }));
}

describe("CardsListPage — filter and pagination", () => {
  it("lists all records by default, then filters to only needs_review", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CardsListPage />);

    await waitFor(() =>
      expect(screen.getByText("Page 1 of 1 (2 total)")).toBeInTheDocument()
    );
    expect(screen.getAllByRole("row")).toHaveLength(3); // header + 2 records

    await user.click(screen.getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: "Needs review" })
    );

    await waitFor(() =>
      expect(screen.getByText("Page 1 of 1 (1 total)")).toBeInTheDocument()
    );
    expect(screen.getAllByRole("row")).toHaveLength(2); // header + 1 record
  });

  it("paginates: Next/Previous move between pages and disable at the ends", async () => {
    const all = makeItems(15);
    server.use(
      http.get(`${BASE_URL}/cards`, ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page") ?? "1");
        const pageSize = Number(url.searchParams.get("page_size") ?? "10");
        const start = (page - 1) * pageSize;
        return HttpResponse.json({
          items: all.slice(start, start + pageSize),
          total: all.length,
          page,
          page_size: pageSize,
        });
      })
    );

    const user = userEvent.setup();
    renderWithQueryClient(<CardsListPage />);

    await waitFor(() =>
      expect(screen.getByText("Page 1 of 2 (15 total)")).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    expect(screen.getByText("Person 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() =>
      expect(screen.getByText("Page 2 of 2 (15 total)")).toBeInTheDocument()
    );
    // Re-query rather than reusing the earlier button references: the
    // pagination controls unmount/remount while the new page's query has no
    // cached data yet (isLoading briefly true), so stale references would
    // point at detached page-1 nodes.
    expect(screen.getByText("Person 11")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
  });
});
