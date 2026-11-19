import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5180,
      strictPort: true,
      // Request /api diteruskan ke backend Express sehingga browser cukup memanggil origin yang sama.
      proxy: { '/api': { target: env.VITE_API_TARGET || 'http://localhost:4100', changeOrigin: true } },
    },
  }
})
