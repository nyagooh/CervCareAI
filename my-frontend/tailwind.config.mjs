// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        background: 'var(--background)',
        text: 'var(--text)',
        'gradient-hero-start': 'var(--gradient-hero-start)',
        'gradient-hero-end': 'var(--gradient-hero-end)',
        'button-default': 'var(--button-default)',
        'button-hover-start': 'var(--button-hover-start)',
        'button-hover-end': 'var(--button-hover-end)',
        'button-active': 'var(--button-active)',
      },
    },
  },
  plugins: [],
};
