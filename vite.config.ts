import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// NOTE: If deploying to GitHub Pages under /<repo>/, set base to '/<repo>/'.
// Example: export default defineConfig({ plugins: [react()], base: '/bar-rota-webapp/' })
export default defineConfig({
  plugins: [react()],
  // base: '/YOUR_REPO_NAME/'
})
