"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Choice = "ocr" | "qr" | "custom";

export function ConflictResolver({
  ocrValue,
  qrValue,
  onChange,
}: {
  ocrValue: string | null;
  qrValue: string | null;
  onChange: (value: string | undefined) => void;
}) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [customValue, setCustomValue] = useState("");

  function select(next: Choice, sourceValue: string | null) {
    setChoice(next);
    onChange(sourceValue ?? undefined);
  }

  function selectCustom(next: string) {
    setChoice("custom");
    setCustomValue(next);
    onChange(next.trim() || undefined);
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <button
          type="button"
          onClick={() => select("ocr", ocrValue)}
          disabled={ocrValue == null}
          className={cn(
            "rounded-md border p-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            choice === "ocr"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <p className="text-xs text-muted-foreground">Printed / OCR</p>
          <p>{ocrValue ?? "—"}</p>
        </button>
        <button
          type="button"
          onClick={() => select("qr", qrValue)}
          disabled={qrValue == null}
          className={cn(
            "rounded-md border p-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            choice === "qr"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <p className="text-xs text-muted-foreground">QR code</p>
          <p>{qrValue ?? "—"}</p>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={choice === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => selectCustom(customValue)}
        >
          Custom
        </Button>
        {choice === "custom" && (
          <Input
            value={customValue}
            onChange={(event) => selectCustom(event.target.value)}
            placeholder="Enter corrected value"
          />
        )}
      </div>
    </div>
  );
}
