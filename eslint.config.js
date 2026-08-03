const js = require('@eslint/js');

module.exports = [
  { ignores: ['backend/public/**', 'frontend/dist/**', '**/node_modules/**'] },
  js.configs.recommended,
  {
    files: ['backend/**/*.js', 'frontend/src/**/*.{js,jsx}'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } }, globals: { window: 'readonly', document: 'readonly', navigator: 'readonly', localStorage: 'readonly', crypto: 'readonly', process: 'readonly', console: 'readonly', fetch: 'readonly', self: 'readonly', workbox: 'readonly', importScripts: 'readonly' } },
    rules: { 'no-unused-vars': 'off', 'no-undef': 'off', 'no-redeclare': 'off' },
  },
  {
    files: ['frontend/public/sw.js'],
    languageOptions: { globals: { self: 'readonly', workbox: 'readonly', importScripts: 'readonly' } },
    rules: { 'no-undef': 'off' },
  },
];
