# Test report

Date: 2026-10-25. Environment: Fedora Linux, Node.js 22.23.1, Google Chrome 150 (Playwright channel `chrome`, software WebGL), and GitHub Actions (`ubuntu-latest`) for CI. **Everything below was actually executed**; items not executed are listed at the end.

## Summary

| Suite | Command | Result |
|---|---|---|
| Type check (strict) | `npx astro check` | 0 errors, 0 warnings |
| Unit + scientific validation | `npm test` (Vitest) | **82 / 82 passed** |
| End-to-end + accessibility | `npx playwright test` (desktop 1366×900 + Pixel 7 mobile) | **114 passed**, 0 failed (88 skipped by design: page-by-page and axe checks run on desktop only, mobile-only checks on mobile only) |
| CI on GitHub Actions | `ci.yml` (type check, unit, build, e2e) | Passed (run 40238672192) |
| Production smoke test | sitemap crawl + browser checks on https://anis00.github.io/eclipse-tunisia-2027/ | 78/78 URLs HTTP 200, map/calculator/Arabic/mobile OK, no console error |
| Dependency audit | `npm audit --omit=dev` | 0 vulnerabilities |

## Scientific tests (tests/unit)

- `nasa-validation.test.ts` — 31 NASA table rows (08:40–09:40 UT): central duration within 1 s (observed max 0.17 s), Sun altitude/azimuth within 1°, Moon/Sun ratio within 0.0011, time of maximum within 1 min; north and south limits within 0.6 km (observed max 0.56 km at 08:40, 0.22 km over Tunisia).
- `cross-check.test.ts` — 12 points (central line, Sfax, Gafsa, Gabès, Kairouan, Tozeur, Djerba, Sousse, Tunis, Bizerte, Tataouine, Kébili) against Astronomy Engine with the same ΔT: C1, C4, maximum within 5 s (observed ≤ 2.5 s); Sun altitude within 0.3°; C2/C3 within 8 s for points > 20 km inside the path; obscuration within 0.002 for partial points.
- `engine.test.ts` — geometry helpers (obscuration of disks, Sun position, time conversion), Sfax total / Tunis partial / no eclipse at Cape Town, contact ordering, inside/outside consistency of the limit distance, display never showing 100 % or 1.000 for a partial eclipse, duration formatting in 3 languages.

Full tables: [VALIDATION.md](VALIDATION.md).

## Functional tests (tests/e2e)

| Requirement | Test | Result |
|---|---|---|
| Navigation, all pages, 3 languages | every sitemap URL renders (status 200, `lang`, `dir`, one `h1`, title, description, canonical, hreflang, OG image, no console error) | ✓ 75 pages + map pages separately |
| RTL Arabic | `dir="rtl"` on all `/ar/` pages; no horizontal overflow on mobile for 11 pages incl. Arabic | ✓ (a real overflow bug in the Arabic calculator on mobile was found and fixed) |
| Countdown | number of days > 0 | ✓ |
| Language switcher | keeps the page | ✓ |
| Town search | map search "Kairouan" → 2 min 41 s | ✓ |
| Point on the map | click → results for the clicked point, URL updated | ✓ |
| Manual coordinates | near-limit warning for 35.70, 10.60 | ✓ |
| Invalid input | error messages (Arabic), `aria-invalid` | ✓ |
| Geolocation granted / denied | Gafsa coordinates → totality; denied → explanatory message | ✓ |
| Outside the path | Tunis: "totality NOT visible", no C2/C3, distance to the path | ✓ |
| Simulation | play / pause / reset | ✓ |
| Network errors | basemap blocked → message, eclipse layers and search still work | ✓ |
| Links | all internal links in all pages resolve | ✓ |
| SEO metadata | unique titles and descriptions across 78 pages | ✓ |
| Accessibility | axe-core WCAG 2.0/2.1/2.2 A+AA on 11 representative pages (incl. Arabic, map) | ✓ 0 violations after fixes (logo link name, focusable scrollable tables, map preview link, attribution links) |
| Sub-path deployment | build with `BASE_PATH=/eclipse-tunisia-2027`: 3,763 internal links checked | ✓ 0 broken |

## Performance (Lighthouse 12, mobile profile, local preview without compression)

| Page | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Weight |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| /en/ | 100 | 100 | 100 | 100 | 1.2 s | 10 ms | 0 | 52 KB |
| /ar/calculator/ | 100 | 100 | 100 | 100 | 1.2 s | 20 ms | 0 | 22 KB |
| /fr/guide/ | 100 | 100 | 100 | 100 | 0.9 s | 0 ms | 0 | 14 KB |
| /en/map/ | 69 | 100 | 100 | 100 | 1.1 s | 2.8 s | 0.04 | ~1.3 MB (uncompressed) |

The map page's blocking time comes from MapLibre GL JS initialisation, amplified by the software WebGL used in headless Chrome; it is loaded after the content is interactive. To be re-measured on real phones.

## Not executed / remaining

- Manual tests on physical devices (iOS Safari, Android Chrome, tablets) and on Firefox/Safari desktop — only Chrome (desktop + Pixel 7 emulation) was automated.
- Screen-reader testing (NVDA/VoiceOver) — only automated axe checks were run.
- Load testing of the hosting during the eclipse peak (static hosting; OpenFreeMap availability not guaranteed).
- Review of the Arabic and French texts by native-speaking proofreaders, and of the safety texts by a local institution (recommended).
- Lighthouse on the production URL (GitHub Pages serves compressed files; local values are conservative).
