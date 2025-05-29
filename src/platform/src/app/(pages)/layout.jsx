'use client';
import { ThemeProvider } from '@/features/theme-customizer/context/ThemeContext';
import { ThemeCustomizer } from '@/features/theme-customizer/components/ThemeCustomizer';

export default function Layout({ children }) {
  return (
    <div>
      <ThemeProvider>
        {children}
        <ThemeCustomizer />
      </ThemeProvider>
    </div>
  );
}
