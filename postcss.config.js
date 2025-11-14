// PostCSS config to enable Tailwind CSS v4 with Vite
// Vite runs PostCSS when a config is present. This ensures
// the `@import "tailwindcss";` in src/index.css is processed.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
