// Sign-in providers. The template ships the demo sign-in only (`auth.provider: "none"`). To add a
// real provider, return it from authProviders() and set NEXTAUTH_SECRET and NEXTAUTH_URL.

import { beaconConfig } from '@/beacon.config';
import { demoCredentialsProvider, trustRequestHostWithoutNextAuthUrl } from '@/lib/demo-auth';

/** Runs once when the NextAuth options load. */
export function prepareAuthEnvironment() {
  trustRequestHostWithoutNextAuthUrl();
}

export function authProviders() {
  if (beaconConfig.auth.provider !== 'none') {
    throw new Error(`Auth provider "${beaconConfig.auth.provider}" isn't included in the template. Use "none".`);
  }
  return [demoCredentialsProvider()];
}
