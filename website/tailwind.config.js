/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}', './docs/**/*.{md,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--ifm-color-primary-lightest)',
          100: 'var(--ifm-color-primary-lighter)',
          200: 'var(--ifm-color-primary-light)',
          300: 'var(--ifm-color-primary)',
          400: 'var(--ifm-color-primary-dark)',
          500: 'var(--ifm-color-primary-darker)',
          600: 'var(--ifm-color-primary-darkest)',
        },
      },
    },
  },
  plugins: [],
};
