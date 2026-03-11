import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendor splits — each cached independently by the browser
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/'))
              return 'vendor-react';
            if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion'))
              return 'vendor-motion';
            if (id.includes('node_modules/lucide-react'))
              return 'vendor-icons';
            if (id.includes('node_modules/canvas-confetti'))
              return 'vendor-confetti';
            if (id.includes('node_modules/@google'))
              return 'vendor-ai'; // future AI features, isolated
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
  };
});
