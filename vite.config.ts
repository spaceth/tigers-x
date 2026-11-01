import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const root = fileURLToPath(new URL('.', import.meta.url));

/** Serve specification/index.html at /specification, not only at /specification/. */
function specificationRoute(): Plugin {
  const rewrite = (req: IncomingMessage, _res: ServerResponse, next: () => void) => {
    const url = req.url ?? '';
    if (url === '/specification' || url.startsWith('/specification?')) {
      req.url = `/specification/${url.slice('/specification'.length)}`;
    }
    next();
  };
  return {
    name: 'specification-route',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

// The 3D stack (three, @react-three/*) is reached only through the lazy
// StageCanvas import, so it lands in its own async chunk. Avoid manualChunks:
// grouping shared modules there makes the entry chunk import it eagerly.
//
// specification/index.html is a second page so /specification is a real file
// on static hosts, not only a client-side route.
export default defineConfig({
  plugins: [react(), specificationRoute()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        specification: resolve(root, 'specification/index.html'),
      },
    },
  },
});
