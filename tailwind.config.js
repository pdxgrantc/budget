/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        DEFAULT: '#1a1a1a',
      },
      textColor: {
        DEFAULT: '#c6c6c6',
      },
      fontSize: {
        DEFAULT: '1.25rem',
        title: '5rem',
        xxlheader: '4.25rem',
        xlheader: '3.75rem',
        lheader: '3.25rem',
        header: '2.75rem',
        subheader: '2.25rem',
        xxl: '2rem',
        xl: '1.75rem',
      },
    },
  },
  plugins: [],
}

