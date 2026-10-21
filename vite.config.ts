import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The 3D stack (three, @react-three/*) is reached only through the lazy
// StageCanvas import, so it lands in its own async chunk. Avoid manualChunks:
// grouping shared modules there makes the entry chunk import it eagerly.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
  },
});
