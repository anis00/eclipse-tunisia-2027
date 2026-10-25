# Project status — 2026-10-25

**Preview online: https://anis00.github.io/eclipse-tunisia-2027/** (GitHub Pages, HTTPS, deployed by GitHub Actions from https://github.com/anis00/eclipse-tunisia-2027).

## Progress

| Phase | Status |
|---|---|
| A. Audit of tools and access | Done — Node 22, git, gh (account `anis00`), Chrome, Python; no Cloudflare/Vercel access |
| 1. Scientific research and validation | Done — NASA Besselian elements and path table, cross-check with Astronomy Engine and published values |
| 2. UX/UI and visual identity | Done — logo, palette, favicon, icons, OG images (3 languages) |
| 3. Site architecture (pages A–I) | Done — home, map, calculator, simulation, guide, destinations (12), weather, science, FAQ, news, sources, about, privacy, legal |
| 4. Multilingual EN/FR/AR + RTL | Done |
| 5. Technical architecture | Done — Astro static, TypeScript strict, static GeoJSON |
| 6. GIS quality | Done — documented CRS, sources, licences, validity checks |
| 7. SEO | Done — sitemap, hreflang, canonical, structured data, robots; Search Console pending (owner) |
| 8. Performance, accessibility, security | Done — see TEST-REPORT.md |
| 9. Tests | Done — 82 unit + 114 e2e/a11y, CI |
| 10. Deployment | Preview deployed on GitHub Pages; final domain pending (owner) |
| 11. Editorial content | Done (initial version), professional proofreading recommended |
| 12. Deliverables | Code, docs, reports in the repository |

## Acceptance criteria

| # | Criterion | Status |
|---|---|---|
| 1 | Site accessible on the Internet | ✓ preview URL (final domain not yet bought) |
| 2 | Main pages work on desktop and smartphone | ✓ (automated: Chrome desktop + Pixel 7 emulation; physical devices not tested) |
| 3 | Three languages operational | ✓ |
| 4 | Map shows documented geographic data | ✓ |
| 5 | Astronomical computations validated on reference points | ✓ |
| 6 | Times correspond to the selected position | ✓ |
| 7 | Totality vs partial distinction correct | ✓ (near-limit uncertainty flagged) |
| 8 | Safety instructions present and reliable | ✓ based on NASA/AAS; institutional review recommended |
| 9 | Blocking errors fixed | ✓ none known |
| 10 | Performance and accessibility checked | ✓ (map page performance 69 in lab conditions) |
| 11 | SEO essentials in place | ✓ (indexing not yet requested) |
| 12 | Sources and licences documented | ✓ |
| 13 | Operating cost estimated | ✓ ≈ 0 €/month + domain ≈ 10–15 USD/year |
| 14 | Code and documentation delivered | ✓ |
| 15 | Limitations and human actions identified | ✓ below |

## Actions requiring the owner

1. **Domain**: decide and buy (`eclipseintunisia.com` and `eclipse2027.tn` were unregistered on 2026-10-25), then follow [DEPLOYMENT.md §C](DEPLOYMENT.md#c-connecting-the-final-domain) and set `SITE_URL` / `BASE_PATH=/`.
2. **Legal notice**: fill in publisher identity, contact e-mail and publication director (`src/content/pages/*/legal.md`, `about.md`).
3. **Search Console**: verify the domain and submit the sitemap once the final domain is live.
4. **Optional**: Cloudflare Pages for production (requires `wrangler login`); analytics (requires updating the privacy page).
5. **Proofreading**: native review of Arabic and French texts; review of the safety guide by a Tunisian institution (e.g. astronomy society, ophthalmology).
6. **Licence of the code**: `package.json` says MIT — confirm or change.
7. **Before August 2027**: follow the timeline in [MAINTENANCE.md](MAINTENANCE.md) (ΔT check, destination checks, weather news).

## Known limitations

- Lunar limb profile not modelled (limits ±1–2 km, flagged within 5 km).
- Sea-level computation; towns represented by their centre.
- Climate statistics from a reanalysis (ERA5), not station observations.
- Free background map without SLA (graceful fallback tested).
- GitHub Pages does not send custom security headers (CSP applied via meta tag).
- Map page performance limited by the WebGL map library.
