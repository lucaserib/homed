/** @type {import('nativewind').NativewindConfig} */
module.exports = {
  tailwindConfig: './tailwind.config.js',
  appDir: 'app',
  input: ['app/**/*.{js,jsx,ts,tsx}', 'components/**/*.{js,jsx,ts,tsx}'],
  output: {
    filename: 'styles.css',
  },
};
