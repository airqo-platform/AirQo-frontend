"use client"

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, ArrowLeft, ShieldAlert, Settings, Mail, UserPlus, Link as LinkIcon } from 'lucide-react'
import ReusableButton from "@/components/shared/button/ReusableButton"

type ErrorType = {
  title: string;
  message: string;
  icon: React.ReactNode;
  description: string;
}

const ERROR_MAP: Record<string, ErrorType> = {
  Configuration: {
    title: 'Configuration Error',
    message: 'There is a problem with the server configuration.',
    description: 'This is usually caused by a missing environment variable or a mismatch in the NEXTAUTH_URL. Please check the server logs.',
    icon: <Settings className="h-10 w-10 text-destructive" />,
  },
  AccessDenied: {
    title: 'Access Denied',
    message: 'You do not have permission to sign in.',
    description: 'Your account might not have the necessary privileges, or your sign-in was restricted by a security policy.',
    icon: <ShieldAlert className="h-10 w-10 text-destructive" />,
  },
  Verification: {
    title: 'Link Expired',
    message: 'The sign-in link is no longer valid.',
    description: 'The verification token has either expired or has already been used. Please try signing in again to receive a new link.',
    icon: <Mail className="h-10 w-10 text-destructive" />,
  },
  OAuthSignin: {
    title: 'Sign-in Failed',
    message: 'Could not start the external authentication process.',
    description: 'An error occurred while trying to connect to the authentication provider. This could be a temporary network issue.',
    icon: <AlertCircle className="h-10 w-10 text-destructive" />,
  },
  OAuthCallback: {
    title: 'Authentication Failed',
    message: 'Error during the external authentication callback.',
    description: 'The response from the authentication provider was invalid or could not be processed.',
    icon: <AlertCircle className="h-10 w-10 text-destructive" />,
  },
  OAuthCreateAccount: {
    title: 'Account Creation Failed',
    message: 'Could not create a new user account via OAuth.',
    description: 'There was an issue creating your account profile. This might be due to missing required information from the provider.',
    icon: <UserPlus className="h-10 w-10 text-destructive" />,
  },
  EmailCreateAccount: {
    title: 'Account Creation Failed',
    message: 'Could not create a new user account via email.',
    description: 'An error occurred while setting up your account. Please try again or contact support.',
    icon: <UserPlus className="h-10 w-10 text-destructive" />,
  },
  Callback: {
    title: 'Callback Error',
    message: 'An error occurred during the authentication callback.',
    description: 'The authentication process failed at the final validation step.',
    icon: <AlertCircle className="h-10 w-10 text-destructive" />,
  },
  OAuthAccountNotLinked: {
    title: 'Account Linked Elsewhere',
    message: 'This email is already associated with another provider.',
    description: 'To confirm your identity, please sign in using the provider you originally used for this email address.',
    icon: <LinkIcon className="h-10 w-10 text-destructive" />,
  },
  Default: {
    title: 'Authentication Error',
    message: 'An unexpected error occurred.',
    description: 'Something went wrong during the sign-in process. Please try again or contact our support team if the issue persists.',
    icon: <AlertCircle className="h-10 w-10 text-destructive" />,
  },
}

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const errorKey = searchParams.get('error') || 'Default'
  const error = ERROR_MAP[errorKey] || ERROR_MAP.Default

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="absolute top-8 left-8">
        <Image
          src="/images/airqo_logo.svg"
          alt="AirQo Logo"
          width={32}
          height={32}
          className="h-8 w-auto"
          priority
        />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-destructive/10 p-4 ring-8 ring-destructive/5 mb-2">
            {error.icon}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{error.title}</h1>
          <p className="text-lg font-medium text-foreground/80">{error.message}</p>
          <div className="rounded-xl border border-border bg-card/50 p-6 text-sm backdrop-blur-sm">
            <p className="text-muted-foreground leading-relaxed italic">
              {error.description}
            </p>
            {errorKey !== 'Default' && (
              <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Error Code: {errorKey}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <ReusableButton 
            className="w-full"
            variant="filled"
            Icon={ArrowLeft}
            onClick={() => router.push("/login")}
          >
            Back to Login
          </ReusableButton>
          <Link 
            href="mailto:support@airqo.net" 
            className="text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} AirQo. All rights reserved.
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
