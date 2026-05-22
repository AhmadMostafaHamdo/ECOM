import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const pwaThemeColor = '#ff9500'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      filename: 'sw.js',
      manifestFilename: 'manifest.webmanifest',
      injectRegister: 'script-defer',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon-180x180.png',
        'pwa-192x192.png',
        'pwa-512x512.png'
      ],
      manifest: {
        name: 'Studio Commerce',
        short_name: 'Studio Commerce',
        description: 'A modern commerce experience for Arabic and international shoppers.',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        dir: 'rtl',
        lang: 'ar',
        theme_color: pwaThemeColor,
        background_color: '#ffffff',
        categories: ['shopping', 'business', 'lifestyle'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/apple-touch-icon-180x180.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globIgnores: ['**/firebase-messaging-sw.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/auth/i,
          /^\/notifications/i,
          /^\/permissions/i,
          /^\/profile/i,
          /^\/dashboard/i,
          /^\/socket\.io\//
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.method === 'GET' &&
              ['script', 'style', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ request }) =>
              request.method === 'GET' && request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-resources',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ request, url }) =>
              request.method === 'GET' &&
              request.destination === 'image' &&
              !url.pathname.includes('/api/') &&
              !url.pathname.toLowerCase().includes('/profile'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-resources',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ request, url }) =>
              request.method === 'GET' &&
              url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-font-styles',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ request, url }) =>
              request.method === 'GET' &&
              url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-font-files',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
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
