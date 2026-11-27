import { beaconConfig } from "@/beacon.config"

const APP = beaconConfig.app.name
const ORG = beaconConfig.org.shortName

// What the /auth-error page says for each `?error=` code next-auth sends there.
// Beacon's credentials provider can also put its own thrown message in `?error=`; anything that isn't a
// known code gets the general copy, and only known codes are echoed back, so a crafted link can't put
// its own text on the page.

export type AuthErrorCode =
  | 'Configuration'
  | 'AccessDenied'
  | 'Verification'
  | 'OAuthSignin'
  | 'OAuthCallback'
  | 'CredentialsSignin'
  | 'Default'

export interface AuthErrorCopy {
  title: string
  message: string
  hint: string
}

export const AUTH_ERRORS: Record<AuthErrorCode, AuthErrorCopy> = {
  Configuration: {
    title: 'Sign-in is unavailable right now',
    message: `${APP}'s sign-in service isn't set up correctly, so nobody can sign in at the moment.`,
    hint: `This isn't something you did. Try again in a few minutes, and if it keeps happening, let the ${ORG} team know.`,
  },
  AccessDenied: {
    title: `You don't have access to ${APP}`,
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
    message: `${APP} couldn't reach the service you chose to sign in with.`,
    hint: 'Check your connection and try again, or sign in with your email and password.',
  },
  OAuthCallback: {
    title: "Sign-in didn't finish",
    message: `The service you signed in with sent back a response ${APP} couldn't use.`,
    hint: 'Try again. If it keeps failing, sign in with your email and password instead.',
  },
  CredentialsSignin: {
    title: 'Wrong email or password',
    message: `The email or password you entered doesn't match any ${ORG} account.`,
    hint: 'Check them and try again. Passwords are case-sensitive.',
  },
  Default: {
    title: 'Something went wrong signing you in',
    message: `${APP} couldn't sign you in.`,
    hint: `Try again. If it keeps happening, let the ${ORG} team know.`,
  },
}

const isAuthErrorCode = (value: string): value is AuthErrorCode =>
  Object.prototype.hasOwnProperty.call(AUTH_ERRORS, value)

/** The code to show and its copy for a raw `?error=` value (Next.js gives an array when the param repeats). */
export function getAuthError(param: string | string[] | null | undefined): { code: AuthErrorCode } & AuthErrorCopy {
  const raw = (Array.isArray(param) ? param[0] : param)?.trim() ?? ''
  const code = isAuthErrorCode(raw) ? raw : 'Default'
  return { code, ...AUTH_ERRORS[code] }
}
