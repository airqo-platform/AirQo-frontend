'use client';

import { withSessionAuth, PROTECTION_LEVELS } from '@/core/HOC';
import { ThemeCustomizer } from '@/common/features/theme-customizer/components/ThemeCustomizer';

export function Layout({ children }) {
  return (
    <div>
      {children}
      <ThemeCustomizer />
    </div>
  );
}

export default withSessionAuth(PROTECTION_LEVELS.PROTECTED)(Layout);
