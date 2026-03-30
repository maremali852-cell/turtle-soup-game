import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 开发服务器配置
  server: {
    port: 5173,
    
    // 代理配置
    proxy: {
      // 将 /api 开头的请求代理到后端
      '/api': {
        target: 'http://localhost:3000',  // 后端地址
        changeOrigin: true,               // 修改请求头的 origin
        secure: false,                    // 开发环境不验证 SSL
      }
    }
  }
})
