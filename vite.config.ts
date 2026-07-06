import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') && !id.includes('@react-three')) return 'three'
            if (id.includes('@react-three') || id.includes('postprocessing')) return 'r3f'
            return 'vendor'
          }
        },
      },
    },
  },
})
