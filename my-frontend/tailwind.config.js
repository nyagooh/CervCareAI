/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'gentle-float': 'gentle-float 6s ease-in-out infinite',
        'brain-pulse': 'brain-pulse 4s ease-in-out infinite',
        'gentle-heartbeat': 'gentle-heartbeat 3s ease-in-out infinite',
        'soft-pulse': 'soft-pulse 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.8s ease-out forwards',
      },
      keyframes: {
        'gentle-float': {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)' 
          },
          '33%': { 
            transform: 'translateY(-10px) rotate(2deg)' 
          },
          '66%': { 
            transform: 'translateY(-5px) rotate(-1deg)' 
          },
        },
        'brain-pulse': {
          '0%, 100%': { 
            transform: 'scale(1)',
            filter: 'hue-rotate(0deg)'
          },
          '50%': { 
            transform: 'scale(1.1)',
            filter: 'hue-rotate(10deg)'
          },
        },
        'gentle-heartbeat': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'soft-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(236, 72, 153, 0.4)'
          },
        },
        'fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
    },
  },
  plugins: [],
}