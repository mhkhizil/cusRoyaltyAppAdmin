import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Html5Qrcode, type Html5QrcodeCameraScanConfig } from "html5-qrcode";
import { Button } from "@/components/ui/Button";

type QrScannerProps = {
  onScan: (decodedText: string) => void;
  /** Pause decoding while parent processes a scan */
  paused?: boolean;
  className?: string;
};

export type QrScannerHandle = {
  stopCamera: () => Promise<void>;
};

/**
 * Camera QR scanner for admin dashboard point awards.
 * Uses the device camera via html5-qrcode.
 */
export const QrScanner = forwardRef<QrScannerHandle, QrScannerProps>(
  function QrScanner({ onScan, paused = false, className = "" }, ref) {
  const { t } = useTranslation();
  const reactId = useId();
  const elementId = `qr-reader-${reactId.replace(/:/g, "")}`;
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  const lastDecodedRef = useRef<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner?.isScanning) {
        void scanner.stop().then(() => scanner.clear()).catch(() => undefined);
      }
    };
  }, []);

  useEffect(() => {
    const scanner = scannerRef.current;
    if (!scanner || !isRunning) return;

    try {
      if (paused) {
        scanner.pause(true);
        return;
      }
      scanner.resume();
    } catch {
      // Camera may still be warming up / already paused
    }
  }, [paused, isRunning]);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // Ignore stop races on unmount / rapid toggles
    } finally {
      scannerRef.current = null;
      setIsRunning(false);
      lastDecodedRef.current = null;
    }
  };

  useImperativeHandle(ref, () => ({
    stopCamera: stopScanner,
  }));

  const startScanner = async () => {
    if (isStarting || isRunning) return;

    setIsStarting(true);
    setCameraError(null);
    lastDecodedRef.current = null;

    try {
      await stopScanner();

      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;

      const config: Html5QrcodeCameraScanConfig = {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const edge = Math.floor(
            Math.min(viewfinderWidth, viewfinderHeight) * 0.72
          );
          return { width: edge, height: edge };
        },
        aspectRatio: 1,
      };

      await scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          const token = decodedText.trim();
          if (!token || token === lastDecodedRef.current) return;
          lastDecodedRef.current = token;
          onScanRef.current(token);
        },
        () => {
          // Continuous "not found" frame callbacks — ignore
        }
      );

      setIsRunning(true);
    } catch (error) {
      scannerRef.current = null;
      setIsRunning(false);
      const message =
        error instanceof Error ? error.message : t("points.scan.cameraError");
      setCameraError(message);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className={["space-y-3", className].filter(Boolean).join(" ")}>
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-700">
        <div
          id={elementId}
          className={isRunning ? "min-h-[240px] w-full" : "h-0 w-full overflow-hidden"}
        />
        {!isRunning ? (
          <div className="flex min-h-[160px] items-center justify-center px-4 py-8 text-center text-sm text-slate-300">
            {t("points.scan.cameraIdle")}
          </div>
        ) : null}
      </div>

      {cameraError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {cameraError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {isRunning ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void stopScanner();
            }}
          >
            {t("points.scan.stopCamera")}
          </Button>
        ) : (
          <Button
            type="button"
            isLoading={isStarting}
            onClick={() => {
              void startScanner();
            }}
          >
            {t("points.scan.startCamera")}
          </Button>
        )}
      </div>
    </div>
  );
});
