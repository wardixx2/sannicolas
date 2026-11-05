import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sannicolas/', // Palitan ng pangalan ng iyong repository kung sakaling magbago
})