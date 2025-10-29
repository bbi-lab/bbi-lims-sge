/** @type {import('tailwindcss').Config} */
const primeui = require("tailwindcss-primeui");
const { addIconSelectors } = require("@iconify/tailwind");

module.exports = {
    content: ["./components/**/*.{js,vue,ts}", "./layouts/**/*.vue", "./pages/**/*.vue", "./plugins/**/*.{js,ts}", "./nuxt.config.{js,ts}", "./app.vue", "./error.vue"],
    plugins: [
        primeui,
    // Iconify plugin for clean selectors, requires writing a list of icon sets to load
    // Icons usage in HTML:
    //  <span class="iconify mdi-light--home"></span>
    //  <span class="iconify-color vscode-icons--file-type-tailwind"></span>
    addIconSelectors(["mdi", "fluent", "grommet-icons", "ic", "icon-park-solid", "ix", "ph" ]),
    ],
    darkMode: ['selector', '[class*="app-dark"]']
};
