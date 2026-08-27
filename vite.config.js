import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // Deployed as a GitHub *user* page from a repo named dagavedant.github.io,
  // which serves from the domain root — so base is '/', not '/<repo>/'.
  // Switching to a custom domain later needs no change here, only a CNAME.
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Per-repo source chunks are dynamically imported; keep them as separate
    // files so opening one repo does not pull the other ten.
    chunkSizeWarningLimit: 900,
  },
})
