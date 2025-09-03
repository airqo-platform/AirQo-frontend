'use client';

import { withSessionAuth, PROTECTION_LEVELS } from '@/core/HOC';

export function Layout({ children }) {
  return <div>{children}</div>;
}

export default withSessionAuth(PROTECTION_LEVELS.PROTECTED)(Layout);
