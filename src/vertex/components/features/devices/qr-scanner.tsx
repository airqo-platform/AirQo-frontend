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
    const containerRef = useRef<HTMLDivElement>(null);
    const isMountedRef = useRef(true);
    const scannerId = useRef(`qr-reader-${Date.now()}`);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    // Stop all camera video tracks in the document
    const stopAllVideoTracks = useCallback(() => {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (video.srcObject) {
                const stream = video.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.kind === 'video' && track.stop());
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
                // Ignore cleanup errors
            } finally {
                scannerRef.current = null;
            }
        }
    }, [stopAllVideoTracks]);

    const handleScanSuccess = useCallback(
        (decodedText: string) => {
            if (!isMountedRef.current) return;
            onScan(decodedText);
            cleanupScanner();
        },
        [onScan, cleanupScanner]
    );

    const handleScanError = useCallback((errorMessage: string) => {
        if (!isMountedRef.current) return;

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
        if (!containerRef.current || scannerRef.current) return;

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

            scanner.render(handleScanSuccess, handleScanError);
            scannerRef.current = scanner;

        } catch (err) {
            console.error('Failed to initialize scanner:', err);
            setError('Failed to initialize camera. Please refresh and try again.');
        } finally {
            setIsInitializing(false);
        }
    }, [handleScanSuccess, handleScanError]);

    useEffect(() => {
        isMountedRef.current = true;

        const timer = setTimeout(() => initializeScanner(), 100);

        return () => {
            isMountedRef.current = false;
            clearTimeout(timer);
            cleanupScanner();
        };
    }, [initializeScanner, cleanupScanner]);

    const handleRetry = () => {
        setError(null);
        setHasPermission(null);
        cleanupScanner().then(() => setTimeout(() => initializeScanner(), 100));
    };

    return (
        <div className="w-full" ref={containerRef}>
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

            {isInitializing && !error && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Initializing camera...</p>
                </div>
            )}

            <div
                id={scannerId.current}
                className={`w-full rounded-lg overflow-hidden ${isInitializing || error ? 'hidden' : ''}`}
                style={{ minHeight: '300px' }}
            />

            {!error && !isInitializing && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">{instructions}</p>
            )}
        </div>
    );
};

export { QRScanner };
