import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'update-sw-version',
      closeBundle() {
        const timestamp = Date.now();
        const swDistPath = path.resolve(process.cwd(), 'dist/sw.js');
        if (fs.existsSync(swDistPath)) {
          let content = fs.readFileSync(swDistPath, 'utf-8');
          content = content.replace(/const CACHE_NAME = ['"].*?['"]/, `const CACHE_NAME = 'diwali-mela-v${timestamp}'`);
          fs.writeFileSync(swDistPath, content);
          console.log(`[PWA] Updated dist/sw.js cache name to diwali-mela-v${timestamp}`);
        }
      }
    }
  ],
})
