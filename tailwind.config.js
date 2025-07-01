/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-white': '#FFFFFF',
        'soft-pink': '#FDF8F6',
        'rose-gold': '#D4A5A5',
        'rose-gold-dark': '#C48B8B',
        'deep-charcoal': '#1A1A1A',
        'text-primary': '#2D2D2D',
        'text-secondary': '#5A5A5A',
        'light-gray': '#F0F0F0',
        'medium-gray': '#8B8B8B',
        'border-gray': '#E0E0E0',
        'success-green': '#4CAF50',
        'warning-amber': '#FF9800',
        'error-red': '#F44336',
        'soft-pink-hover': '#F5E6E0',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'korean': ['Inter', 'Noto Sans KR', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}