/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", 
  ],
  theme: {
    extend: {
      colors: {
        'verde-principal-oscuro': '#1abc63ff',       // color verde global
        'verde-secundario-claro': '#2ecc71', // color verde más claro
      },
    },
  },
  plugins: [],
};
