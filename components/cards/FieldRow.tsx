import { FieldStatusBadge } from "@/components/cards/StatusBadge";
import { ConflictResolver } from "@/components/cards/ConflictResolver";
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
  onResolutionChange,
}: {
  field: keyof CardFields;
  value: FieldValue;
  onResolutionChange?: (value: string | undefined) => void;
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
        <ConflictResolver
          ocrValue={value.ocr_llm_value}
          qrValue={value.qr_value}
          onChange={onResolutionChange ?? (() => {})}
        />
      ) : (
        <div>
          <p className="text-sm">{value.value ?? "—"}</p>
          {value.status === "unverified" && (
            <p className="text-xs text-muted-foreground">
              Only one source (OCR/LLM) was available — nothing to cross-check
              against.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
