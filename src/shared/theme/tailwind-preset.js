/*
 * Tailwind preset for the AirQo dashboards. It maps the variables in
 * tokens.css to Tailwind colour, radius and font names, so every app reads the
 * same tokens:
 *
 *   // tailwind.config.(js|ts) in an app
 *   presets: [require('../shared/theme/tailwind-preset')],
 *   content: [...the app's globs, '../shared/**\/*.{ts,tsx}'],
 *
 * The app must list `../shared` in its own `content`: Tailwind does not merge
 * `content` from a preset.
 *
 * Gathered from beacon/tailwind.config.js, vertex/tailwind.config.ts and
 * nexus/tailwind.config.ts. Their colour maps are the same; the differences were:
 * - text/heading: Beacon maps both to --foreground; Nexus and Vertex to --text
 *   and --heading (used here; tokens.css defines both).
 * - primary 50–900 scale: Beacon and Vertex map it, Nexus doesn't.
 * - fontFamily sans: Nexus and Vertex use var(--font-inter). Beacon loads Inter
 *   by class name instead and has `body { font-family: Arial }` in its CSS.
 * - Nexus and Vertex re-declare fontWeight with Tailwind's default values;
 *   dropped here as it changes nothing.
 * - Plugins: Beacon enables tailwindcss-animate (the shadcn open/close
 *   animations depend on it) and typography. Vertex installs tailwindcss-animate
 *   but never enables it, so its shadcn animations are inert today. Nexus has
 *   typography only.
 * - Keyframes: accordion (Beacon), shimmer (Vertex).
 * - container (Beacon only) and Beacon's safelist are app-specific; not here.
 *
 * Added, not copied: the sidebar colour names (Beacon defines the variables but
 * never mapped them) and named z-index layers taken from the values the shared
 * components already use (see README "Stacking order").
 */

// Resolve plugins from the app that loads this preset, not from src/shared,
// which has no node_modules of its own.
const fromApp = (name) => require(require.resolve(name, { paths: [process.cwd()] }));

// Nexus doesn't install tailwindcss-animate; skip a missing plugin with a warning
// rather than failing the build. Without it the shadcn open/close animations
// (animate-in, fade-in-0, …) do nothing.
const optionalPlugin = (name) => {
  try {
    return fromApp(name);
  } catch {
    console.warn(`[airqo tailwind preset] ${name} is not installed in this app; skipping it.`);
    return null;
  }
};

const withAlpha = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [],
  theme: {
    extend: {
      colors: {
        border: withAlpha('border'),
        input: withAlpha('input'),
        ring: withAlpha('ring'),
        background: withAlpha('background'),
        foreground: withAlpha('foreground'),
        primary: {
          DEFAULT: withAlpha('primary'),
          foreground: withAlpha('primary-foreground'),
          50: withAlpha('primary-50'),
          100: withAlpha('primary-100'),
          700: withAlpha('primary-700'),
          800: withAlpha('primary-800'),
          900: withAlpha('primary-900'),
        },
        secondary: {
          DEFAULT: withAlpha('secondary'),
          foreground: withAlpha('secondary-foreground'),
        },
        destructive: {
          DEFAULT: withAlpha('destructive'),
          foreground: withAlpha('destructive-foreground'),
        },
        muted: {
          DEFAULT: withAlpha('muted'),
          foreground: withAlpha('muted-foreground'),
        },
        accent: {
          DEFAULT: withAlpha('accent'),
          foreground: withAlpha('accent-foreground'),
        },
        popover: {
          DEFAULT: withAlpha('popover'),
          foreground: withAlpha('popover-foreground'),
        },
        card: {
          DEFAULT: withAlpha('card'),
          foreground: withAlpha('card-foreground'),
        },
        sidebar: {
          DEFAULT: withAlpha('sidebar-background'),
          foreground: withAlpha('sidebar-foreground'),
          primary: withAlpha('sidebar-primary'),
          'primary-foreground': withAlpha('sidebar-primary-foreground'),
          accent: withAlpha('sidebar-accent'),
          'accent-foreground': withAlpha('sidebar-accent-foreground'),
          border: withAlpha('sidebar-border'),
          ring: withAlpha('sidebar-ring'),
        },
        text: withAlpha('text'),
        heading: withAlpha('heading'),
        'border-primary': withAlpha('primary'),
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fromApp('tailwindcss/defaultTheme').fontFamily.sans],
        mono: ['var(--font-mono)'],
      },
      zIndex: {
        'top-bar': '40',
        'dialog-overlay': '999',
        dialog: '9999',
        menu: '10000',
        popover: '10001',
        toast: '10003',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [
    optionalPlugin('tailwindcss-animate'),
    optionalPlugin('@tailwindcss/typography'),
  ].filter(Boolean),
};
