import { defineConfig } from 'vite'

export default defineConfig({
  base: '/admin/',
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  },
  server: { port: 5173 }
})
