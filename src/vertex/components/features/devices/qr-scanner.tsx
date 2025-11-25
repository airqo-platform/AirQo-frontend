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
    const isCleaningUpRef = useRef(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const scannerId = useRef(`qr-reader-${Date.now()}`);

    // Helper function to stop all active video tracks (camera streams)
    const stopAllVideoTracks = useCallback(() => {
        try {
            // Stop all video tracks from video elements in the scanner container
            const scannerElement = document.getElementById(scannerId.current);
            if (scannerElement) {
                const videoElements = scannerElement.querySelectorAll('video');
                videoElements.forEach(video => {
                    if (video.srcObject) {
                        const stream = video.srcObject as MediaStream;
                        stream.getTracks().forEach(track => {
                            if (track.kind === 'video') {
                                track.stop();
                            }
                        });
                        video.srcObject = null;
                    }
                });
            }

            // Also check for any other video elements that might be from the scanner
            // This is a safety measure in case the scanner creates video elements outside its container
            const allVideos = document.querySelectorAll('video');
            allVideos.forEach(video => {
                if (video.srcObject) {
                    const stream = video.srcObject as MediaStream;
                    const tracks = stream.getTracks();
                    // Only stop tracks that are from camera (video input)
                    tracks.forEach(track => {
                        if (track.kind === 'video' && track.readyState === 'live') {
                            // Check if this track is likely from our scanner by checking constraints
                            const settings = track.getSettings();
                            if (settings && (settings.deviceId || settings.facingMode)) {
                                track.stop();
                            }
                        }
                    });
                    // Clear srcObject if all tracks are stopped
                    if (tracks.every(t => t.readyState === 'ended')) {
                        video.srcObject = null;
                    }
                }
            });
        } catch (err) {
            // Silently ignore errors when stopping video tracks
            if (process.env.NODE_ENV === 'development') {
                console.warn('Error stopping video tracks:', err);
            }
        }
    }, []);

    // Safe cleanup function that handles errors gracefully
    const safeCleanup = useCallback(async () => {
        if (isCleaningUpRef.current || !scannerRef.current) {
            // Even if cleanup is in progress, ensure video tracks are stopped
            stopAllVideoTracks();
            return;
        }

        isCleaningUpRef.current = true;
        const scanner = scannerRef.current;

        try {
            // First, stop all video tracks immediately to stop camera
            stopAllVideoTracks();

            // Check if the DOM element still exists before attempting to clear
            const element = document.getElementById(scannerId.current);
            if (element && element.parentNode) {
                await scanner.clear();
            }
        } catch (err) {
            // Silently handle errors during cleanup - DOM might already be removed
            // Only log in development
            if (process.env.NODE_ENV === 'development') {
                console.warn('QR Scanner cleanup warning:', err);
            }
        } finally {
            scannerRef.current = null;
            isCleaningUpRef.current = false;
            // Ensure video tracks are stopped even if cleanup fails
            stopAllVideoTracks();
        }
    }, [stopAllVideoTracks]);

    const handleScanSuccess = useCallback((decodedText: string) => {
        // Prevent multiple scans
        if (scannerRef.current && isMountedRef.current) {
            safeCleanup().catch(() => {
                // Ignore cleanup errors
            });
        }
        if (isMountedRef.current) {
            onScan(decodedText);
        }
    }, [onScan, safeCleanup]);

    const handleScanError = useCallback((errorMessage: string) => {
        // Don't update state if component is unmounted or cleaning up
        if (!isMountedRef.current || isCleaningUpRef.current) {
            return;
        }

        // Ignore "not found" errors - these are normal during scanning
        if (
            errorMessage.includes('No QR code found') ||
            errorMessage.includes('NotFound') ||
            errorMessage.includes('NotFoundException')
        ) {
            return;
        }

        // Ignore errors related to DOM manipulation during cleanup
        if (
            errorMessage.includes('Cannot set properties of null') ||
            errorMessage.includes('innerText') ||
            errorMessage.includes('innerHTML')
        ) {
            return;
        }

        // Handle permission errors
        if (
            errorMessage.includes('NotAllowedError') ||
            errorMessage.includes('Permission')
        ) {
            if (isMountedRef.current) {
                setHasPermission(false);
                setError('Camera access denied. Please allow camera access and try again.');
            }
            return;
        }

        // Handle device not found
        if (errorMessage.includes('NotFoundError')) {
            if (isMountedRef.current) {
                setError('No camera found on this device.');
            }
            return;
        }

        // Only log warnings if component is still mounted
        if (isMountedRef.current && process.env.NODE_ENV === 'development') {
            console.warn('QR Scanner warning:', errorMessage);
        }
    }, []);

    const initializeScanner = useCallback(() => {
        if (scannerRef.current || !containerRef.current || !isMountedRef.current) return;

        if (isMountedRef.current) {
            setIsInitializing(true);
            setError(null);
        }

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

            if (isMountedRef.current) {
                setHasPermission(true);
                setIsInitializing(false);
            }
        } catch (err) {
            if (isMountedRef.current) {
                console.error('Failed to initialize scanner:', err);
                setError('Failed to initialize camera. Please refresh and try again.');
                setIsInitializing(false);
            }
        }
    }, [handleScanSuccess, handleScanError]);

    useEffect(() => {
        isMountedRef.current = true;
        isCleaningUpRef.current = false;

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            if (isMountedRef.current) {
                initializeScanner();
            }
        }, 100);

        return () => {
            isMountedRef.current = false;
            clearTimeout(timer);

            // Perform cleanup - this will stop the camera and notify parent
            stopAllVideoTracks();
            if (scannerRef.current) {
                safeCleanup().catch(() => {
                    // Ignore cleanup errors during unmount
                });
            }
        };
    }, [initializeScanner, safeCleanup, stopAllVideoTracks]);

    const handleRetry = () => {
        if (scannerRef.current) {
            safeCleanup().catch(() => {
                // Ignore cleanup errors
            });
        }
        if (isMountedRef.current) {
            setError(null);
            setHasPermission(null);
            setTimeout(() => {
                if (isMountedRef.current) {
                    initializeScanner();
                }
            }, 100);
        }
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