import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['monaco-editor/esm/vs/editor/editor.worker.js'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['monaco-editor'],
          'vendor': ['react', 'react-dom'],
          'ui': ['@heroicons/react', 'react-hot-toast'],
          'editor': ['@monaco-editor/react'],
          'utils': ['uuid', 'jszip', 'file-saver']
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    target: 'es2015'
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    fs: {
      allow: ['.'],
    },
  },
  preview: {
    port: 4173,
    host: true
  }
}) 