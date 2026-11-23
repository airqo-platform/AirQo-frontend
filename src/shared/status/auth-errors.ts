/*
 * What the auth error page says for each `?error=` code next-auth sends there.
 * Copied from beacon/lib/auth-errors.ts on branch claude/loving-wilbur-92b830 (not
 * merged yet). Vertex's app/auth-error/page.tsx has its own ERROR_MAP; Nexus has no
 * error page (its next-auth `pages` has none).
 *
 * Changes from Beacon's file:
 * - "Beacon" in the copy is now the `appName` argument.
 * - Vertex's map also covers OAuthCreateAccount, EmailCreateAccount, Callback and
 *   OAuthAccountNotLinked. Those four are added with Vertex's wording (its
 *   `description` is the `hint` here), so Vertex loses nothing; the tone differs from
 *   Beacon's and should be rewritten to match.
 *
 * Anything that isn't a known code gets the general copy, and only known codes are
 * echoed back, so a crafted link can't put its own text on the page.
 */

export type AuthErrorCode =
  | 'Configuration'
  | 'AccessDenied'
  | 'Verification'
  | 'OAuthSignin'
  | 'OAuthCallback'
  | 'OAuthCreateAccount'
  | 'EmailCreateAccount'
  | 'Callback'
  | 'OAuthAccountNotLinked'
  | 'CredentialsSignin'
  | 'Default'

export interface AuthErrorCopy {
  title: string
  message: string
  hint: string
}

export function authErrorCopy(appName: string): Record<AuthErrorCode, AuthErrorCopy> {
  return {
    Configuration: {
      title: 'Sign-in is unavailable right now',
      message: `${appName}'s sign-in service isn't set up correctly, so nobody can sign in at the moment.`,
      hint: "This isn't something you did. Try again in a few minutes, and if it keeps happening, let the AirQo team know.",
    },
    AccessDenied: {
      title: `You don't have access to ${appName}`,
      message: "Your account was recognised, but it isn't allowed to sign in here.",
      hint: 'Check you used the right account, or ask an administrator in your organisation to give you access.',
    },
    Verification: {
      title: 'This sign-in link has expired',
      message: 'The link has already been used, or it is too old to use.',
      hint: 'Go back to sign in and start again to get a new link.',
    },
    OAuthSignin: {
      title: "Couldn't start sign-in",
      message: `${appName} couldn't reach the service you chose to sign in with.`,
      hint: 'Check your connection and try again, or sign in with your email and password.',
    },
    OAuthCallback: {
      title: "Sign-in didn't finish",
      message: `The service you signed in with sent back a response ${appName} couldn't use.`,
      hint: 'Try again. If it keeps failing, sign in with your email and password instead.',
    },
    // From Vertex's ERROR_MAP
    OAuthCreateAccount: {
      title: 'Account Creation Failed',
      message: 'Could not create a new user account via OAuth.',
      hint: 'There was an issue creating your account profile. This might be due to missing required information from the provider.',
    },
    // From Vertex's ERROR_MAP
    EmailCreateAccount: {
      title: 'Account Creation Failed',
      message: 'Could not create a new user account via email.',
      hint: 'An error occurred while setting up your account. Please try again or contact support.',
    },
    // From Vertex's ERROR_MAP
    Callback: {
      title: 'Callback Error',
      message: 'An error occurred during the authentication callback.',
      hint: 'The authentication process failed at the final validation step.',
    },
    // From Vertex's ERROR_MAP
    OAuthAccountNotLinked: {
      title: 'Account Linked Elsewhere',
      message: 'This email is already associated with another provider.',
      hint: 'To confirm your identity, please sign in using the provider you originally used for this email address.',
    },
    CredentialsSignin: {
      title: 'Wrong email or password',
      message: "The email or password you entered doesn't match an AirQo account.",
      hint: 'Check them and try again. Passwords are case-sensitive.',
    },
    Default: {
      title: 'Something went wrong signing you in',
      message: `${appName} couldn't sign you in.`,
      hint: 'Try again. If it keeps happening, let the AirQo team know.',
    },
  }
}

/** The code to show and its copy for a raw `?error=` value (Next.js gives an array when the param repeats). */
export function getAuthError(
  param: string | string[] | null | undefined,
  appName: string
): { code: AuthErrorCode } & AuthErrorCopy {
  const copy = authErrorCopy(appName)
  const raw = (Array.isArray(param) ? param[0] : param)?.trim() ?? ''
  const code = Object.prototype.hasOwnProperty.call(copy, raw) ? (raw as AuthErrorCode) : 'Default'
  return { code, ...copy[code] }
}
