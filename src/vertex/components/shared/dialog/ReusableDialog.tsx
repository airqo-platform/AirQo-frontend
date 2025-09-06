"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import ReusableButton from "@/components/shared/button/ReusableButton"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

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

  // Accessibility
  ariaLabel,
  ariaDescribedBy,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
      // Use timeout to ensure dialog is rendered before focusing
      setTimeout(() => {
        dialogRef.current?.focus()
      }, 100)
    } else {
      ;(previousActiveElement.current as HTMLElement)?.focus()
    }
  }, [isOpen])

  // Escape key handler and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !preventBackdropClose) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose, preventBackdropClose])

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

    if (!title && !Icon && !showCloseButton) {
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
              {title && <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{title}</h2>}
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
          )}
        </div>
        {showCloseButton && (
          <ReusableButton variant="text" onClick={onClose} padding="p-0" className="h-8 w-8" aria-label="Close dialog">
            <X className="w-4 h-4" />
          </ReusableButton>
        )}
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
            className="fixed inset-0 z-[999] bg-black/50 dark:bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            style={{marginTop: "0px"}}
          />

          {/* Dialog Container */}
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none"
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
