"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 10,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // Success callback
          onScan(decodedText);
          scanner.clear();
          setIsScanning(false);
        },
        (errorMessage) => {
          // Error callback - we'll ignore most errors as they're just scanning attempts
          if (errorMessage.includes("NotFound")) {
            // This is normal - just means no QR code found yet
            return;
          }
          setError(errorMessage);
        }
      );

      scannerRef.current = scanner;
      setIsScanning(true);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
    onClose();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Code Scanner
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div id="qr-reader" className="w-full"></div>
          
          {isScanning && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Point your camera at the QR code on your device
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { QRScanner }; 