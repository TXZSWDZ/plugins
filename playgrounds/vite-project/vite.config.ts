import path from 'node:path'

// https://vite.dev/config/
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const relativePath = (p: string) => path.resolve(__dirname, p)

export default defineConfig({
  resolve: {
    alias: {
      '@': relativePath('./src'),
    },
  },
  plugins: [vue()],
})
