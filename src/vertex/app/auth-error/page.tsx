"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <p className="font-semibold">Error Code: {error || 'Unknown'}</p>
          <p className="mt-2 text-muted-foreground italic">
            {error === 'Configuration' 
              ? 'This is usually caused by a NEXTAUTH_URL mismatch or a missing NEXTAUTH_SECRET. Check your server logs and environment variables.' 
              : 'An unexpected error occurred during authentication.'}
          </p>
        </div>
        <div className="pt-4">
          <Link 
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <AuthErrorContent />
    </Suspense>
  )
}
