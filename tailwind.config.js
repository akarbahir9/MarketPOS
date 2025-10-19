/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Kufi Arabic"', 'sans-serif'],
      },
      colors: {
        'background': '#111827',
        'surface': '#1F2937',
        'primary': '#4F46E5',
        'primary-hover': '#4338CA',
        'secondary': '#9CA3AF',
        'text-primary': '#F9FAFB',
        'text-secondary': '#D1D5DB',
        'border': '#374151',
      },
    },
  },
  plugins: [],
};
