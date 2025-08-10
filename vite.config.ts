import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    host: '0.0.0.0',
    open: false,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        ui: 'src/ui/index.html',
        code: 'src/code/code.ts'
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
}) 