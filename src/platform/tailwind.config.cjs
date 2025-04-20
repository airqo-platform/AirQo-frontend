const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
    './node_modules/flowbite-react/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: ({ opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--color-primary-rgb), ${opacityValue})`;
          }
          return `rgb(var(--color-primary-rgb))`;
        },
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
      },
      animation: {
        ping: 'ping 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      gridTemplateColumns: {
        account: '1fr minmax(0,1480px) 1fr',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
    container: {
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
    require('flowbite/plugin'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          primary: 'var(--color-primary)', // still for DaisyUI
          ...require('daisyui/src/colors/themes')['[data-theme=light]'],
          'base-200': '#ebf0f9',
          'base-300': '#e2faff',
        },
      },
    ],
  },
};
