'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AuthLayout from '@/shared/layouts/AuthLayout';
import { LoadingSpinner, toast } from '@/shared/components/ui';
import { normalizeCallbackUrl } from '@/shared/lib/auth-redirect';

export default function GoogleOAuthCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const hasRedirectedRef = useRef(false);

  const callbackUrl =
    normalizeCallbackUrl(searchParams.get('callbackUrl')) || '/user/home';
  const error = searchParams.get('error') || searchParams.get('failed');

  useEffect(() => {
    if (hasRedirectedRef.current || status === 'loading') {
      return;
    }

    hasRedirectedRef.current = true;

    if (error || status === 'unauthenticated') {
      toast.error(
        'Google sign-in failed',
        'Please try again or use email and password.'
      );
      router.replace(
        `/user/login?error=google&callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
      return;
    }

    router.replace(callbackUrl);
  }, [callbackUrl, error, router, status]);

  return (
    <AuthLayout
      pageTitle="Completing Google sign-in"
      heading="Finishing sign-in"
      subtitle="Please wait while we verify your AirQo session."
    >
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <LoadingSpinner size={28} />
      </div>
    </AuthLayout>
  );
}
