import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies API + upload calls to the backend on :4000, so the
// frontend can use same-origin relative paths (no CORS headaches during the demo).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
});
