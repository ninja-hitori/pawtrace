import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, /api and /uploads are proxied to the FastAPI backend (default http://localhost:8000).
const backend = process.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': backend, '/uploads': backend, '/health': backend },
  },
})
