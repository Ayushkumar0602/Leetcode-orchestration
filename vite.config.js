import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Target modern browsers (last ~3 years) — eliminates legacy JS polyfills
    target: ['es2020', 'chrome80', 'firefox80', 'safari14'],
    // Raise limit for known heavy vendor chunks (firebase, babel worker)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Firebase SDK
          if (id.includes('node_modules/firebase')) return 'vendor-firebase';
          // Framer Motion
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion';
          // Monaco editor
          if (id.includes('node_modules/@monaco-editor') || id.includes('node_modules/monaco-editor')) return 'vendor-monaco';
          // Spline 3D (very large)
          if (id.includes('node_modules/@splinetool')) return 'vendor-spline';
          // React flow / xyflow (system design diagram)
          if (id.includes('node_modules/@xyflow')) return 'vendor-xyflow';
          // LiveKit (audio/video)
          if (id.includes('node_modules/livekit-client')) return 'vendor-livekit';
          // Supabase
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase';
          // AWS SDK
          if (id.includes('node_modules/@aws-sdk')) return 'vendor-aws';
          // React ecosystem
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router-dom') || id.includes('node_modules/scheduler')) return 'vendor-react';
          // react-markdown + remark/rehype ecosystem
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark') || id.includes('node_modules/rehype') || id.includes('node_modules/unified')) return 'vendor-markdown';
          // react-select
          if (id.includes('node_modules/react-select')) return 'vendor-react-select';
        },
      },
    },
  },
})
