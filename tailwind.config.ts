import type { Config } from 'tailwindcss';

const config: Config = {
  // THIS IS THE MAGIC LINE THAT ENABLES DARK MODE
  darkMode: 'class',
  
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
        theme: {
    extend: {
      // ... your existing colors, fonts, etc.
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(10deg)' },
        },
        'ping-slow': {
          '75%, 100%': { transform: 'scale(1.5)', opacity: '0' },
        }
      },
      animation: {
        wiggle: 'wiggle 0.5s ease-in-out',
        'ping-slow': 'ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
};

export default config;

