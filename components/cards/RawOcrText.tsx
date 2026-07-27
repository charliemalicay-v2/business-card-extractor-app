"use client";

import { ChevronsUpDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export function RawOcrText({ text }: { text: string }) {
  return (
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger render={<Button variant="outline" size="sm" />}>
        <ChevronsUpDown data-icon="inline-start" />
        Raw OCR text
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground">
          {text}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}
