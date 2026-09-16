/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Cyber Emerald
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        dark: {
          950: '#070a12',
          900: '#0d131f',
          850: '#131c2d',
          800: '#1c283f',
          700: '#293956',
        },
        cyber: {
          emerald: '#10b981',
          mint: '#34d399',
          amber: '#f59e0b',
          gold: '#fbbf24',
          violet: '#8b5cf6',
          purple: '#a855f7',
          rose: '#f43f5e',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'clear': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'clear-dark': '0 8px 30px 0 rgba(0, 0, 0, 0.5)',
        'hud-emerald': '0 0 15px -3px rgba(16, 185, 129, 0.3)',
        'hud-amber': '0 0 15px -3px rgba(245, 158, 11, 0.3)',
        'hud-violet': '0 0 15px -3px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [],
}

