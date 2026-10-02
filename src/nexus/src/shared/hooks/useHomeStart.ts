'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Returns the `homeStart` query parameter that the home page's outcome cards
 * append when handing off to another workflow (e.g. `?homeStart=export-data`).
 *
 * Canonical way to read it — prefer this over
 * `new URLSearchParams(window.location.search)` so client components stay in
 * sync with the router's search params (including during hydration and client
 * navigations).
 */
export function useHomeStart(): string | null {
  return useSearchParams().get('homeStart');
}
