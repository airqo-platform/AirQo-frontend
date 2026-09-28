"use client"

import Image from "next/image"
import { LoaderCircle, RefreshCw } from "lucide-react"

import { Button } from "@/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog"

type ErrorPopupProps = {
  isOpen: boolean
  message: string
  onClose: () => void
  onTryAgain?: () => void
  isRetrying?: boolean
  title?: string
}

export default function ErrorPopup({
  isOpen,
  message,
  onClose,
  onTryAgain,
  isRetrying = false,
  title = "Oops, try again",
}: ErrorPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-2xl">
        <div className="h-2 bg-red-600" />
        <div className="px-4 pb-5 pt-6 sm:px-5 sm:pb-6">
          <div className="relative aspect-[3/1] overflow-hidden rounded-xl bg-slate-900 shadow-inner">
            <Image
              src="/images/report-recovery-robot.png"
              alt="A recovery robot repairing a file service"
              fill
              priority
              sizes="(max-width: 640px) calc(100vw - 48px), 480px"
              className="object-cover"
            />
          </div>

          <DialogHeader className="mt-4 items-center text-center sm:text-center">
            <DialogTitle className="text-2xl font-bold tracking-tight text-slate-950">{title}</DialogTitle>
            <DialogDescription className="max-w-md text-base leading-6 text-slate-700">
              {message}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 flex-row justify-center gap-2 space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="min-w-28 rounded-xl border-slate-900 bg-white text-slate-900 hover:bg-slate-100"
            >
              Close
            </Button>
            {onTryAgain && (
              <Button
                type="button"
                onClick={onTryAgain}
                disabled={isRetrying}
                className="min-w-32 rounded-xl bg-red-600 text-white shadow-sm hover:bg-red-700"
              >
                {isRetrying ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                {isRetrying ? "Trying again..." : "Try again"}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
