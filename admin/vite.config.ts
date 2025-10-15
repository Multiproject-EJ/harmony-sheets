import { defineConfig } from 'vite'

export default defineConfig({
  base: '/admin/',
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/bootstrap.js',
        chunkFileNames: (chunkInfo) =>
          chunkInfo.name === 'main' ? 'assets/admin.js' : 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/admin.css'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  server: { port: 5173 }
})
