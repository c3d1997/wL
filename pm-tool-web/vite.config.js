import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 全域自動注入 SCSS 變數，每個元件的 <style lang="scss"> 都可直接使用
        additionalData: `@use "@/assets/styles/variables" as *;`
      }
    }
  },
  build: {
    // 輸出目錄（Vercel 預設偵測 dist/）
    outDir: 'dist',
    // 產生 sourcemap 供除錯（部署後可關閉）
    sourcemap: false,
    // chunk 超過 500kb 時警告
    chunkSizeWarningLimit: 500,
  },
})
