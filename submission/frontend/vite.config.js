import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api/create-issue': {
          target: env.N8N_URL || 'http://localhost:5678',
          changeOrigin: true,
          secure: true,
          rewrite: () => '/webhook/itmo-create-issue',
        },
      },
    },
    test: { environment: 'jsdom', globals: true, setupFiles: './tests/setup.js', css: true },
  };
});
