"use client"

import React from "react"
import { cn } from "@/lib/utils"
import PermissionTooltip from "@/components/ui/permission-tooltip"

interface ReusableButtonBaseProps {
  variant?: "filled" | "outlined" | "text" | "disabled"
  padding?: string
  paddingStyles?: string
  className?: string
  disabled?: boolean
  dataTestId?: string
  Icon?: React.ComponentType<{ className?: string }>
  children?: React.ReactNode
  showTextOnMobile?: boolean
  loading?: boolean
  permission?: string
}

type ButtonNativeProps = ReusableButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ReusableButtonBaseProps> & {
    path?: never
  }

type AnchorNativeProps = ReusableButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ReusableButtonBaseProps> & {
    path: string
  }

type ReusableButtonProps = ButtonNativeProps | AnchorNativeProps

const ReusableButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ReusableButtonProps>(
  (
    {
      variant = "filled",
      padding = "py-2 px-4",
      paddingStyles,
      className,
      disabled = false,
      Icon,
      children,
      showTextOnMobile = false,
      loading,
      dataTestId,
      permission,
      ...rest
    },
    ref,
  ) => {
    // Base styles
    const base = "flex items-center justify-center rounded-lg transition transform active:scale-95 duration-200"
    const variantMap = {
      filled: cn(
        "bg-primary",
        "hover:bg-primary/80",
        "text-white",
        "border border-transparent",
        "shadow-sm hover:shadow-lg",
        "focus:ring-2 focus:ring-primary focus:ring-opacity-50",
      ),
      outlined: cn(
        "bg-transparent",
        "border border-primary",
        "text-primary",
        "hover:bg-primary",
        "hover:text-white",
        "focus:ring-2 focus:ring-primary focus:ring-opacity-50",
      ),
      text: cn(
        "bg-transparent",
        "text-primary",
        "hover:bg-primary/10",
        "focus:ring-2 focus:ring-primary focus:ring-opacity-50",
      ),
      disabled: cn("bg-gray-300 dark:bg-gray-600", "text-gray-500 dark:text-gray-400", "border border-transparent"),
    }
    const activeVariant = disabled ? "disabled" : variant
    const variantStyles = variantMap[activeVariant] || variantMap.filled
    const disabledStyles = disabled && "cursor-not-allowed opacity-50"

    const finalPadding = paddingStyles || padding

    const loadingStyles = loading ? "bg-gray-400 !text-gray-900 !border-gray-400" : ""

    const btnClass = cn(base, finalPadding, variantStyles, disabledStyles, loadingStyles, className)

    const iconMargin = "mr-2"

    const ButtonContent = (
      <>
        {Icon && <Icon className={cn("w-4 h-4", iconMargin)} />}
        <span className={cn(Icon && !showTextOnMobile ? "hidden md:inline" : "")}>{children}</span>
      </>
    )

    if ("path" in rest) {
      const { path, ...anchorProps } = rest as AnchorNativeProps
      const anchorButton = (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={path}
          className={btnClass}
          data-testid={dataTestId}
          aria-disabled={disabled}
          {...anchorProps}
        >
          {ButtonContent}
        </a>
      )
      if (disabled && permission) {
        return <PermissionTooltip permission={permission}><span>{anchorButton}</span></PermissionTooltip>
      }
      return anchorButton
    }

    const { type = "button", ...buttonProps } = rest as ButtonNativeProps
    const button = (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={btnClass}
        data-testid={dataTestId}
        disabled={disabled || loading}
        aria-busy={!!loading}
        {...buttonProps}
      >
        {ButtonContent}
      </button>
    )

    if (disabled && permission) {
      return <PermissionTooltip permission={permission}><span>{button}</span></PermissionTooltip>
    }
    return button
  },
)

ReusableButton.displayName = "ReusableButton"

export default ReusableButton
