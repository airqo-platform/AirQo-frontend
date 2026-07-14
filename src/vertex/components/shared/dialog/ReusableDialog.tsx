"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import ReusableButton from "@/components/shared/button/ReusableButton"
import { X } from "lucide-react"
import { AqHelpCircle } from "@airqo/icons-react"
import { cn } from "@/lib/utils"
import { BannerSlot, useBanner } from "@/context/banner-context"
import { openFeedbackDialog } from "@/components/features/feedback/feedback-dialog"

// Stack of currently open dialogs so stacked dialogs (e.g. feedback opened on
// top of another dialog) don't fight over the Escape key and body scroll lock:
// only the topmost dialog closes on Escape, and scroll is restored only when
// the last dialog closes.
const openDialogStack: symbol[] = []

interface ReusableDialogProps {
  // Core props
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode

  // Header props
  title?: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  iconColor?: string
  iconBgColor?: string
  showCloseButton?: boolean
  /** Question-mark button in the default header that opens the feedback dialog. */
  showFeedbackButton?: boolean
  customHeader?: React.ReactNode

  // Content props
  maxHeight?: string
  contentClassName?: string

  // Footer props
  showFooter?: boolean
  primaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
    className?: string
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    className?: string
  }
  customFooter?: React.ReactNode

  // Modal props
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"
  preventBackdropClose?: boolean
  className?: string
  contentAreaClassName?: string
  zIndex?: number

  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
}

