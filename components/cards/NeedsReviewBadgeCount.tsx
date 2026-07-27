"use client";

import { Badge } from "@/components/ui/badge";
import { useCards } from "@/lib/hooks/useCards";

export function NeedsReviewBadgeCount() {
  const { data } = useCards({ status: "needs_review", page: 1, page_size: 1 });
  const total = data?.total ?? 0;

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
