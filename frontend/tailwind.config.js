/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: { primary: '#CE1567', accent: '#FFEBF5', success: '#11A36F', warning: '#F4B400', danger: '#E43F5A', neutral: '#2E2E2E', bg: '#FFFFFF' }, fontFamily: { poppins: ['Poppins', 'sans-serif'] }, boxShadow: { soft: '0 10px 30px rgba(46, 46, 46, .08)' } } },
  plugins: [],
};
