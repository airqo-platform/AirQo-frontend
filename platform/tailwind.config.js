const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/common/components/**/*.{js,jsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
    './node_modules/flowbite-react/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      // Follow https://tailwindcss.com/docs/customizing-colors to customise colors
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'light-blue': '#135DFF14',
        'sidebar-blue': '#135DFF0A',
        'dark-blue': '#0F4ACC',
        'light-text': '#6D7175',
        'baby-blue': '#F5F8FF',
        'link-blue': '#2E72D2',
        blue: {
          200: '#2DB6F11A',
          300: '#1C7398',
          900: '#135DFF',
        },
        grey: {
          100: '#363A4414',
          150: '#363A4429',
          200: '#00000014',
          250: '#0000000A',
          300: '#6D7175',
          400: '#B0B0B0',
          700: '#DDDDDD',
          750: '#E8E8E8',
          800: '#8C9196',
          900: '#808080',
        },
        skeleton: '#363A4429',
        black: {
          600: '#202223',
          700: '#353E52',
          900: '#000000',
        },
        yellow: {
          200: '#FFEA8A',
        },
        turquoise: {
          200: '#A4E8F2',
        },
        green: {
          200: '#AEE9D1',
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
        white: {
          100: '#F6F6F7',
          900: '#FFFFFF',
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
  plugins: [require('@tailwindcss/typography'), require('daisyui'), require('flowbite/plugin')],
  daisyui: {
    themes: [
      // Platform themes extending default daisy themes (can be further adapted)
      // https://daisyui.com/docs/themes/
      {
        light: {
          ...require('daisyui/src/colors/themes')['[data-theme=light]'],
          primary: '#53b4f4',
          accent: '#ed1164',
          'base-200': '#ebf0f9', // off-white
          'base-300': '#e2faff', // off-blue
        },
      },
      // {
      //   dark: {
      //     ...require('daisyui/src/colors/themes')['[data-theme=light]'],
      //     primary: '#53b4f4',
      //     accent: '#ed1164',
      //     'base-200': '#ebf0f9', // off-white
      //     'base-300': '#e2faff', // off-blue
      //   },
      // },
    ],
  },
};
