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

const RETRY_COUNT_KEY = 'chunk_load_retry_count'
const MAX_RETRIES = 3

class DynamicImportWrapper extends Component<Props, State> {
  private reloadTimeout?: NodeJS.Timeout

  constructor(props: Props) {
    super(props)
    // Read persisted retry count on initialization
    const persistedRetryCount = this.getPersistedRetryCount()
    this.state = { hasError: false, retryCount: persistedRetryCount }
  }

  componentWillUnmount() {
    if (this.reloadTimeout) {
      clearTimeout(this.reloadTimeout)
    }
  }

  private getPersistedRetryCount(): number {
    if (globalThis.window === undefined) return 0
    try {
      const stored = sessionStorage.getItem(RETRY_COUNT_KEY)
      const parsed = stored ? Number.parseInt(stored, 10) : 0
      return Number.isNaN(parsed) ? 0 : parsed
    } catch {
      return 0
    }
  }

  private setPersistedRetryCount(count: number): void {
    if (globalThis.window === undefined) return
    try {
      sessionStorage.setItem(RETRY_COUNT_KEY, count.toString())
    } catch (error) {
      console.error('Failed to persist retry count:', error)
    }
  }

  private clearPersistedRetryCount(): void {
    if (globalThis.window === undefined) return
    try {
      sessionStorage.removeItem(RETRY_COUNT_KEY)
    } catch (error) {
      console.error('Failed to clear retry count:', error)
    }
  }

  static getDerivedStateFromError(): Partial<State> {
    // Don't reset retryCount here - preserve it
    return { hasError: true }
  }

  componentDidMount() {
    // Clear retry count on successful mount
    if (!this.state.hasError) {
      this.clearPersistedRetryCount()
    }
  }

  componentDidCatch(error: Error) {
    console.error('Dynamic import failed:', error)
    
    // Auto-retry logic for chunk loading errors
    if (error.name === 'ChunkLoadError') {
      const currentRetryCount = this.getPersistedRetryCount()
      
      if (currentRetryCount < MAX_RETRIES) {
        // Increment and persist the retry count
        const newRetryCount = currentRetryCount + 1
        this.setPersistedRetryCount(newRetryCount)
        
        // Update component state before reload
        this.setState({ retryCount: newRetryCount })
        
        // Trigger reload after a short delay
        this.reloadTimeout = setTimeout(() => {
          console.log(`Reloading page (attempt ${newRetryCount}/${MAX_RETRIES})`)
          globalThis.location.reload()
        }, 1000)
      } else {
        // Max retries reached - show error UI without reloading
        console.error(`Max retries (${MAX_RETRIES}) reached. Showing error UI.`)
        this.setState({ hasError: true, retryCount: currentRetryCount })
      }
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
                onClick={() => {
                  this.clearPersistedRetryCount()
                  globalThis.location.reload()
                }}
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