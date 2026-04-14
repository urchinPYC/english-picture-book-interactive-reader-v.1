import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  server: {
    port: 3000, // 前端開發伺服器運行在 3000 端口
    host: true,
    proxy: {
      // 將所有 /api 請求代理轉發到後端伺服器
      '/api': {
        target: 'http://localhost:3001', // 後端伺服器運行在 3001 端口
        changeOrigin: true,
        rewrite: (path ) => path.replace(/^\/api/, '/api'),
      },
    },
    // 允許來自 Manus 沙箱的請求
    hmr: {
      clientPort: 443, // For Gitpod / Codespaces
    },
    watch: {
      usePolling: true,
    },
    fs: {
      strict: false,
      cachedChecks: false,
    },
    // 允許來自 Manus 沙箱的特定主機
    cors: true,
    // 允許來自 Manus 沙箱的特定主機
    // 這裡需要根據實際的沙箱 URL 進行配置，例如：
    // allowedHosts: [
    //   '3000-i6dveaiy6o2sopr8uxg9a-de6ca3e1.sg1.manus.computer',
    //   'localhost',
    //   '127.0.0.1'
    // ],
  },
  resolve: {
    alias: {
      '@/src': '/src',
    },
  },
})
