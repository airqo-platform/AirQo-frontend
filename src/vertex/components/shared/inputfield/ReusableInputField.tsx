"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { AqCopy01, AqEye, AqEyeOff } from "@airqo/icons-react"
import ReusableToast from "../toast/ReusableToast"

interface CommonProps {
  label?: string
  error?: string
  containerClassName?: string
  primaryColor?: string
  description?: string
  className?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  showCopyButton?: boolean
}

type InputProps = CommonProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
    as?: "input"
  }

type TextareaProps = CommonProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea"
  }

type ReusableInputFieldProps = InputProps | TextareaProps

const ReusableInputField: React.FC<ReusableInputFieldProps> = ({
  label,
  error,
  containerClassName = "",
  primaryColor = "",
  className = "",
  required = false,
  disabled = false,
  description,
  readOnly,
  showCopyButton,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const Component = props.as === "textarea" ? "textarea" : "input"
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as: _, ...inputProps } = props

  const handleCopy = async () => {
    const valueToCopy = (inputProps as { value?: string | number }).value
    if (valueToCopy !== undefined && valueToCopy !== null) {
      try {
        await navigator.clipboard?.writeText(String(valueToCopy))
        ReusableToast({ message: "Copied", type: "SUCCESS" })
      } catch (err) {
        ReusableToast({ message: "Failed to copy", type: "ERROR" })
      }
    }
  }

  const commonClasses =
    "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 border-gray-300 transition-colors duration-150 ease-in-out dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:border-gray-700 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"

  const isPasswordInput = props.as !== "textarea" && (inputProps as React.InputHTMLAttributes<HTMLInputElement>).type === "password"
  const canShowCopyButton = showCopyButton && readOnly

  return (
    <div className={`flex flex-col ${containerClassName}`}>
      {label && (
        <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
          {label}
          {required && !readOnly && (
            <span style={{ color: primaryColor || "hsl(var(--primary))" }} className="ml-1">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative w-full">
        <Component
          className={cn(commonClasses, (canShowCopyButton || isPasswordInput) && "pr-10", className)}
          style={
            primaryColor
              ? {
                borderColor: error ? "red" : primaryColor,
                boxShadow: error ? "0 0 0 1px red" : `0 0 0 1px ${primaryColor}50`,
              }
              : error
                ? { borderColor: "red", boxShadow: "0 0 0 1px red" }
                : undefined
          }
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          {...(inputProps as React.InputHTMLAttributes<HTMLInputElement> &
            React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          type={isPasswordInput ? (showPassword ? "text" : "password") : (inputProps as React.InputHTMLAttributes<HTMLInputElement>).type}
        />
        {canShowCopyButton && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary focus:outline-none"
            aria-label="Copy to clipboard"
          >
            <AqCopy01 className="h-4 w-4" />
          </button>
        )}
        {isPasswordInput && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 top-2 right-0 flex items-center pr-3 text-gray-500 hover:text-primary focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <AqEyeOff className="h-4 w-4" />
            ) : (
              <AqEye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && !readOnly && (
        <div className="mt-1.5 flex items-center text-xs text-red-600 dark:text-red-400">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}
      {!error && description && <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{description}</div>}
    </div>
  )
}

export default ReusableInputField
