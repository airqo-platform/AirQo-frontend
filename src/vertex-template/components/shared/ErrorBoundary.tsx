"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import ReusableDialog from "./dialog/ReusableDialog"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === "development"

      return (
        <ReusableDialog
          isOpen={true}
          onClose={this.handleReload}
          title="Something went wrong"
          subtitle="An unexpected error occurred. Please try reloading the page."
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          showCloseButton={false}
          preventBackdropClose={true}
          primaryAction={{
            label: "Reload Page",
            onClick: this.handleReload,
          }}
          size={isDevelopment && this.state.error ? "2xl" : "md"}
        >
          {isDevelopment && this.state.error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-gray-800 rounded-md text-left">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                Developer Information (This is only visible in development mode)
              </h3>
              <pre className="mt-2 text-xs text-red-700 dark:text-red-200 whitespace-pre-wrap break-words">
                {this.state.error.toString()}
                {"\n\n"}
                {this.state.error.stack}
              </pre>
            </div>
          )}
        </ReusableDialog>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary