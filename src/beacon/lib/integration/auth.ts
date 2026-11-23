// Sign-in providers for Beacon. The exported template replaces this file with one that only has
// the demo sign-in (template/overlay/lib/integration/auth.ts).

import { beaconConfig } from '@/beacon.config';
import { demoCredentialsProvider, trustRequestHostWithoutNextAuthUrl } from '@/lib/demo-auth';
import { normalizeNextAuthUrl, platformCredentialsProvider } from '@/lib/platform-auth';

/** Runs once when the NextAuth options load. */
export function prepareAuthEnvironment() {
  if (beaconConfig.auth.provider === 'platform') normalizeNextAuthUrl();
  else trustRequestHostWithoutNextAuthUrl();
}

export function authProviders() {
  return beaconConfig.auth.provider === 'platform'
    ? [platformCredentialsProvider()]
    : [demoCredentialsProvider()];
}
