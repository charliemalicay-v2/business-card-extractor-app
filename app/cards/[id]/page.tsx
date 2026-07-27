"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { FileQuestion } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/cards/StatusBadge";
import { FieldRow } from "@/components/cards/FieldRow";
import { QrIndicator } from "@/components/cards/QrIndicator";
import { RawOcrText } from "@/components/cards/RawOcrText";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { useCard } from "@/lib/hooks/useCard";
import { useResolveReview } from "@/lib/hooks/useResolveReview";
import type { CardFields } from "@/lib/types";

const FIELD_ORDER: (keyof CardFields)[] = [
  "name",
  "position",
  "company",
  "email",
  "phone",
];

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: card, isLoading, isError, error } = useCard(id);
  const [resolutions, setResolutions] = useState<Record<string, string>>({});
  const resolveReview = useResolveReview(id);

  function handleResolutionChange(field: string, value: string | undefined) {
    setResolutions((prev) => {
      const next = { ...prev };
      if (value === undefined) {
        delete next[field];
      } else {
        next[field] = value;
      }
      return next;
    });
  }

  function handleSubmitReview() {
    resolveReview.mutate(resolutions, {
      onSuccess: () => setResolutions({}),
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError && error.error_code === "record_not_found") {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <FileQuestion className="size-8 text-muted-foreground" />
            <CardTitle>Record not found</CardTitle>
            <p className="text-sm text-muted-foreground">
              This card record doesn&apos;t exist or may have been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !card) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <ApiErrorAlert
            error={
              error ?? {
                error_code: "unknown_error",
                message: "Something went wrong loading this record.",
              }
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Card details</CardTitle>
          <StatusBadge status={card.status} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            {FIELD_ORDER.map((field) => (
              <FieldRow
                key={field}
                field={field}
                value={card.fields[field]}
                onResolutionChange={(value) =>
                  handleResolutionChange(field, value)
                }
              />
            ))}
          </div>

          {card.status === "needs_review" && (
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              {resolveReview.isError && (
                <ApiErrorAlert error={resolveReview.error} />
              )}
              <Button
                type="button"
                onClick={handleSubmitReview}
                disabled={
                  Object.keys(resolutions).length === 0 ||
                  resolveReview.isPending
                }
              >
                {resolveReview.isPending ? "Saving…" : "Save review"}
              </Button>
            </div>
          )}

          {Object.keys(card.optional_fields).length > 0 && (
            <div className="flex flex-col gap-1 border-t border-border pt-3">
              <span className="text-sm font-medium text-muted-foreground">
                Additional details
              </span>
              {Object.entries(card.optional_fields).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{key}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-3">
            <QrIndicator qr={card.qr} />
            <div className="text-right text-xs text-muted-foreground">
              <p>Created {dateFormatter.format(new Date(card.created_at))}</p>
              <p>Updated {dateFormatter.format(new Date(card.updated_at))}</p>
            </div>
          </div>

          <RawOcrText text={card.raw_ocr_text} />
        </CardContent>
      </Card>
    </div>
  );
}
