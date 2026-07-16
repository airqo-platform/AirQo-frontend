'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface QRScannerProps {
    onScan: (result: string) => void;
    instructions?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({
    onScan,
    instructions = 'Point your camera at the QR code on your device label',
}) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const isMountedRef = useRef(true);
    const scannerId = useRef(`qr-reader-${Date.now()}`);
    // Stable ref so useCallback deps don't change when parent re-renders
    const onScanRef = useRef(onScan);
    useEffect(() => { onScanRef.current = onScan; }, [onScan]);

    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const stopAllVideoTracks = useCallback(() => {
        document.querySelectorAll('video').forEach(video => {
            if (video.srcObject) {
                (video.srcObject as MediaStream).getTracks().forEach(t => t.kind === 'video' && t.stop());
                video.srcObject = null;
            }
        });
    }, []);

    const cleanupScanner = useCallback(async () => {
        stopAllVideoTracks();
        if (scannerRef.current) {
            try {
                await scannerRef.current.clear();
            } catch {
                // ignore cleanup errors
            } finally {
                scannerRef.current = null;
            }
        }
    }, [stopAllVideoTracks]);

    const handleScanSuccess = useCallback(
        (decodedText: string) => {
            if (!isMountedRef.current) return;
            onScanRef.current(decodedText);
            cleanupScanner();
        },
        [cleanupScanner]
    );

    const handleScanError = useCallback((errorMessage: string) => {
        if (!isMountedRef.current) return;

        // "No QR code found" fires on every frame — ignore
        if (
            errorMessage.includes('No QR code found') ||
            errorMessage.includes('NotFound') ||
            errorMessage.includes('NotFoundException')
        ) {
            return;
        }

        if (
            errorMessage.includes('NotAllowedError') ||
            errorMessage.includes('Permission')
        ) {
            setHasPermission(false);
            setError('Camera access denied. Please allow camera access and try again.');
            return;
        }

        if (process.env.NODE_ENV === 'development') {
            console.warn('QR Scanner warning:', errorMessage);
        }
    }, []);

    const initializeScanner = useCallback(() => {
        // Guard: don't double-init
        if (scannerRef.current) return;

        // Guard: target element must exist and be visible in the DOM
        const el = document.getElementById(scannerId.current);
        if (!el) return;

        setIsInitializing(true);
        setError(null);

        try {
            const scanner = new Html5QrcodeScanner(
                scannerId.current,
                {
                    qrbox: { width: 250, height: 250 },
                    fps: 10,
                    aspectRatio: 1,
                    showTorchButtonIfSupported: true,
                    showZoomSliderIfSupported: true,
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                    rememberLastUsedCamera: true,
                },
                false
            );

            // render() is async — camera permission prompt fires after this call.
            // We clear isInitializing once the first successful scan frame arrives
            // (handled in handleScanSuccess) or after a short grace period so the
            // library's own UI becomes visible.
            scanner.render(
                handleScanSuccess,
                handleScanError,
            );

            scannerRef.current = scanner;

            // Give the library ~600 ms to inject its UI before hiding the spinner.
            // This is safer than setting false immediately (which hides the div
            // before the library has measured it).
            setTimeout(() => {
                if (isMountedRef.current) setIsInitializing(false);
            }, 600);

        } catch (err) {
            console.error('Failed to initialize scanner:', err);
            setError('Failed to initialize camera. Please refresh and try again.');
            setIsInitializing(false);
        }
    }, [handleScanSuccess, handleScanError]);

    useEffect(() => {
        isMountedRef.current = true;

        // Small delay so the scanner div is painted and measurable before init
        const timer = setTimeout(() => initializeScanner(), 150);

        return () => {
            isMountedRef.current = false;
            clearTimeout(timer);
            cleanupScanner();
        };
    }, [initializeScanner, cleanupScanner]);

    const handleRetry = () => {
        setError(null);
        setHasPermission(null);
        cleanupScanner().then(() => setTimeout(() => initializeScanner(), 150));
    };

    return (
        <div className="w-full">
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            {hasPermission === false && (
                                <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                                    Check your browser settings to enable camera access.
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleRetry}
                        className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </button>
                </div>
            )}

            {/* Scanner div is always in the DOM so the library can measure it.
                The loading spinner overlays it until the library is ready. */}
            <div className="relative w-full" style={{ minHeight: '300px' }}>
                {isInitializing && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-background z-10">
                        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Initializing camera...</p>
                    </div>
                )}
                <div
                    id={scannerId.current}
                    className="w-full rounded-lg overflow-hidden"
                    style={{ minHeight: '300px' }}
                />
            </div>

            {!error && !isInitializing && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">{instructions}</p>
            )}
        </div>
    );
};

export { QRScanner };
