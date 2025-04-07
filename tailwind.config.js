/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f8ff',
          100: '#ebf0ff',
          200: '#d6e1ff',
          300: '#bccbff',
          400: '#9eabf7',
          500: '#8a96e8',
          600: '#7882cf',
          700: '#6673b7',
          800: '#5560a0',
          900: '#464f89',
        },
        secondary: {
          50: '#f7f5ff',
          100: '#eeeaff',
          200: '#dcd4ff',
          300: '#c8baff',
          400: '#b3a2f7',
          500: '#a593e6',
          600: '#9484cc',
          700: '#8476b3',
          800: '#73679c',
          900: '#625784',
        },
        accent: {
          50: '#fef5f9',
          100: '#fbeaef',
          200: '#f8d5e3',
          300: '#f5b9d1',
          400: '#eda7c0',
          500: '#e091ad',
          600: '#cc7e96',
          700: '#b56d82',
          800: '#9e5c6f',
          900: '#864c5c',
        },
        festive: {
          yellow: '#FFF1C8',
          orange: '#FFD5B8',
          purple: '#E1D5F5',
          pink: '#FBD8E5',
          green: '#D2EDD4',
          blue: '#D5E8F7',
        }
      },
      fontFamily: {
        'display': ['Pacifico', 'cursive'],
        'heading': ['Quicksand', 'sans-serif'],
        'body': ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'fun': '0 8px 20px -5px rgba(158, 171, 247, 0.4)',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        'button': '0 4px 10px -2px rgba(126, 130, 207, 0.25)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
    },
  },
  plugins: [],
} 