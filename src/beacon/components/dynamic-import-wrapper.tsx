"use client"

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  retryCount: number
}

class DynamicImportWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, retryCount: 0 }
  }

  componentDidCatch(error: Error) {
    console.error('Dynamic import failed:', error)
    
    // Auto-retry logic for chunk loading errors
    if (error.name === 'ChunkLoadError' && this.state.retryCount < 3) {
      setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          retryCount: prevState.retryCount + 1
        }))
        window.location.reload()
      }, 1000)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="mb-4">
                <svg 
                  className="h-8 w-8 text-gray-400 mx-auto" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Failed to load component
                {this.state.retryCount > 0 && ` (Retry ${this.state.retryCount}/3)`}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default DynamicImportWrapper