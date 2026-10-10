/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#09090B',
          50: '#27272A',
          100: '#18181B',
          800: '#18181B',
          900: '#121215',
          950: '#09090B',
        },
        surface: {
          DEFAULT: '#18181B',
          muted: '#121215',
          elevated: '#27272A',
          hover: '#2E2E33',
        },
        border: {
          subtle: '#27272A',
          DEFAULT: '#27272A',
          muted: '#1E1E22',
        },
        lime: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
          950: '#1a2e05',
        },
        accent: {
          DEFAULT: '#A3E635',
          hover: '#84CC16',
          subtle: 'rgba(163, 230, 53, 0.08)',
          border: 'rgba(163, 230, 53, 0.25)',
        },
        brand: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
          950: '#1a2e05',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        'lime-glow': '0 0 20px -5px rgba(163, 230, 53, 0.2)',
      },
    },
  },
  plugins: [],
};
