import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Kompatibel untuk deployment GitHub Pages, Vercel, Netlify & HP
  plugins: [react()],
  server: {
    port: 5173,
    host: true // Mengizinkan akses HP dari jaringan Wi-Fi lokal
  }
})
