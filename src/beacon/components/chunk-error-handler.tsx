"use client"

import { useEffect } from 'react'

export default function ChunkErrorHandler() {
  useEffect(() => {
    // Add global error handler for chunk loading errors
    const originalError = window.onerror
    
    window.onerror = function (message, source, lineno, colno, error) {
      // Check if it's a chunk loading error
      if (
        error?.name === 'ChunkLoadError' || 
        (typeof message === 'string' && message.includes('Loading chunk')) ||
        (typeof message === 'string' && message.includes('ChunkLoadError'))
      ) {
        console.warn('Chunk loading error detected, attempting reload...')
        
        // Add a small delay to prevent rapid reloading
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        
        return true // Prevent default error handling
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
        console.warn('Chunk loading promise rejection detected, attempting reload...')
        event.preventDefault()
        
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup
    return () => {
      window.onerror = originalError
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null // This component doesn't render anything
}