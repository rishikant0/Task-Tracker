/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary
        primary: '#7C5CFF',
        'primary-hover': '#6D4AFF',
        // Backgrounds
        'bg-main': '#080F1D',
        'bg-sidebar': '#111B2B',
        'bg-card': '#162235',
        'bg-card-hover': '#1B2A40',
        // Text
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        // Status
        'status-todo': '#3B82F6',
        'status-progress': '#F59E0B',
        'status-done': '#22C55E',
        // Priority
        'priority-high': '#EF4444',
        'priority-medium': '#F59E0B',
        'priority-low': '#22C55E',
        // Border
        'border-default': '#1E2D45',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4)',
        modal: '0 20px 60px rgba(0,0,0,0.6)',
        glow: '0 0 20px rgba(124,92,255,0.3)',
      },
    },
  },
  plugins: [],
};