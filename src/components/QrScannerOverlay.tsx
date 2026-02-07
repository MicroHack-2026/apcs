import { cn } from "@/lib/utils";

interface QrScannerOverlayProps {
  className?: string;
}

export function QrScannerOverlay({ className }: QrScannerOverlayProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
        <div className="qr-frame-corner qr-frame-corner--top-left" />
        <div className="qr-frame-corner qr-frame-corner--top-right" />
        <div className="qr-frame-corner qr-frame-corner--bottom-left" />
        <div className="qr-frame-corner qr-frame-corner--bottom-right" />
      </div>
    </div>
  );
}
