import { QrCode, ScanLine, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { QrInfo } from "@/lib/types";

export function QrIndicator({ qr }: { qr: QrInfo }) {
  if (!qr.detected) {
    return (
      <Badge variant="outline">
        <XCircle data-icon="inline-start" />
        No QR code
      </Badge>
    );
  }

  if (!qr.decoded) {
    return (
      <Badge variant="destructive">
        <QrCode data-icon="inline-start" />
        QR detected, not decoded
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      <ScanLine data-icon="inline-start" />
      QR detected & decoded
    </Badge>
  );
}
