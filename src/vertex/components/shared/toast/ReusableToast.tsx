"use client"

import type React from "react"

import { toast } from "sonner"
import { X, Info } from "lucide-react"
import { AqCheck, AqAlertCircle } from '@airqo/icons-react'

// --- Define Constants for Classes ---
const BASE_CLASSES = "p-4 rounded-xl border-none flex items-center gap-3 w-full"
const SUCCESS_CLASSES = "bg-green-600 text-white"
const ERROR_CLASSES = "bg-red-600 text-white"
const WARNING_CLASSES = "bg-orange-600 text-white"
const INFO_CLASSES = "bg-blue-600 text-white"

// --- Define Toast Types ---
export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const

type ToastType = keyof typeof TOAST_TYPES

interface CustomToastOptions {
  message?: string
  type?: ToastType
  duration?: number
  style?: React.CSSProperties
  onDismiss?: () => void
}

/**
 * Shows a customized toast notification using sonner.
 */
const ReusableToast = ({
  message = "",
  type = "SUCCESS",
  duration = 5000,
  style: customStyle = {},
  onDismiss,
}: CustomToastOptions = {}) => {
  let icon: React.ReactNode
  let typeClasses = ""

  switch (type) {
    case "WARNING":
      icon = <AqAlertCircle size={20} className="text-white flex-shrink-0" />
      typeClasses = WARNING_CLASSES
      break
    case "ERROR":
      icon = <X size={20} className="text-white flex-shrink-0" />
      typeClasses = ERROR_CLASSES
      break
    case "INFO":
      icon = <Info size={20} className="text-white flex-shrink-0" />
      typeClasses = INFO_CLASSES
      break
    case "SUCCESS":
    default:
      icon = <AqCheck size={20} className="text-white flex-shrink-0" />
      typeClasses = SUCCESS_CLASSES
      break
  }

  const defaultStyle: React.CSSProperties = {
    minWidth: "250px",
    maxWidth: "90vw",
    width: "auto",
    zIndex: "12000",
    ...customStyle,
  }

  const ToastComponent = (
    <div className={`${BASE_CLASSES} ${typeClasses}`}>
      {icon}
      <span className="text-sm font-medium flex-grow">{message}</span>
    </div>
  );

  // --- Call sonner's toast function ---
  return toast(ToastComponent, {
    unstyled: true,
    duration,
    position: "bottom-center",
    style: defaultStyle,
    onDismiss,
  });
}

export default ReusableToast
