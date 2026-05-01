/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync } = require('node:child_process');

const blankToUnset = key => {
  if (typeof process.env[key] === 'string' && process.env[key].trim() === '') {
    delete process.env[key];
  }
};

blankToUnset('NEXTAUTH_URL');
blankToUnset('NEXTAUTH_URL_INTERNAL');
blankToUnset('AUTH_URL');

const appName = process.env.CONTAINER_APP_NAME;
const dnsSuffix = process.env.CONTAINER_APP_ENV_DNS_SUFFIX;

if (!process.env.NEXTAUTH_URL && appName && dnsSuffix) {
  process.env.NEXTAUTH_URL = `https://${appName}.${dnsSuffix}`;
}

if (!process.env.NEXTAUTH_URL_INTERNAL && process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL_INTERNAL = process.env.NEXTAUTH_URL;
}

if (appName?.endsWith('-vertex-preview')) {
  process.env.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST || 'true';
}

console.log('[startup] NextAuth runtime env:', {
  hasNextAuthUrl: Boolean(process.env.NEXTAUTH_URL),
  hasNextAuthUrlInternal: Boolean(process.env.NEXTAUTH_URL_INTERNAL),
  hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET),
  authTrustHost: process.env.AUTH_TRUST_HOST,
});

const result = spawnSync(process.execPath, ['./node_modules/next/dist/bin/next', 'start'], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
