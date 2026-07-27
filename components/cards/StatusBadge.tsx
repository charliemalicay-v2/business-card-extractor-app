import { CheckCircle2, CircleDashed, CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FieldStatus, RecordStatus } from "@/lib/types";

const RECORD_STATUS_LABEL: Record<RecordStatus, string> = {
  confirmed: "Confirmed",
  needs_review: "Needs review",
};

export function StatusBadge({ status }: { status: RecordStatus }) {
  return (
    <Badge variant={status === "confirmed" ? "secondary" : "destructive"}>
      {status === "confirmed" ? (
        <CheckCircle2 data-icon="inline-start" />
      ) : (
        <CircleAlert data-icon="inline-start" />
      )}
      {RECORD_STATUS_LABEL[status]}
    </Badge>
  );
}

const FIELD_STATUS_LABEL: Record<FieldStatus, string> = {
  confirmed: "Confirmed",
  unverified: "Unverified",
  conflict: "Conflict",
};

export function FieldStatusBadge({ status }: { status: FieldStatus }) {
  if (status === "confirmed") {
    return (
      <Badge variant="secondary">
        <CheckCircle2 data-icon="inline-start" />
        {FIELD_STATUS_LABEL[status]}
      </Badge>
    );
  }

  if (status === "conflict") {
    return (
      <Badge variant="destructive">
        <CircleAlert data-icon="inline-start" />
        {FIELD_STATUS_LABEL[status]}
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      <CircleDashed data-icon="inline-start" />
      {FIELD_STATUS_LABEL[status]}
    </Badge>
  );
}
