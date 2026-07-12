'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const QR_IMAGE_SRC = '/clean-air-forum-2026/cleanair2.jpeg';

export default function QrCodeButton({ src = QR_IMAGE_SRC }: { src?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute bottom-4 right-3 z-20 hidden cursor-pointer sm:bottom-8 sm:right-6 sm:block lg:bottom-10 lg:right-8"
        aria-label="Open QR code in full view"
      >
        <div className="flex flex-col items-center gap-1">
          <div className="overflow-hidden rounded-lg border-2 border-white/30 bg-white/10 p-1 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 sm:border-white/40 sm:p-1.5 lg:p-2">
            <Image
              src={src}
              alt="Clean Air Forum QR Code"
              width={60}
              height={60}
              className="h-[50px] w-[50px] object-contain sm:h-[65px] sm:w-[65px] lg:h-[80px] lg:w-[80px]"
            />
          </div>
          <span className="text-[8px] font-medium text-white/80 sm:text-[10px] lg:text-xs">
            Scan to participate
          </span>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90vw] max-w-[400px] border-0 bg-transparent p-0 sm:max-w-[450px]">
          <DialogTitle className="sr-only">QR Code</DialogTitle>
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-xl bg-white p-3 shadow-2xl sm:p-4">
              <Image
                src={src}
                alt="Clean Air Forum QR Code - Scan to participate"
                width={300}
                height={300}
                className="h-auto w-full max-w-[280px] object-contain sm:max-w-[320px]"
              />
            </div>
            <p className="text-center text-sm font-medium text-white drop-shadow-lg sm:text-base">
              Scan to participate
            </p>
            <p className="text-center text-xs text-white/80 drop-shadow-md">
              Africa Clean Air Forum • Pretoria 2026
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
