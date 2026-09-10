import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // This is what actually fixes the update problem: Workbox
      // regenerates a revisioned precache manifest on every build (unlike
      // the old sw.js's hardcoded CACHE_VERSION string, which never
      // changed between deploys), so the browser reliably detects a new
      // service worker each time you ship - and autoUpdate activates it
      // right away instead of waiting for every open tab to close.
      registerType: 'autoUpdate',

      // Static files under public/ that are linked directly from
      // index.html but aren't part of the manifest below (e.g. an
      // <link rel="apple-touch-icon"> tag) - add any others you find
      // there too (favicon.ico, robots.txt, etc).
      includeAssets: ['icons/apple-touch-icon.png'],

      // Ported straight from the old public/manifest.json - delete that
      // file once this is in, the plugin generates manifest.webmanifest
      // from this at build time and injects the <link rel="manifest">
      // tag into index.html itself.
      manifest: {
        name: 'Arogya Intellect',
        short_name: 'Arogya',
        description:
          'Cognitive care and memory assistance for elderly well-being, built for communities of the North Eastern Region of India.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#F8F1E1',
        theme_color: '#F8F1E1',
        lang: 'en-IN',
        dir: 'ltr',
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
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
