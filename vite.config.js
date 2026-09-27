import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // three.js is ~600 kB on its own. Splitting it out keeps the app code in
    // a small cacheable chunk and lets the browser re-use it across deploys.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber'],
          motion: ['framer-motion'],
          router: ['react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})

