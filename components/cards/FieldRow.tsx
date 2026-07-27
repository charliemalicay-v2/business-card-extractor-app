import { FieldStatusBadge } from "@/components/cards/StatusBadge";
import type { CardFields, FieldValue } from "@/lib/types";

const FIELD_LABEL: Record<keyof CardFields, string> = {
  name: "Name",
  position: "Position",
  company: "Company",
  email: "Email",
  phone: "Phone",
};

export function FieldRow({
  field,
  value,
}: {
  field: keyof CardFields;
  value: FieldValue;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {FIELD_LABEL[field]}
        </span>
        <FieldStatusBadge status={value.status} />
      </div>

      {value.status === "conflict" ? (
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Printed / OCR</p>
            <p>{value.ocr_llm_value ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">QR code</p>
            <p>{value.qr_value ?? "—"}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm">{value.value ?? "—"}</p>
      )}
    </div>
  );
}
