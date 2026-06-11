import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/wilayah-api': {
        target: 'https://wilayah.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wilayah-api/, '/api'),
      },
    },
  },
})
