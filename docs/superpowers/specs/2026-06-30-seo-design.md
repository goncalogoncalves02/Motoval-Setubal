# SEO Fix & Centralization — Design Spec

**Date:** 2026-06-30
**Project:** Motoval Setúbal (Vite + React 19 SPA, app in `motoval-setubal/`)
**Approach:** A — single source of truth in JS + build-time injection into `index.html` (Vite `transformIndexHtml`) + per-page `<Seo>` component.

## Problem

SEO metadata and structured data are duplicated and drifting across `index.html` (hardcoded JSON-LD + OG) and `src/data/content.js`. Because the site is a client-rendered SPA with no SSR, social scrapers (WhatsApp, Facebook) that do not execute JS only see `index.html`, so React/Helmet-injected tags never reach them. This has produced concrete defects and a broken share image.

### Confirmed defects (must fix)
1. **Email mismatch** — canonical value is `motoval.setubal@gmail.com`. Currently: `content.js` uses `motoval.setubal@gmail.com`, `index.html` schema uses `motoval.setubal@outlook.com`, admin login placeholder uses `motovalsetubal@gmail.com`.
2. **Product condition schema bug** — `OfertasPage.jsx` compares `product.condition === 'Novo'`, but stored values are `'Novos'`/`'Usados'`, so new tyres always emit `UsedCondition`.
3. **Review count contradiction** — hero "300+ Reviews" vs schema `reviewCount: 142` vs meta "142+ avaliações". Canonical: **300+** (schema integer `300`).
4. **Alignment price contradiction** — `index.html` meta "desde 30€" vs HomePage "desde 25€" vs FAQ/schema 25€. Canonical: **25€** (front 25€, front+rear 30€).
5. **Address formatting differs** between `content.js` and schema. Normalize to one canonical form.
6. **Broken `og:image`** — pages reference `https://motovalsetubal.com/og-image.jpg`, which does not exist in `public/`. Owner will supply `/public/og-image.jpg` (1200×630). References stay; file added by owner.

## Decisions (from brainstorming)
- Scope: fix inconsistencies + centralize into single source of truth + dynamic per-page schema.
- Reviews: display "300+", schema `reviewCount`/`ratingCount` = `300`, `ratingValue` = `4.9`.
- Alignment: 25€ base.
- `og:image`: owner provides `/public/og-image.jpg`; keep references.
- Build-time sitemap generation: **in scope**.

## Architecture

All paths relative to `motoval-setubal/`.

### Unit 1 — `src/data/site.js` (source of truth)
Pure, serializable data only — **no React/lucide imports** (so `vite.config.js` can import it at build time).

Exports a `site` object containing:
- `siteUrl` (`https://motovalsetubal.com`), `ogImage` (`/og-image.jpg`)
- `name`, `legalName`/`alternateName`, `founder`
- `address` (single canonical street/locality/region/postalCode/country), `geo` (lat/lng)
- `phone` (`+351934803632`), `email` (`motoval.setubal@gmail.com`), `whatsapp` (`351934803632`)
- `sameAs` (Facebook URL)
- `openingHours` — structured array → drives both the human schedule table and `OpeningHoursSpecification`
- `reviews` — `{ ratingValue: 4.9, reviewCount: 300, testimonials: [...] }`
- `services` — name/description/price (alignment 25€), used by both marketing UI and `OfferCatalog`
- `faq` — array of `{ question, answer }` (moved here from `content.js`)
- `payment`, `areaServed`, `priceRange`, `categories`
- `routes` — list of `{ path, changefreq, priority }` for sitemap

`src/data/content.js` keeps icon-bearing/visual marketing content and re-exports / imports the shared facts (`faq`, `schedule` derived from `openingHours`, `contact` email, service prices) from `site.js`. No business fact is defined in two places.

### Unit 2 — `src/lib/seo/schema.js` (pure schema builders)
Pure functions taking `site` (and route-specific args), returning plain JSON-LD objects:
- `localBusinessSchema(site)` → `AutoRepair` w/ address, geo, openingHours, OfferCatalog, aggregateRating, reviews, sameAs, founder, contactPoint
- `websiteSchema(site)`
- `faqSchema(faqItems)` → `FAQPage`
- `breadcrumbSchema(items)` → `BreadcrumbList`
- `productSchema(product, site)` → `Product` w/ `Offer`; **maps `condition`**: `'Novos' → NewCondition`, else `UsedCondition`
- `itemListSchema(products, site)` → `ItemList` of products

