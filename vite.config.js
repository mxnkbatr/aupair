import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// Touch devices apply :hover on tap and keep it until the next tap elsewhere,
// so hover effects are limited to real pointers.
const hoverOnlyOnPointer = () => ({
  postcssPlugin: 'hover-only-on-pointer',
  Once(root, { AtRule }) {
    root.walkRules((rule) => {
      if (!rule.selector.includes(':hover')) return
      if (rule.parent?.type === 'atrule' && rule.parent.params === '(hover: hover) and (pointer: fine)') return
      const hover = rule.selectors.filter((s) => s.includes(':hover'))
      const rest = rule.selectors.filter((s) => !s.includes(':hover'))
      const media = new AtRule({ name: 'media', params: '(hover: hover) and (pointer: fine)' })
      media.append(rule.clone({ selectors: hover }))
      rule.after(media)
      if (rest.length) rule.selectors = rest
      else rule.remove()
    })
  },
})
hoverOnlyOnPointer.postcss = true

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.png',
        'apple-touch-icon.png',
        'logo.png',
        'cover.jpg',
        'icons/icon-192.png',
        'icons/icon-512.png',
      ],
      manifest: {
        name: 'Mongolian Au Pair',
        short_name: 'Au Pair',
        description: 'Албан ёсны Au Pair хөтөлбөр · 2005 оноос · IAPA гишүүн',
        lang: 'mn',
        theme_color: '#f2f2f7',
        background_color: '#f2f2f7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  base: '/',
  css: {
    postcss: { plugins: [hoverOnlyOnPointer()] },
  },
  server: {
    host: true, // 0.0.0.0 — phone/LAN can open via http://<your-ip>:5173
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
})
