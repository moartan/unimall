import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      tailwindcss(),
      react()
    ],
    define: {
      __VITE_API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:8081'),
    },
  };
})
