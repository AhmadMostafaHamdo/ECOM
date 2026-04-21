import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'framer-motion']
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
            if (id.includes('react-router')) return 'router';
            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('/redux') || id.includes('redux-thunk')) return 'state';
            if (id.includes('i18next')) return 'i18n';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('react-international-phone') || id.includes('libphonenumber-js')) return 'phone';
            if (id.includes('react-toastify') || id.includes('lucide-react')) return 'ui';
            if (id.includes('socket.io-client')) return 'realtime';
            return 'vendor';
          }
        }
      }
    }
  }
})
