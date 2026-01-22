import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    hmr: {
      overlay: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        proxyTimeout: 10000,
        onError: (err, req, res) => {
          // Handle proxy errors gracefully
          if (res && !res.headersSent) {
            res.writeHead(503, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({ 
              error: 'Backend server is not running. Please start it with "npm run server"' 
            }));
          }
        }
      }
    }
  },
  css: {
    devSourcemap: true
  }
})
