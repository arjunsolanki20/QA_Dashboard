/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Mono"', 'monospace'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
      colors: {
        navy: {
          900: '#0a0f1e',
          800: '#0f1829',
          700: '#152236',
          600: '#1e3a5f',
          500: '#2563a8',
        },
        success:  '#10b981',
        warning:  '#f59e0b',
        danger:   '#ef4444',
        muted:    '#64748b',
      }
    },
  },
  plugins: [],
}
