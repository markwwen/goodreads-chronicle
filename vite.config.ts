import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ghPages } from 'vite-plugin-gh-pages'

export default defineConfig({
  plugins: [react(), ghPages()],
  base: 'https://github.com/markwwen/goodreads-chronicle', // 将 <your-repo-name> 替换为你的 GitHub 仓库名称
})