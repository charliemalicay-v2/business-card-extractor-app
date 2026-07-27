"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getErrorCopy } from "@/lib/api/errors";
import type { ApiError } from "@/lib/types";

const STAGE_LABEL: Record<NonNullable<ApiError["stage"]>, string> = {
  shape: "shape check",
  text_pattern: "text pattern check",
};

export function ApiErrorAlert({
  error,
  onRetry,
}: {
  error: ApiError;
  onRetry?: () => void;
}) {
  const copy = getErrorCopy(error.error_code);

  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>{copy.title}</AlertTitle>
      <AlertDescription>
        {error.message}
        {error.stage && ` (failed at ${STAGE_LABEL[error.stage]})`}
      </AlertDescription>
      {copy.retryable && onRetry && (
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </Alert>
  );
}
