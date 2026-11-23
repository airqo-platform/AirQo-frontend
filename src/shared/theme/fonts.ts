import { Inter } from 'next/font/google';

/*
 * The dashboards' typeface. Copied from nexus/src/app/layout.tsx and
 * vertex/app/layout.tsx, which load it the same way. Put `inter.variable` (and
 * `font-sans`) on <html> or <body>; the Tailwind preset's `font-sans` and
 * base.css read --font-inter.
 *
 * Beacon loads Inter without `variable` (`Inter({ subsets: ['latin'] })`) and
 * uses `inter.className`, so --font-inter is never set there; its
 * `body { font-family: Arial }` rule is overridden by that class.
 */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
