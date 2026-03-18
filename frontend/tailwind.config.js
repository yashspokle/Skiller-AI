/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cabinet Grotesk"', '"DM Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        obsidian: { DEFAULT: '#0A0A0F', 50: '#1a1a2e', 100: '#16213e' },
        amber: { brand: '#F5A623', glow: '#FFD166', muted: '#C8860A' },
        slate: { deep: '#1E1E2E', card: '#252535', border: '#2E2E45' },
        neon: { green: '#00FF94', blue: '#4FC3F7', purple: '#B39DDB' }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out'
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        glow: { from: { boxShadow: '0 0 10px #F5A623' }, to: { boxShadow: '0 0 25px #F5A623, 0 0 50px #F5A62366' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } }
      }
    }
  },
  plugins: []
};
