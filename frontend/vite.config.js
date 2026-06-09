import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  /*optimizeDeps: {
    force: true
  },
  cacheDir: 'node_modules/.vite_cache'  // ← Different cache folder name fixes the lock*/
})