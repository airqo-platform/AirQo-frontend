'use client';

import { usePathname } from 'next/navigation';
import { lazy, Suspense } from 'react';

import CookieConsent from '@/components/CookieConsent';
import ExternalLinkDecorator from '@/components/ExternalLinkDecorator';
import GoogleTranslate from '@/components/GoogleTranslate';
const EngagementDialog = lazy(
  () => import('@/components/dialogs/EngagementDialog'),
);
const FloatingMiniBillboardWrapper = lazy(
  () => import('@/components/FloatingMiniBillboardWrapper'),
);

const CHROMELESS_PREFIXES = ['/africa-clean-air-forum-2026'];

const shouldHideRouteChrome = (pathname: string | null) =>
  CHROMELESS_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

export default function GlobalRouteChrome() {
  const pathname = usePathname();

  if (shouldHideRouteChrome(pathname)) {
    return <ExternalLinkDecorator />;
  }

  return (
    <>
      <GoogleTranslate />
      <ExternalLinkDecorator />
      <Suspense fallback={null}>
        <EngagementDialog />
      </Suspense>
      <CookieConsent />
      <Suspense fallback={null}>
        <FloatingMiniBillboardWrapper />
      </Suspense>
    </>
  );
}