Consumed by both the build plugin (Unit 3) and the React `<Seo>` component (Unit 4) so markup is generated from identical logic.

### Unit 3 — `vite-plugin-seo.js`, wired in `vite.config.js`
A local Vite plugin:
- `transformIndexHtml` (`order: 'pre'`, returns `{ html, tags }`) injects into `<head>` from `site.js` + `schema.js`:
  - default `meta description`, `og:type/title/description/url/image`, `twitter:card/title/description/image`, `theme-color`
  - JSON-LD `<script>` tags: `localBusinessSchema` + `websiteSchema` (site-wide, static, scraper-visible)
- `generateBundle`/`emitFile` writes `sitemap.xml` from `site.routes` with `lastmod` = build date.

`index.html` is reduced to charset/viewport/favicons/manifest + a fallback `<title>`; the hardcoded JSON-LD, OG, Twitter, and meta-description blocks are removed (the plugin now owns them). FAQ JSON-LD moves to the `/faq` route (Unit 5), not the global HTML.

Verify the `transformIndexHtml` return shape (`{ html, tags: HtmlTagDescriptor[] }`, `injectTo: 'head'`) against current Vite/rolldown-vite docs via Context7 before implementing (confirmed valid for v7 during design).

### Unit 4 — `src/components/Seo.jsx`
`react-helmet-async` wrapper. Props: `{ title, description, path, image?, type = 'website', jsonLd? }`. Emits `<title>`, `meta description`, `<link rel="canonical">` (`siteUrl + path`), `og:title/description/url/type/image`, `twitter:*`, and optional page-specific JSON-LD `<script>`. Replaces the per-page `<Helmet>` blocks.

### Unit 5 — Page updates
- **HomePage** — `<Seo>` defaults (business schema already static via plugin).
- **OfertasPage** — `<Seo>` + `itemListSchema`/`productSchema` (uses fixed condition mapping). Remove inline schema-building duplication.
- **FAQPage** — `<Seo>` + `faqSchema(site.faq)`.
- **ContactPage** — `<Seo>` + `breadcrumbSchema`.
- **SchedulePage** — `<Seo>` + `breadcrumbSchema` (opening hours already covered by business schema).

### Unit 6 — Admin login placeholder
Update placeholder email in `AdminPage.jsx` `LoginView` to `motoval.setubal@gmail.com` for consistency (cosmetic).

## Data flow
`site.js` → `schema.js` builders → (build) `vite-plugin-seo` injects static HTML + sitemap; (runtime) `<Seo>` injects per-page tags. One source, two render paths.

## Trade-offs / notes
- Per-page OG tags from Helmet may coexist with the static home defaults; JS-less scrapers see home defaults on internal pages (acceptable). Google renders JS and sees correct per-page tags.
- `aggregateRating.reviewCount = 300` must reflect genuine reviews (owner-confirmed) to comply with rich-results policy.
- No SSR is introduced; scope is metadata/structured-data centralization only. Per-product pages explicitly out of scope.

## Testing / verification (no test runner in project)
1. `npm run build` and `npm run lint` succeed.
2. `grep`/inspect `dist/index.html`: contains LocalBusiness + WebSite JSON-LD, OG/Twitter defaults, correct email/price/review values; **no** stale `outlook.com`/`30€`/`142`.
3. Node `JSON.parse` over each injected JSON-LD block (syntax valid) + assert key fields (`email`, `aggregateRating.reviewCount`, alignment price in OfferCatalog).
4. `dist/sitemap.xml` generated with current `lastmod` and all routes.
5. Spot-check a rendered route (dev) shows per-page title/canonical via `<Seo>`.
6. Confirm no business fact remains hardcoded in two places (`grep` for `outlook`, `142`, `30€`, second email format).

## Out of scope
Per-product routes/pages; SSR/prerendering; introducing a test framework; redesigning visual components.
