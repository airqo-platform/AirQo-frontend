import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import tsconfigPaths from 'vite-tsconfig-paths'
import sass from 'sass'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), tsconfigPaths()],
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
  build: {
    target: 'es2017',
  },
  define: {
    global: 'window',
  },
  optimizeDeps: {
    include: ['@react-pdf/renderer'],
    esbuildOptions: {
      define: { global: 'globalThis' },
      // Enable esbuild polyfill plugins
      plugins: [NodeGlobalsPolyfillPlugin({ buffer: true })],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
