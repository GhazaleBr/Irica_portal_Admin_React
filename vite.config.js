import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    strictPort: true, // اگر پورت اشغال بود، به پورت بعدی نرود و خطا بدهد
  },
})
