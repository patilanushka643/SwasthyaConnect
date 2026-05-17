/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0891b2',
        accent: '#f59e0b',
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(2, 132, 199, 0.25)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
