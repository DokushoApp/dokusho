/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [

  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};