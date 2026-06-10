/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // AirQo Design System Colors
        primary: {
          50: '#F9FAFB',
          100: '#D7E9FF',
          600: '#135DFF',
          700: '#0A45EB',
        },
        secondary: {
          'neutral-light': {
            'nl50': '#F3F6F8',
            'nl400': '#6F87A1',
            'nl800': '#3C4555',
          },
        },
        gray: {
          50: '#F9FAFB',
          100: '#EFF1F5',
          200: '#EAECF0',
          300: '#D0D5DD',
          400: '#98A2B3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          900: '#101828',
        },
        'gray-cool': {
          50: '#F9F9FB',
          100: '#EFF1F5',
          200: '#DCDFEA',
        },
        success: {
          50: '#ECFDF3',
          700: '#027A48',
        },
        error: {
          500: '#F04438',
        },
        base: {
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['60px', { lineHeight: '72px', fontWeight: '500' }],
        'display-lg': ['48px', { lineHeight: '60px', fontWeight: '500' }],
        'display-xs': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'text-xl': ['20px', { lineHeight: '30px', fontWeight: '400' }],
        'text-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'text-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}