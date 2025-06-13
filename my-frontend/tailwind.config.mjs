// tailwind.config.mjs
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Solid Colors
        primary: {
          DEFAULT: 'var(--primary)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
        },
        background: {
          DEFAULT: 'var(--background)',
        },
        text: {
          DEFAULT: 'var(--text)',
        },
        
        // Gradient Colors
        gradient: {
          hero: {
            DEFAULT: 'linear-gradient(to right, var(--gradient-hero-start), var(--gradient-hero-end))',
          },
          buttonHover: {
            DEFAULT: 'linear-gradient(to right, var(--gradient-button-hover-start), var(--gradient-button-hover-end))',
          },
        },
        
        // Button States
        button: {
          default: 'var(--button-default)',
          hover: {
            start: 'var(--button-hover-start)',
            end: 'var(--button-hover-end)',
          },
          active: 'var(--button-active)',
        },
      },
    },
  },
  plugins: [],
}