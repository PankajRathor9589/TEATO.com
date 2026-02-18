/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teato: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#f9d7ad',
          300: '#f4ba79',
          400: '#ee9343',
          500: '#ea7620',
          600: '#db5c16',
          700: '#b54414',
          800: '#903618',
          900: '#742f17',
          950: '#3e150a',
        },
        premium: {
          bg: '#0B1220',
          card: '#111827',
          accent: '#FF5A5F',
          accentHover: '#F43F5E',
          text: '#F9FAFB',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(255, 90, 95, 0.4)',
        'glow-sm': '0 0 20px -5px rgba(255, 90, 95, 0.3)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.25), 0 0 1px rgba(255, 255, 255, 0.06)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.35), 0 0 1px rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
      },
    },
  },
  plugins: [],
};
