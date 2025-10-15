import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/admin/',
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  },
  define: {
    'import.meta.env.DEV': 'false',
    'import.meta.env.PROD': 'true',
    'import.meta.env.BASE_URL': "'/admin/'"
  },
  build: {
    outDir: 'static',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      formats: ['es'],
      fileName: () => 'admin.js'
    },
    rollupOptions: {
      external: [],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'admin.css'
          }
          return '[name]-[hash][extname]'
        }
      }
    }
  }
})
