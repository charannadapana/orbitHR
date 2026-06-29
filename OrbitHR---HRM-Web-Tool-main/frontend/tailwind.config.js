export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#050507',
        surface: '#121218',
        border: 'rgba(255, 255, 255, 0.1)',
        accent: '#7c3aed',
        purple: {
          primary: '#7c3aed',
          mid: '#9333ea',
          light: '#a855f7',
          glow: 'rgba(124, 58, 237, 0.4)',
        },
        slate: {
          950: '#050507',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

