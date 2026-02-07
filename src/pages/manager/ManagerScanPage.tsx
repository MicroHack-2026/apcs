import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { QrScannerOverlay } from "@/components/QrScannerOverlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRecentScans, useRecordScan } from "@/hooks/useScans";
import { format } from "date-fns";

interface BookingPayload {
  bookingId: string;
  containerId: string;
  date: string;
  time: string;
}

export default function ManagerScanPage() {
  const navigate = useNavigate();
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [parsedBooking, setParsedBooking] = useState<BookingPayload | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<"requesting" | "active" | "error" | "idle">("idle");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);
  const isStartingRef = useRef(false);

  const { data: recentScans = [] } = useRecentScans();
  const recordScanMutation = useRecordScan();

  const parseQrPayload = (text: string): BookingPayload | null => {
    try {
      const parsed = JSON.parse(text);
      if (parsed.bookingId && parsed.containerId && parsed.date && parsed.time) {
        return parsed as BookingPayload;
      }
      return null;
    } catch {
      return null;
    }
  };

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scannerRef.current.stop();
        }
      } catch {
      }
      try {
        scannerRef.current.clear();
      } catch {
      }
      scannerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsScanning(false);
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    setError(null);
    setScannedResult(null);
    setParsedBooking(null);
    setIsConfirmed(false);
    setCameraStatus("requesting");

    try {
      await stopScanner();
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!isMountedRef.current) {
        isStartingRef.current = false;
        return;
      }

      const qrReaderElement = document.getElementById("qr-reader");
      if (!qrReaderElement) throw new Error("QR reader element not found");

      const html5QrCode = new Html5Qrcode("qr-reader", { verbose: false });
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 }, aspectRatio: 1.333333, disableFlip: false },
        (decodedText) => {
          if (isMountedRef.current) {
            setScannedResult(decodedText);
            const booking = parseQrPayload(decodedText);
            setParsedBooking(booking);
            setIsScanning(false);
            setCameraStatus("idle");
          }
          html5QrCode.stop().catch(() => {});
        },
        () => {}
      );

      if (isMountedRef.current) {
        setIsScanning(true);
        setCameraStatus("active");
      }
    } catch (err) {
      if (isMountedRef.current) {
        setCameraStatus("error");
        if (err instanceof Error) {
          if (err.message.includes("Permission") || err.message.includes("NotAllowedError")) {
            setError("Camera permission denied. Please allow camera access.");
          } else if (err.message.includes("NotFoundError") || err.message.includes("NotReadableError")) {
            setError("No camera found or camera is in use.");
          } else {
            setError(`Failed to start camera: ${err.message}`);
          }
        } else {
          setError("Failed to start camera. Please try again.");
        }
        setIsScanning(false);
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [stopScanner]);

  const handleScanAgain = () => {
    setScannedResult(null);
    setParsedBooking(null);
    setIsConfirmed(false);
    startScanner();
  };

  const handleConfirm = () => {
    if (parsedBooking && scannedResult) {
      recordScanMutation.mutate({
        bookingId: parsedBooking.bookingId,
        containerId: parsedBooking.containerId,
        timestamp: new Date().toISOString(),
        decodedPayload: scannedResult,
        confirmed: true,
      });
      setIsConfirmed(true);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  useEffect(() => {
    isMountedRef.current = true;
    const timeoutId = setTimeout(() => startScanner(), 300);
    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 flex items-center justify-end px-6 gap-3 border-b border-border">
        <span className="mr-auto font-semibold text-foreground text-lg pl-2">Portly — Manager</span>
        <Button variant="outline" size="sm" className="rounded-full px-4">
          Help
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-4 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-foreground">Scan QR Code</h1>
                <p className="text-muted-foreground mt-1">
                  Position the QR code within the camera frame
                </p>
              </div>

              <div className="w-full max-w-[420px] mx-auto">
                <div className={cn(
                  "relative w-full aspect-[4/3] overflow-hidden rounded-xl border border-border bg-secondary/30"
                )}>
                  <div id="qr-reader" className="absolute inset-0 w-full h-full" style={{ border: 'none' }} />

                  {cameraStatus === "active" && !scannedResult && <QrScannerOverlay />}

                  {cameraStatus === "requesting" && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
                      <p className="text-muted-foreground">Requesting camera permission...</p>
                    </div>
                  )}

                  {cameraStatus === "active" && !scannedResult && (
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <p className="text-sm text-white bg-black/50 inline-block px-3 py-1 rounded-full">
                        Point camera at QR code
                      </p>
                    </div>
                  )}

                  {scannedResult && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <p className="text-white font-medium">QR Detected</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-white border border-border rounded-xl text-center">
                  <p className="text-sm text-destructive mb-3">{error}</p>
                  <Button variant="outline" size="sm" onClick={handleScanAgain}>Try again</Button>
                </div>
              )}

              <div className="p-4 bg-white border border-border rounded-xl shadow-card">
                <p className="text-sm text-muted-foreground mb-2">Scan Result:</p>
                {parsedBooking ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Booking ID:</span>
                      <span className="font-medium">{parsedBooking.bookingId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Container:</span>
                      <span className="font-medium">{parsedBooking.containerId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{parsedBooking.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{parsedBooking.time}</span>
                    </div>
                  </div>
                ) : scannedResult ? (
                  <p className="font-medium text-foreground break-all">{scannedResult}</p>
                ) : (
                  <p className="text-muted-foreground">Waiting for scan...</p>
                )}
              </div>

              {isConfirmed && (
                <div className="p-4 bg-status-arrived/10 border border-status-arrived/30 rounded-xl text-center">
                  <p className="font-medium text-status-arrived">Appointment confirmed successfully</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {scannedResult && !isConfirmed && (
                  <>
                    <Button onClick={handleConfirm} disabled={recordScanMutation.isPending} className="flex-1 sm:flex-none sm:min-w-[160px]">
                      {recordScanMutation.isPending ? "Confirming..." : "Confirm"}
                    </Button>
                    <Button variant="outline" onClick={handleScanAgain} className="flex-1 sm:flex-none sm:min-w-[160px]">
                      Scan again
                    </Button>
                  </>
                )}
                {isConfirmed && (
                  <Button variant="outline" onClick={handleScanAgain} className="sm:min-w-[160px]">
                    Scan another
                  </Button>
                )}
                {!scannedResult && !error && isScanning && (
                  <button onClick={stopScanner} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Stop camera
                  </button>
                )}
                {!scannedResult && !error && !isScanning && cameraStatus === "idle" && (
                  <Button variant="outline" onClick={handleScanAgain}>Start camera</Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Scans</h2>
              <div className="bg-white border border-border rounded-xl shadow-card overflow-hidden">
                {recentScans.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    No scan events yet
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentScans.slice(0, 10).map((scan) => {
                      let payload: BookingPayload | null = null;
                      try { payload = JSON.parse(scan.decodedPayload); } catch {}

                      return (
                        <div key={scan.id} className="px-5 py-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{payload?.containerId || scan.containerId}</span>
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                              scan.confirmed
                                ? "bg-status-arrived/10 text-status-arrived"
                                : "bg-secondary text-muted-foreground"
                            )}>
                              {scan.confirmed ? "Confirmed" : "Pending"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Booking: {payload?.bookingId || scan.bookingId}</span>
                            <span className="text-border">·</span>
                            <span>{format(new Date(scan.timestamp), "MMM dd, HH:mm")}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
