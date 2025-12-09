"use client"

import { useEffect } from 'react'

// Shared constants with DynamicImportWrapper for consistent behavior
const RETRY_COUNT_KEY = 'chunk_load_retry_count'
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

function getRetryCount(): number {
  if (globalThis.window === undefined) return 0
  try {
    const stored = sessionStorage.getItem(RETRY_COUNT_KEY)
    return stored ? Number.parseInt(stored, 10) : 0
  } catch {
    return 0
  }
}

function setRetryCount(count: number): void {
  if (globalThis.window === undefined) return
  try {
    sessionStorage.setItem(RETRY_COUNT_KEY, count.toString())
  } catch (error) {
    console.error('Failed to persist retry count:', error)
  }
}

function clearRetryCount(): void {
  if (globalThis.window === undefined) return
  try {
    sessionStorage.removeItem(RETRY_COUNT_KEY)
  } catch (error) {
    console.error('Failed to clear retry count:', error)
  }
}

function attemptReloadWithBackoff(): boolean {
  if (globalThis.window === undefined) return false

  const currentRetryCount = getRetryCount()
  
  if (currentRetryCount >= MAX_RETRIES) {
    console.error(`Max retries (${MAX_RETRIES}) reached. Stopping reload attempts.`)
    // Don't clear the counter here - let the error UI show
    return false
  }
  
  const newRetryCount = currentRetryCount + 1
  setRetryCount(newRetryCount)
  
  // Exponential backoff: 1s, 2s, 4s
  const delay = BASE_DELAY_MS * Math.pow(2, currentRetryCount)
  
  console.log(`Chunk loading error detected. Attempting reload ${newRetryCount}/${MAX_RETRIES} in ${delay}ms...`)
  
  setTimeout(() => {
    globalThis.location.reload()
  }, delay)
  
  return true
}

export default function ChunkErrorHandler() {
  useEffect(() => {
    // Clear retry count on successful mount (page loaded successfully)
    clearRetryCount()
    
    // Add global error handler for chunk loading errors
    const originalError = globalThis.onerror
    
    globalThis.onerror = function (message, source, lineno, colno, error) {
      // Check if it's a chunk loading error
      if (
        error?.name === 'ChunkLoadError' || 
        (typeof message === 'string' && message.includes('Loading chunk')) ||
        (typeof message === 'string' && message.includes('ChunkLoadError'))
      ) {
        if (attemptReloadWithBackoff()) {
          return true // Prevent default error handling
        }
        // Max retries reached - let error propagate to error boundary
        return false
      }
      
      // Call original error handler for other errors
      if (originalError) {
        return originalError.call(this, message, source, lineno, colno, error)
      }
      
      return false
    }

    // Handle unhandled promise rejections that might be chunk errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.name === 'ChunkLoadError' ||
        (typeof event.reason === 'string' && event.reason.includes('Loading chunk'))
      ) {
        if (attemptReloadWithBackoff()) {
          event.preventDefault()
        }
        // If max retries reached, don't prevent default - let error propagate
      }
    }

    globalThis.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup
    return () => {
      globalThis.onerror = originalError
      globalThis.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null // This component doesn't render anything
}