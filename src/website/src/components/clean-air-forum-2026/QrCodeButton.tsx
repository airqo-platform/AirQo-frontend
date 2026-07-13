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
        className="absolute right-3 top-4 z-20 hidden cursor-pointer sm:right-6 sm:top-6 sm:block lg:right-8 lg:top-8"
        aria-label="Open QR code in full view"
      >
        <div className="flex flex-col items-center gap-1">
          <div className="overflow-hidden rounded-lg border border-white/25 bg-white/10 p-1 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 sm:border-white/30 sm:p-1.5">
            <Image
              src={src}
              alt="Clean Air Forum QR Code"
              width={60}
              height={60}
              className="h-[44px] w-[44px] object-contain sm:h-[52px] sm:w-[52px] lg:h-[60px] lg:w-[60px]"
            />
          </div>
          <span className="text-[7px] font-medium text-white/70 sm:text-[9px]">
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
