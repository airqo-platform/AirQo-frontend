import Link from 'next/link'
import {
  AqAlertCircle,
  AqArrowLeft,
  AqLink01,
  AqLock01,
  AqMail01,
  AqSettings01,
  AqShieldOff,
  AqUserPlus01,
} from '@airqo/icons-react'
import AuthLayout from '../auth/auth-layout'
import { Button } from '../ui/button'
import { getAuthError, type AuthErrorCode } from './auth-errors'

/*
 * The page next-auth sends sign-in failures to (`pages.error`), reason in `?error=`.
 * Copied from beacon/app/auth-error/page.tsx on branch claude/loving-wilbur-92b830
 * (not merged yet): the shared sign-in card (../auth/auth-layout) with a red reason
 * box and "Back to sign in".
 *
 * Vertex's app/auth-error/page.tsx is a different design: no card, logo top left,
 * big round icon, italic description box, "Back to Login", "Contact Support" and a
 * copyright line. Nexus has no error page.
 *
 * Changes from Beacon's file:
 * - It was the route itself. It is now a component: the app's page passes
 *   `searchParams.error` as `error`, plus `appName` and `signInHref` (Beacon "/login",
 *   Nexus "/user/login").
 * - Icons for the four codes taken from Vertex (UserPlus and Link, as in Vertex).
 * - Vertex's "Contact Support" link is kept as the optional `supportEmail`.
 */
const ICONS: Partial<Record<AuthErrorCode, typeof AqAlertCircle>> = {
  Configuration: AqSettings01,
  AccessDenied: AqShieldOff,
  Verification: AqMail01,
  CredentialsSignin: AqLock01,
  OAuthCreateAccount: AqUserPlus01,
  EmailCreateAccount: AqUserPlus01,
  OAuthAccountNotLinked: AqLink01,
}

interface AuthErrorPageProps {
  /** The raw `?error=` value from the page's searchParams. */
  error?: string | string[] | null
  /** Product name used in the messages, e.g. "Beacon". */
  appName: string
  signInHref: string
  /** Shows a "Contact Support" mail link under the button (Vertex has one). */
  supportEmail?: string
}

export default function AuthErrorPage({ error: errorParam, appName, signInHref, supportEmail }: AuthErrorPageProps) {
  const error = getAuthError(errorParam, appName)
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
          <Link href={signInHref}>
            <AqArrowLeft aria-hidden="true" />
            Back to sign in
          </Link>
        </Button>

        {supportEmail && (
          <Link
            href={`mailto:${supportEmail}`}
            className="block text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Contact Support
          </Link>
        )}
      </div>
    </AuthLayout>
  )
}
