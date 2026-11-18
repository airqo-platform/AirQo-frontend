import type { Metadata } from 'next'
import Link from 'next/link'
import { AqAlertCircle, AqArrowLeft, AqLock01, AqMail01, AqSettings01, AqShieldOff } from '@airqo/icons-react'
import { brandTitle } from '@/beacon.config'
import AuthLayout from '@/components/auth/auth-layout'
import { Button } from '@/components/ui/button'
import { getAuthError, type AuthErrorCode } from '@/lib/auth-errors'

export const metadata: Metadata = {
  title: `Sign-in problem | ${brandTitle}`,
}

const ICONS: Partial<Record<AuthErrorCode, typeof AqAlertCircle>> = {
  Configuration: AqSettings01,
  AccessDenied: AqShieldOff,
  Verification: AqMail01,
  CredentialsSignin: AqLock01,
}

/** next-auth sends sign-in failures here (`pages.error` in lib/auth.ts) with the reason in `?error=`. */
export default function AuthErrorPage({ searchParams }: { searchParams: { error?: string | string[] } }) {
  const error = getAuthError(searchParams?.error)
  const Icon = ICONS[error.code] ?? AqAlertCircle

  return (
    <AuthLayout heading={error.title} subtitle={error.message}>
      <div className="space-y-6">
        <div role="alert" className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-foreground">{error.hint}</p>
            {error.code !== 'Default' && (
              <p className="text-xs text-muted-foreground">
                Error code: <span className="font-mono">{error.code}</span>
              </p>
            )}
          </div>
        </div>

        <Button asChild className="h-11 w-full">
          <Link href="/login">
            <AqArrowLeft aria-hidden="true" />
            Back to sign in
          </Link>
        </Button>
      </div>
    </AuthLayout>
  )
}
