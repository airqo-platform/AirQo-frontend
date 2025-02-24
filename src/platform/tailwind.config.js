const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/common/components/**/*.{js,jsx,ts,tsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
    './node_modules/flowbite-react/**/*.js',
  ],
  theme: {
    extend: {
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
        ping: 'ping 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      gridTemplateColumns: {
        account: '1fr minmax(0, 1480px) 1fr',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'light-blue': '#135DFF14',
        'sidebar-blue': '#135DFF0A',
        'dark-blue': '#0F4ACC',
        'light-text': '#6D7175',
        'baby-blue': '#F5F8FF',
        'link-blue': '#2E72D2',
        'form-input': '#F3F4F7',
        'check-box': '#D1D2D2',
        'radio-input': '#DADEE7',
        'input-outline': '#209464',
        'svg-green': '#209464',
        'input-light-outline': '#E1E7EC',
        'pill-grey': '#F3F2FF',
        blue: {
          200: '#2DB6F11A',
          300: '#1C7398',
          600: '#145FFF',
          900: '#135DFF',
          950: '#0F4ACC',
          960: '#060049',
        },
        grey: {
          50: '#EAECF0',
          100: '#363A4414',
          150: '#363A4429',
          200: '#00000014',
          250: '#0000000A',
          300: '#6D7175',
          350: '#667085',
          400: '#B0B0B0',
          500: '#667085',
          700: '#DDDDDD',
          710: '#344054',
          720: '#344054',
          750: '#E8E8E8',
          800: '#8C9196',
          900: '#808080',
        },
        skeleton: '#363A4429',
        skeleton2: '#F9F9F9',
        black: {
          600: '#202223',
          700: '#353E52',
          900: '#000000',
          800: '#101828',
        },
        yellow: {
          200: '#FFEA8A',
        },
        turquoise: {
          200: '#A4E8F2',
        },
        green: {
          50: '#C6FFE4',
          150: '#EBF5FF',
          200: '#AEE9D1',
          550: '#0CE87E',
        },
        red: {
          200: '#FED3D1',
          500: '#D82C0D',
        },
        purple: {
          400: '#D476F5',
          550: '#877651',
          600: '#8776F51A',
          700: '#584CAB',
        },
        orange: {
          450: '#FE9E35',
        },
        'secondary-neutral-light': {
          25: '#F9FAFB',
          50: '#F3F6F8',
          100: '#E1E7EC',
          300: '#9EB0C2',
          400: '#6F87A1',
          500: '#536A87',
          600: '#485972',
          800: '#3C4555',
          900: '#333946',
        },
        'secondary-neutral-dark': {
          50: '#F6F6F7',
          100: '#E2E3E5',
          200: '#C4C7CB',
          300: '#9EA3AA',
          400: '#7A7F87',
          700: '#3E4147',
          950: '#1C1D20',
        },
        success: {
          50: '#ECFDF3',
          700: '#057747',
        },
        primary: {
          50: '#EBF5FF',
          100: '#D6E9FF',
          300: '#8AC4FF',
          600: '#145FFF',
        },
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
          ...require('daisyui/src/colors/themes')['[data-theme=light]'],
          primary: '#53b4f4',
          accent: '#ed1164',
          'base-200': '#ebf0f9',
          'base-300': '#e2faff',
        },
      },
    ],
  },
};
