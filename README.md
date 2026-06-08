# Thuna.Care — marketing site

Modern marketing landing page for **Thuna.Care** — continuous, at-home preventive
health monitoring for Indian families. Built with [Astro](https://astro.build)
(static output) and deployed to GitHub Pages.

**Live:** https://www.thuna.in (custom domain via GitHub Pages; `base: '/'`).
Until the founder's DNS at Hostinger propagates, it also serves at
https://thunacare-alt.github.io/thuna-site/ which then redirects to the domain.

## Stack
- Astro (static), no runtime JS framework — a single long landing page.
- Editorial serif (Fraunces) + Inter, deep-green `#1B4332` brand on white/cream.
- Cinematic hero video (`public/hero.mp4`, web-optimized H.264 CRF 23 + faststart,
  with a vertical cut `public/hero-mobile.mp4` for phones and a poster frame).

## Develop
```bash
npm install
npm run dev        # http://localhost:4321/thuna-site/
npm run build      # -> dist/
npm run preview
```

## Deploy
Pushing to `main` triggers `.github/workflows/deploy.yml`
(`withastro/action@v3` → `actions/deploy-pages@v4`). GitHub Pages source is set to
**GitHub Actions** (build_type: workflow).

## Pointing the real domain (thuna.in) at this site — DNS step for the founder
This is **not** done here; it's a DNS change the founder makes when ready:

1. In repo **Settings → Pages → Custom domain**, enter `thuna.in` (this commits a
   `public/CNAME` file containing `thuna.in`).
2. At the DNS registrar for `thuna.in`, add records pointing at GitHub Pages:
   - Apex `thuna.in`: four `A` records → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153` (and/or `AAAA` records for IPv6).
   - `www.thuna.in`: a `CNAME` → `thunacare-alt.github.io`.
3. In `astro.config.mjs`, change `site` to `https://thuna.in` and `base` to `/`
   (then the relative asset paths resolve from the domain root), and update the
   canonical/OG URLs in `src/layouts/Layout.astro`. Re-deploy.

Until then the site lives at the project Pages URL above.
