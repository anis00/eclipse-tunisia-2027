# Deployment

The site is a set of static files (`dist/`, ≈ 1.5 MB, 80 HTML pages). Any static host works.

## Hosting comparison (free tiers, as understood on 2026-10-25 — check the providers' pages before relying on a limit)

| | GitHub Pages | Cloudflare Pages | Netlify | Vercel (Hobby) |
|---|---|---|---|---|
| Price for this site | Free (public repository) | Free | Free tier (credit-based since 2025) | Free, **non-commercial use only** |
| Bandwidth | Soft limit ~100 GB/month | Unlimited for static assets | Counted in credits | ~100 GB/month |
| Custom domain + HTTPS | Yes, free (Let's Encrypt) | Yes, free | Yes, free | Yes, free |
| Custom HTTP headers (`_headers`) | **No** (CSP via `<meta>` only) | Yes | Yes | Via `vercel.json` |
| Redirects at the edge | No | Yes (`_redirects`) | Yes | Yes |
| Privacy-friendly analytics | — | Web Analytics (free, cookieless) | Paid | Paid |
| Deployment | GitHub Actions (included: `.github/workflows/deploy.yml`) | Git integration or `wrangler pages deploy dist` | Git integration | Git integration |
| Access needed | GitHub account (**available**: `anis00`, authenticated with `gh`) | Cloudflare account (owner must log in) | Netlify account | Vercel account |

**Recommendation**
- **Now (preview)**: GitHub Pages — the GitHub account is already authenticated, no extra account, CI already written. URL: `https://anis00.github.io/eclipse-tunisia-2027/`. Requires a **public** repository on the free plan.
- **Production with the final domain**: Cloudflare Pages (unlimited bandwidth for an event with a traffic peak, security headers, free cookieless analytics, DNS on the same platform). Same build, `BASE_PATH=/`.

## A. GitHub Pages (project site)

1. Create the repository and push (requires the owner's approval because the code becomes public):
   ```bash
   gh repo create eclipse-tunisia-2027 --public --source=. --remote=origin --push
   ```
2. Repository variables (Settings → Secrets and variables → Actions → Variables):
   - `SITE_URL` = `https://anis00.github.io`
   - `BASE_PATH` = `/eclipse-tunisia-2027`
   ```bash
   gh variable set SITE_URL --body "https://anis00.github.io"
   gh variable set BASE_PATH --body "/eclipse-tunisia-2027"
   ```
3. Enable Pages with GitHub Actions as source:
   ```bash
   gh api -X POST repos/anis00/eclipse-tunisia-2027/pages -f build_type=workflow
   ```
4. Every push to `main` runs `deploy.yml` (tests → build → deploy). Manual run: `gh workflow run deploy.yml`.

Note: on a project site, `robots.txt` is served at `/eclipse-tunisia-2027/robots.txt`, which search engines do not read (they read the domain root). The sitemap can be submitted directly in Search Console. This disappears with a custom domain.

## B. Cloudflare Pages

```bash
npm run build                    # with SITE_URL=https://<domain> BASE_PATH=/
npx wrangler login               # owner, interactive
npx wrangler pages project create eclipse-tunisia-2027 --production-branch main
npx wrangler pages deploy dist --project-name eclipse-tunisia-2027
```
Or connect the GitHub repository in the Cloudflare dashboard (build command `npm run build`, output `dist`, environment variables `SITE_URL`, `BASE_PATH=/`, `NODE_VERSION=22`). `public/_headers` is applied automatically.

## C. Connecting the final domain

Availability checked on 2026-10-25 (RDAP/whois, read-only — **nothing was bought**): `eclipseintunisia.com` — not registered; `eclipse2027.tn` — not registered (the `.tn` registration is handled by registrars accredited by the Tunisian Internet Agency (ATI); check their eligibility rules).

1. The owner buys the domain (indicative price for a `.com`: about 10–15 USD per year; `.tn`: set by accredited registrars).
2. **GitHub Pages**: Settings → Pages → Custom domain = `eclipseintunisia.com`; DNS at the registrar:
   - `A` records for the apex: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and `AAAA` `2606:50c0:8000::153` … `8003::153`);
   - `CNAME www → anis00.github.io`;
   - tick "Enforce HTTPS" once the certificate is issued (minutes to 24 h);
   - set the variables `SITE_URL=https://eclipseintunisia.com`, `BASE_PATH=/` and re-run the deployment.
   GitHub redirects `www` ↔ apex automatically.
3. **Cloudflare Pages**: add the domain to Cloudflare (change the name servers at the registrar), then Pages → Custom domains → add `eclipseintunisia.com` and `www.eclipseintunisia.com`; HTTPS is automatic; add a redirect rule `www → apex` (301).
4. If both `.com` and `.tn` are bought: choose one canonical domain and redirect the other (301) to it.

## D. After going live

- **Google Search Console**: add the domain property (DNS TXT verification, or set `PUBLIC_GSC_VERIFICATION` for the meta-tag method), submit `https://<domain>/sitemap-index.xml`. Bing Webmaster Tools: import from Search Console.
- **Analytics (optional)**: Cloudflare Web Analytics (cookieless) or a Plausible-compatible service: set `PUBLIC_ANALYTICS_DOMAIN` and `PUBLIC_ANALYTICS_SRC` (the CSP is updated automatically at build), then update the privacy page.
- **Error monitoring**: the site has no server. Browser errors could be collected with a privacy-friendly service if needed; not enabled (no consent mechanism needed without it). Uptime: a free external monitor (e.g. UptimeRobot, Better Stack free tiers) on the home page and `/en/map/`.

## Costs

| Item | Monthly | Yearly | Notes |
|---|---|---|---|
| Hosting (GitHub Pages or Cloudflare Pages free tier) | 0 | 0 | Static site, no server |
| Background map (OpenFreeMap) | 0 | 0 | Free community service, no SLA; donations welcome |
| Domain `.com` | ~1 | ~10–15 USD | Only once bought by the owner |
| Domain `.tn` (optional) | — | registrar price | Optional second domain |
| Analytics | 0 | 0 | Cloudflare Web Analytics; Plausible would be ~9 USD/month |
| **Total** | **≈ 0–1 USD** | **≈ 10–15 USD** | Assumes free tiers remain as they are and no paid add-on |

Risk on the free map tiles during the eclipse traffic peak: if OpenFreeMap is unavailable, the map keeps showing all eclipse layers on a plain background (tested). A paid fallback (e.g. MapTiler, Stadia Maps) could be configured if needed.

## Recovery / change of provider

Everything needed is in the Git repository: source, data (`src/data`, `public/data`), generation scripts, documentation. To move: clone, `npm ci && npm run build` with the right `SITE_URL`/`BASE_PATH`, upload `dist/` to any static host, point the DNS. No database, no secret, no vendor lock-in.
