import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    rollupOptions: {
      output: {
        // Libraries change far less often than the site's own code. Keeping them in their own
        // files means a returning visitor's browser can reuse them after a site update.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['motion/react'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
