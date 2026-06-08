// @ts-check
import { defineConfig } from 'astro/config';

// Static marketing site for Thuna.Care.
// Deployed to GitHub Pages as a PROJECT site: https://thunacare-alt.github.io/thuna-site/
// In-page asset references use RELATIVE paths so they keep working if the founder
// later points thuna.in at the repo and serves from the domain root (just change `base` to '/').
export default defineConfig({
  site: 'https://thunacare-alt.github.io',
  base: '/thuna-site',
  output: 'static',
  trailingSlash: 'ignore',
  build: { assets: 'assets' },
  compressHTML: true,
});
