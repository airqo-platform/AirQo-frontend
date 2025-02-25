import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
  } from "@/components/ui/dialog";
import React from "react";
  import { useZxing } from "react-zxing";
import { Button } from "../ui/button";
import { X } from "lucide-react";

// QR Code Scanner Component
interface QRScannerProps {
    onResult: (result: string) => void;
    isOpen: boolean;
    onClose: () => void;
  }
  
  const QRScanner = ({ onResult, isOpen, onClose }: QRScannerProps) => {
    const [error, setError] = React.useState<string>("");
    
    const { ref } = useZxing({
      onDecodeResult(result) {
        onResult(result.getText());
        onClose();
      },
      onError(error) {
        console.error("Scanner error:", error);
        setError("Failed to access camera. Please check permissions.");
      },
    });
  
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Point your camera at a QR code to scan device information
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center text-destructive text-center p-4">
                {error}
              </div>
            ) : (
              <video
                ref={ref as React.RefObject<HTMLVideoElement>}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex justify-between">
            <DialogClose asChild>
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </DialogClose>
            {error && (
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  export default QRScanner;