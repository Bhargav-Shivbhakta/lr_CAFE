import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` -> normal static build for Vercel/Netlify.
// `npm run build:preview` -> one self-contained HTML file for sharing a demo.
export default defineConfig(({ mode }) => ({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [react(), ...(mode === 'singlefile' ? [viteSingleFile()] : [])],
  build: mode === 'singlefile' ? { outDir: 'dist-preview' } : undefined,
}));
