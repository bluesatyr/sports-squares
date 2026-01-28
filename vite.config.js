import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    base: command === 'build' ? '/sports-squares/' : '/', // Base path for GitHub Pages deployment, or root for local dev
    plugins: [
      vue(),
      tailwindcss(),
    ],
  };
});
