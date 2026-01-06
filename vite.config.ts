import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // <--- Importe isso

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: false, // Já criamos manualmente o manifest.json, então deixamos false ou linkamos ele
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'] // O que ele vai salvar offline
      }
    })
  ],
})