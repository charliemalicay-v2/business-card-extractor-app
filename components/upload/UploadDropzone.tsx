"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { useUploadCard } from "@/lib/hooks/useUploadCard";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/lib/types";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [preCheckError, setPreCheckError] = useState<ApiError | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const { mutate, isPending, isError, error } = useUploadCard();

  function validateAndUpload(file: File) {
    setLastFile(file);

    if (!file.type.startsWith("image/")) {
      setPreCheckError({
        error_code: "unsupported_format",
        message: "Please select an image file (JPEG, PNG, etc).",
      });
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setPreCheckError({
        error_code: "file_too_large",
        message: "File exceeds the maximum allowed size of 10485760 bytes.",
      });
      return;
    }

    setPreCheckError(null);
    mutate(file);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) validateAndUpload(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
    if (isPending) return;
    const file = event.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  }

  const displayedError = preCheckError ?? (isError ? error : null);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        aria-disabled={isPending}
        onClick={() => !isPending && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!isPending && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isPending) setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-10 text-center transition-colors",
          isPending
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-primary/50 hover:bg-muted/50",
          isDragActive && "border-primary bg-muted/50"
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Extracting card details…
            </p>
          </>
        ) : (
          <>
            <UploadCloud className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drop a business card image, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, etc. Up to 10MB.
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          tabIndex={-1}
          className="sr-only"
          disabled={isPending}
          onChange={handleInputChange}
          onClick={(event) => event.stopPropagation()}
        />
      </div>

      {displayedError && (
        <ApiErrorAlert
          error={displayedError}
          onRetry={
            lastFile ? () => validateAndUpload(lastFile) : undefined
          }
        />
      )}
    </div>
  );
}
