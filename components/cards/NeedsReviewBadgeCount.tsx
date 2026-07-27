"use client";

import { Badge } from "@/components/ui/badge";
import { useCards } from "@/lib/hooks/useCards";

/**
 * Shows the needs_review total as a badge. If the caller already has this
 * total from another query (e.g. the list view is already filtered to
 * needs_review), pass it via `knownTotal` to skip firing a duplicate request.
 */
export function NeedsReviewBadgeCount({
  knownTotal,
}: {
  knownTotal?: number;
}) {
  const { data } = useCards(
    { status: "needs_review", page: 1, page_size: 1 },
    { enabled: knownTotal === undefined }
  );
  const total = knownTotal ?? data?.total ?? 0;

  if (total === 0) return null;

  return (
    <Badge
      variant="outline"
      className="border-accent/60 bg-accent/10 text-accent-foreground"
    >
      {total} needs review
    </Badge>
  );
}
