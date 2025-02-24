import type React from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DialogWrapperProps {
  children: React.ReactNode
  ModalIcon?: React.ComponentType<{ className?: string }>
  handleClick: () => void
  open: boolean
  onClose: () => void
  primaryButtonText?: string
  loading?: boolean
  title?: string
}

export const DialogWrapper: React.FC<DialogWrapperProps> = ({
  children,
  ModalIcon,
  handleClick,
  open,
  onClose,
  primaryButtonText = "Submit",
  loading = false,
  title,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          {ModalIcon && (
            <div className="flex justify-center items-center mb-4">
              <div className="p-5 bg-indigo-50 rounded-full border-indigo-50">
                <ModalIcon className="w-6 h-6" />
              </div>
            </div>
          )}
          {title && <DialogTitle>{title}</DialogTitle>}
        </DialogHeader>
        <div className="py-4">{children}</div>
        <DialogFooter className="sm:justify-start">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleClick} disabled={loading}>
            {loading ? "Loading..." : primaryButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DialogWrapper

