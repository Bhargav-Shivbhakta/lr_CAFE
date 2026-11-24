import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Content Security Policy for the hosted site: only our own scripts run; styles and fonts
 * from Google Fonts; images may come from https hosts (the café's Toast photos).
 * Added at build time only (the dev server needs inline scripts). Checked by scripts/security-check.mjs.
 */
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const csp = (): Plugin => ({
  name: 'living-room-csp',
  apply: 'build',
  transformIndexHtml: (html) => html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
});

// `npm run build` -> static site for GitHub Pages / Vercel (with CSP).
// `npm run build:preview` -> one self-contained HTML file for sharing (inline script, so no CSP).
export default defineConfig(({ mode }) => ({
  base: './',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [react(), ...(mode === 'singlefile' ? [viteSingleFile()] : [csp()])],
  build: mode === 'singlefile' ? { outDir: 'dist-preview' } : undefined,
}));
