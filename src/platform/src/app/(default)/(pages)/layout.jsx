'use client';
import { ThemeCustomizer } from '@/features/theme-customizer/components/ThemeCustomizer';

export default function Layout({ children }) {
  return (
    <div>
      {children}
      <ThemeCustomizer />
    </div>
  );
}
