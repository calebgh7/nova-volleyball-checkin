/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'volleyball-orange': '#f97316',
        'volleyball-orange-dark': '#ea580c',
        'volleyball-blue': '#3b82f6',
        'volleyball-blue-dark': '#1d4ed8',
        'volleyball-purple': '#8b5cf6',
        'volleyball-purple-dark': '#7c3aed',
        // Nova Brand Colors
        'nova-purple-light': '#9682EB',
        'nova-purple': '#4D1F84',
        'nova-purple-dark': '#5A1FB7',
        'nova-cyan': '#B9E7FE',
        'nova-black': '#000000',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(249, 115, 22, 0.6)',
          },
        },
      },
    },
  },
  plugins: [],
}
