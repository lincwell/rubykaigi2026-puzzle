import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/**
 * GitHub Pages deploys to https://<user>.github.io/<repo>/
 * Set VITE_BASE env var to the repo name with slashes, e.g. /sample-rubywasm/
 * Falls back to '/' for local dev.
 *
 * Usage:
 *   VITE_BASE=/sample-rubywasm/ npm run build
 *
 * Or add to .env.production:
 *   VITE_BASE=/sample-rubywasm/
 */
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  root: '.',
  base,
  plugins: [tailwindcss()],
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        en: path.resolve(__dirname, 'en/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '#': path.resolve(__dirname, 'src'),
    },
  },
})