const ReusableDialog: React.FC<ReusableDialogProps> = ({
  // Core props
  isOpen,
  onClose,
  children,

  // Header props
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  showCloseButton = true,
  showFeedbackButton = true,
  customHeader,

  // Content props
  maxHeight = "max-h-96",
  contentClassName = "",

  // Footer props
  showFooter = true,
  primaryAction,
  secondaryAction,
  customFooter,

  // Modal props
  size = "lg",
  preventBackdropClose = false,
  className = "",
  contentAreaClassName = "",
  zIndex = 999,

  // Accessibility
  ariaLabel,
  ariaDescribedBy,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)
  const dialogId = useRef<symbol>(Symbol("reusable-dialog"))
  const { hideBanner } = useBanner()



  // Focus management
  useEffect(() => {
    if (!isOpen) {
      ;(previousActiveElement.current as HTMLElement)?.focus()
      return
    }

    previousActiveElement.current = document.activeElement
    const timer = setTimeout(() => {
      const focusSelector =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      const all = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusSelector) ?? []
      )
      const target =
        all.find(
          (el) =>
            el.getAttribute('aria-label') !== 'Close dialog' &&
            !el.hasAttribute('data-dialog-chrome')
        ) ??
        all[0] ??
        dialogRef.current
      target?.focus()
    }, 100)

    return () => clearTimeout(timer)
  }, [isOpen])

  const wasOpenRef = useRef(isOpen)

  // Clear any active banner when the dialog transitions from open to closed to prevent state leakage
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      hideBanner()
    }
    wasOpenRef.current = isOpen
  }, [isOpen, hideBanner])

  // Latest callbacks/flags for the Escape handler, so the stack-registration
  // effect below can depend on isOpen only. If it also depended on onClose /
  // preventBackdropClose, a rerender of a lower dialog (new callback
  // identity) would remove and re-push its id, moving it to the top of
  // openDialogStack — and Escape would close the wrong dialog.
  const onCloseRef = useRef(onClose)
  const preventBackdropCloseRef = useRef(preventBackdropClose)
  useEffect(() => {
    onCloseRef.current = onClose
    preventBackdropCloseRef.current = preventBackdropClose
  }, [onClose, preventBackdropClose])

  // Escape key handler and body scroll lock — topmost dialog wins
  useEffect(() => {
    if (!isOpen) return

    const id = dialogId.current
    openDialogStack.push(id)
    document.body.style.overflow = "hidden"

    const handleEscape = (e: KeyboardEvent) => {
      const isTopmost = openDialogStack[openDialogStack.length - 1] === id
      // A Radix Popover (combobox/multi-select dropdown, etc.) rendered on
      // top of this dialog has its own Escape handling and isn't tracked in
      // openDialogStack. Without this check, dismissing just the dropdown
      // would also bubble up and close (and reset) this whole dialog.
      const hasOpenPopover = document.querySelector('[data-radix-popper-content-wrapper]')
      if (e.key === "Escape" && isTopmost && !preventBackdropCloseRef.current && !hasOpenPopover) {
        onCloseRef.current()
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
      const index = openDialogStack.indexOf(id)
      if (index !== -1) openDialogStack.splice(index, 1)
      if (openDialogStack.length === 0) {
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  // Size mapping for dialog widths
  const sizeMap = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  }

  const dialogWidth = sizeMap[size] || "max-w-lg"

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventBackdropClose) {
      onClose()
    }
  }

  // Create header content
  const createHeaderContent = () => {
    if (customHeader) {
      return customHeader
    }

    if (!title && !Icon && !showCloseButton && !showFeedbackButton) {
      return null
    }

    return (
      <div className="flex items-center justify-between w-full px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", iconBgColor)}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
          )}
          {(title || subtitle) && (
            <div>
              {title && <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>}
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {showFeedbackButton && (
            <ReusableButton
              variant="text"
              onClick={() => openFeedbackDialog(title || ariaLabel)}
              padding="p-0"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Report an issue or share feedback"
              aria-label="Report an issue or share feedback"
              data-dialog-chrome="true"
            >
              <AqHelpCircle className="w-4 h-4" />
            </ReusableButton>
          )}
          {showCloseButton && (
            <ReusableButton variant="text" onClick={onClose} padding="p-0" className="h-8 w-8" aria-label="Close dialog">
              <X className="w-4 h-4" />
            </ReusableButton>
          )}
        </div>
      </div>
    )
  }

  // Create footer content
  const createFooterContent = () => {
    if (customFooter) {
      return customFooter
    }

    if (!showFooter || (!primaryAction && !secondaryAction)) {
      return null
    }

    return (
      <div className="flex items-center justify-end gap-3 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        {secondaryAction && (() => {
          const shadcnVariant = secondaryAction.variant || "outline"
          let reusableVariant: "filled" | "outlined" | "text"
          switch (shadcnVariant) {
            case "outline":
            case "secondary":
              reusableVariant = "outlined"
              break
            case "ghost":
            case "link":
              reusableVariant = "text"
              break
            default:
              reusableVariant = "filled"
          }
          return (
            <ReusableButton
              onClick={secondaryAction.onClick}
              variant={reusableVariant}
              disabled={secondaryAction.disabled}
              className={secondaryAction.className}
            >
              {secondaryAction.label}
            </ReusableButton>
          )
        })()}
        {primaryAction && (
          <ReusableButton onClick={primaryAction.onClick} disabled={primaryAction.disabled} className={primaryAction.className} variant="filled">
            {primaryAction.label}
          </ReusableButton>
        )}
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={`fixed inset-0 z-[${zIndex}] bg-black/50 dark:bg-black/80`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            style={{ marginTop: "0px" }}
          />

          {/* Dialog Container */}
          <motion.div
            className={`fixed inset-0 z-[${zIndex}] flex items-center justify-center p-4 pointer-events-none`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Dialog */}
            <motion.div
              ref={dialogRef}
              className={cn(
                "relative w-full overflow-hidden flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-xl pointer-events-auto",
                dialogWidth,
                className,
              )}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel || title}
              aria-describedby={ariaDescribedBy}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {createHeaderContent()}

              {/* Banner Slot */}
              <BannerSlot />

              {/* Content */}
              <div className={cn("flex-1", maxHeight, "overflow-y-auto", contentClassName)}>
                <div className={contentAreaClassName || "px-6 py-4"}>{children}</div>
              </div>

              {/* Footer */}
              {createFooterContent()}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ReusableDialog
