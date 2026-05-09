import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      hmr: {
        clientPort: 5173,
      },
      proxy: {
        '/api': {
          target: process.env.VITE_API_TARGET || 'http://api:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/uploads': {
          target: process.env.VITE_API_TARGET || 'http://api:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
