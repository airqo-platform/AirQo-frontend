'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface QRScannerProps {
    onScan: (result: string) => void;
    onClose: () => void;
    /**
     * Optional: Instructions to display below the scanner
     */
    instructions?: string;
    /**
     * Optional: Whether to show the close button in the header
     */
    showCloseButton?: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({
    onScan,
    onClose,
    instructions = 'Point your camera at the QR code on your device label',
    showCloseButton = true,
}) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const scannerId = useRef(`qr-reader-${Date.now()}`);

    const handleScanSuccess = useCallback((decodedText: string) => {
        // Prevent multiple scans
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        onScan(decodedText);
    }, [onScan]);

    const handleScanError = useCallback((errorMessage: string) => {
        // Ignore "not found" errors - these are normal during scanning
        if (
            errorMessage.includes('No QR code found') ||
            errorMessage.includes('NotFound') ||
            errorMessage.includes('NotFoundException')
        ) {
            return;
        }

        // Handle permission errors
        if (
            errorMessage.includes('NotAllowedError') ||
            errorMessage.includes('Permission')
        ) {
            setHasPermission(false);
            setError('Camera access denied. Please allow camera access and try again.');
            return;
        }

        // Handle device not found
        if (errorMessage.includes('NotFoundError')) {
            setError('No camera found on this device.');
            return;
        }

        console.warn('QR Scanner warning:', errorMessage);
    }, []);

    const initializeScanner = useCallback(() => {
        if (scannerRef.current || !containerRef.current) return;

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
                false // verbose
            );

            scanner.render(handleScanSuccess, handleScanError);
            scannerRef.current = scanner;
            setHasPermission(true);
            setIsInitializing(false);
        } catch (err) {
            console.error('Failed to initialize scanner:', err);
            setError('Failed to initialize camera. Please refresh and try again.');
            setIsInitializing(false);
        }
    }, [handleScanSuccess, handleScanError]);

    useEffect(() => {
        // Small delay to ensure DOM is ready
        const timer = setTimeout(initializeScanner, 100);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, [initializeScanner]);

    const handleRetry = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        setError(null);
        setHasPermission(null);
        setTimeout(initializeScanner, 100);
    };

    const handleClose = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        onClose();
    };

    return (
        <div className="w-full" ref={containerRef}>
            {/* Error State */}
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

            {/* Initializing State */}
            {isInitializing && !error && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Initializing camera...
                    </p>
                </div>
            )}

            {/* Scanner Container */}
            <div
                id={scannerId.current}
                className={`w-full rounded-lg overflow-hidden ${isInitializing || error ? 'hidden' : ''}`}
                style={{
                    // Override html5-qrcode default styles
                    minHeight: '300px',
                }}
            />

            {/* Instructions */}
            {!error && !isInitializing && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    {instructions}
                </p>
            )}

            {/* Scanner Styling Overrides */}
            <style jsx global>{`
                #${scannerId.current} {
                    border: none !important;
                    padding: 0 !important;
                }
                #${scannerId.current} video {
                    border-radius: 8px;
                }
                #${scannerId.current}__scan_region {
                    background: transparent !important;
                }
                #${scannerId.current}__scan_region img {
                    display: none !important;
                }
                #${scannerId.current}__dashboard {
                    padding: 8px 0 !important;
                }
                #${scannerId.current}__dashboard_section_csr button {
                    background-color: #2563eb !important;
                    border: none !important;
                    border-radius: 6px !important;
                    padding: 8px 16px !important;
                    color: white !important;
                    font-size: 14px !important;
                    cursor: pointer !important;
                }
                #${scannerId.current}__dashboard_section_csr button:hover {
                    background-color: #1d4ed8 !important;
                }
                #${scannerId.current}__dashboard_section_swaplink {
                    color: #2563eb !important;
                    text-decoration: none !important;
                    font-size: 14px !important;
                }
                #${scannerId.current}__header_message {
                    display: none !important;
                }
                /* Dark mode support */
                .dark #${scannerId.current}__dashboard_section_csr span,
                .dark #${scannerId.current}__dashboard span,
                .dark #${scannerId.current} span {
                    color: #9ca3af !important;
                }
                .dark #${scannerId.current}__dashboard_section_swaplink {
                    color: #60a5fa !important;
                }
            `}</style>
        </div>
    );
};

export { QRScanner };