import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Ensure we pick up the API key from either .env or process.env (injected by platform)
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  
  return {
    base: './',
    plugins: [
      vue(), 
      tailwindcss(),
      // Standard configuration for Monaco Editor in Vite
      (monacoEditorPlugin as any).default({
        languageWorkers: ['editorWorkerService', 'typescript', 'json', 'html', 'css'],
      })
    ],
    define: {
      // This allows using process.env.GEMINI_API_KEY in the frontend code
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: typeof process !== 'undefined' ? process.env.DISABLE_HMR !== 'true' : true,
    },
    build: {
      // Ensure assets are handled correctly for relative paths
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            monaco: ['monaco-editor']
          }
        }
      }
    }
  };
});
