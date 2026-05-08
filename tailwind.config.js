/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Space Mono"', 'monospace'],
        'body': ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        stellar: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b8e4fc',
          300: '#7acef8',
          400: '#35b4f2',
          500: '#0b9ad9',
          600: '#007bb7',
          700: '#016295',
          800: '#065278',
          900: '#0a4564',
        },
        space: {
          950: '#03060d',
          900: '#060c1a',
          800: '#0b1628',
          700: '#0f2040',
          600: '#152c58',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
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
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(11, 154, 217, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(11, 154, 217, 0.7)' },
        }
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(11, 154, 217, 0.05) 1px, transparent 1px), 
                         linear-gradient(90deg, rgba(11, 154, 217, 0.05) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    },
  },
  plugins: [],
}
