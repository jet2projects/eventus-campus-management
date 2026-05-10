/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chakra: {
          orange: '#FF6A00',
          amber: '#FFB347',
          gold: '#FACC15',
          dark: '#0F172A',
          darker: '#060B14',
          surface: '#1A1A2E',
          card: '#16213E',
        },
      },
      fontFamily: {
        ninja: ['"Bebas Neue"', 'sans-serif'],
        display: ['"Exo 2"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'chakra-pulse': 'chakraPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'particle': 'particle 5s linear infinite',
      },
      keyframes: {
        chakraPulse: {
          '0%,100%': { boxShadow: '0 0 20px rgba(255,106,0,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255,106,0,0.8)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        particle: {
          '0%': { transform: 'translateY(100vh)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-10vh)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
