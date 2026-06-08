// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Static marketing site for Thuna.Care.
// Served at the custom domain https://www.thuna.in (GitHub Pages, source = Actions).
// In-page asset references are relative, so they resolve from the domain root.
export default defineConfig({
  site: 'https://www.thuna.in',
  base: '/',
  output: 'static',
  trailingSlash: 'ignore',
  build: { assets: 'assets' },
  compressHTML: true,
  integrations: [react()],
});
