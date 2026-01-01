/// <reference types="vite/client" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
    }),
  ],

  // Build configuration
  build: {
    outDir: 'www',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    // Capacitor needs these settings
    minify: 'terser',
    target: 'esnext',
    cssCodeSplit: false,
  },

  // Development server configuration
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow external connections for mobile testing
    cors: true,
    // Proxy configuration for API calls during development
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Server app port
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Preview server configuration
  preview: {
    port: 3000,
    host: '0.0.0.0',
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, '../../data/assets'),
    },
  },

  // Environment variables
  define: {
    // Make sure we can access process.env in the browser
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development',
    ),
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
      '@ionic/react',
      '@ionic/react-router',
      'ionicons',
    ],
    exclude: [
      // Exclude Capacitor plugins from optimization as they need to be loaded dynamically
      '@capacitor/core',
      '@capacitor/app',
      '@capacitor/haptics',
      '@capacitor/keyboard',
      '@capacitor/status-bar',
    ],
  },

  // CSS configuration
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@ionic/react/css/variables.css";`,
      },
    },
    modules: {
      localsConvention: 'camelCase',
    },
  },

  // Testing configuration (Vitest)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    css: true,
  },

  // Ensure compatibility with Capacitor
  base: './',

  // Ionic/Capacitor specific optimizations
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});
