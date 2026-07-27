import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/render";
import { needsReviewCard, confirmedCard } from "@/test/msw/fixtures";
import CardDetailPage from "./page";

const mockParams = vi.hoisted(() => ({ id: "" }));

vi.mock("next/navigation", () => ({
  useParams: () => mockParams,
}));

describe("CardDetailPage — review resolution", () => {
  it("disables Save review until at least one conflict is resolved", async () => {
    mockParams.id = needsReviewCard.id;
    const user = userEvent.setup();
    renderWithQueryClient(<CardDetailPage />);

    const saveButton = await screen.findByRole("button", {
      name: "Save review",
    });
    expect(saveButton).toBeDisabled();

    // Resolve the `company` conflict by picking the QR candidate.
    await user.click(screen.getByText("Acme Corporation"));

    expect(saveButton).toBeEnabled();
  });

  it("only shows review controls when the record is needs_review", async () => {
    mockParams.id = confirmedCard.id;
    renderWithQueryClient(<CardDetailPage />);

    await waitFor(() =>
      expect(screen.getByText("Confirmed")).toBeInTheDocument()
    );
    expect(
      screen.queryByRole("button", { name: "Save review" })
    ).not.toBeInTheDocument();
  });
});
