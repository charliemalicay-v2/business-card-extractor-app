"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  CardListFilters,
  type StatusFilter,
} from "@/components/cards/CardListFilters";
import { CardTable } from "@/components/cards/CardTable";
import { NeedsReviewBadgeCount } from "@/components/cards/NeedsReviewBadgeCount";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { useCards } from "@/lib/hooks/useCards";
import { getTotalPages } from "@/lib/pagination";

const PAGE_SIZE = 10;

const EMPTY_STATE_MESSAGE: Record<StatusFilter, string> = {
  all: "No records yet. Upload a business card to get started.",
  confirmed: "No confirmed records yet.",
  needs_review: "No records need review right now.",
};

export default function CardsListPage() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useCards({
    status: status === "all" ? undefined : status,
    page,
    page_size: PAGE_SIZE,
  });

  function handleStatusChange(next: StatusFilter) {
    setStatus(next);
    setPage(1);
  }

  const totalPages = data ? getTotalPages(data.total, PAGE_SIZE) : 1;

  return (
    <div className="flex flex-1 items-start justify-center p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle>Card records</CardTitle>
            <NeedsReviewBadgeCount
              knownTotal={status === "needs_review" ? data?.total : undefined}
            />
          </div>
          <CardListFilters value={status} onChange={handleStatusChange} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {isError && (
            <ApiErrorAlert
              error={
                error ?? {
                  error_code: "unknown_error",
                  message: "Something went wrong loading records.",
                }
              }
            />
          )}

          {!isLoading && !isError && data && data.items.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
              <Inbox className="size-8" />
              <p className="text-sm">{EMPTY_STATE_MESSAGE[status]}</p>
            </div>
          )}

          {!isLoading && !isError && data && data.items.length > 0 && (
            <>
              <CardTable items={data.items} />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {data.page} of {totalPages} ({data.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
