# Ofertas Page Improvements — Design Spec

**Date:** 2026-07-01
**Project:** Motoval Setúbal (Vite + React 19 SPA, app in `motoval-setubal/`)
**Approach:** fixed-height cards via `line-clamp` + a dedicated `/ofertas/:slug` product detail page (own route, own SEO/JSON-LD), following the existing single-source-of-truth SEO architecture.

## Problem

The `/ofertas` listing page (`src/pages/OfertasPage.jsx`) has three issues:

1. **Pagination** — already implemented correctly (`PAGE_SIZE = 9`, `Pagination` component, Supabase `.range()`). Confirmed with the user: no changes needed here.
2. **Unbounded card height** — `ProductCard`'s description renders in full (`<p>{product.description}</p>`), with no `line-clamp` or max height. A long description stretches that card (and its grid row), breaking visual consistency with neighboring cards.
3. **No way to see full details** — cards are not clickable. The only interactive element besides the image gallery/lightbox is the WhatsApp "Contactar" link. There is no product detail view and no per-product URL.

## Decisions (from brainstorming)

- Card description is truncated with `line-clamp-3`; no "read more" affordance on the card itself — the whole card becomes a link to the detail page instead.
- Full details are shown on a **dedicated route** `/ofertas/:slug`, not a modal — this gives each product a shareable, indexable URL and a per-product `Product` JSON-LD + canonical, consistent with the site's existing SEO investment (`src/lib/seo/schema.js`, `Seo.jsx`).
- URL format: `slugify(title)-{shortId}` (e.g. `/ofertas/pneu-continental-205-55-r16-a3f9c281`) — readable/keyword-rich for SEO, with an id suffix to disambiguate identical titles.
- Detail page scope: image gallery, all product fields, full untruncated description, WhatsApp CTA, breadcrumb back to `/ofertas`. No "related products" section (declined — keep it minimal).
- If a product can't be found for the given slug (deleted, deactivated, or bad URL) — show a single "not available" state with a link back to `/ofertas`. No need to distinguish these cases from each other or from network errors.

## Architecture

All paths relative to `motoval-setubal/`.

### Unit 1 — `src/lib/slug.js` (pure, new)
Exports:
- `slugify(text)` — lowercase, strip diacritics, replace non-alphanumerics with `-`, collapse/trim dashes.
- `productSlug(product)` — `` `${slugify(product.title)}-${product.id.slice(0, 8)}` ``.

Pure string functions, no dependencies. Used by both the card link (Unit 3) and the detail page lookup (Unit 4).

### Unit 2 — `src/components/products/` (extraction, no behavior change)
`ProductImageGallery` and `Lightbox` currently live inline in `OfertasPage.jsx`. They move to their own files here (e.g. `ProductImageGallery.jsx`, `Lightbox.jsx`) so `ProductDetailPage` can reuse them without duplicating ~130 lines of gallery/lightbox code. `ProductCard` also moves here, since both the listing and (indirectly, via shared field markup) the detail page need product-field rendering conventions to stay in sync.

### Unit 3 — `OfertasPage.jsx` changes
- Imports `ProductCard`, `ProductImageGallery`, `Lightbox` from `src/components/products/` instead of defining them inline.
- `ProductCard`: description gets `line-clamp-3`; the card's outer element becomes a `<Link to={`/ofertas/${productSlug(product)}`}>` wrapping the whole card. The WhatsApp anchor and the gallery's prev/next/dot/zoom controls call `e.stopPropagation()` (and `preventDefault` where needed) so they keep working without triggering navigation.
- No changes to data fetching, pagination, or the empty/skeleton states.

### Unit 4 — `src/pages/ProductDetailPage.jsx` (new)
Data flow, chosen to avoid partial/prefix matching on a UUID column (PostgREST doesn't cleanly support `LIKE` on `uuid` typed columns without an RPC):

1. On mount, read `slug` from `useParams()`.
2. Fetch a lightweight list: `supabase.from('products').select('id, title').eq('is_active', true)`.
3. Compute `productSlug({ id, title })` for each row and find the one matching the URL `slug`.
4. No match → render the "not available" state (covers sold/deactivated/deleted/mistyped-URL uniformly, per the decision above).
5. Match found → fetch the full row: `.select('*').eq('id', match.id).single()`, then render.
6. Any Supabase error at either step also renders the "not available" state (no separate error UI).

Rendering: reuses `ProductImageGallery`/`Lightbox` from Unit 2 for the images (larger gallery, e.g. full width instead of the card's fixed 208px height), then title/condition/tire size/brand/price/full description/WhatsApp CTA, plus a breadcrumb link back to `/ofertas`.

SEO: own `<Seo title=... description=... path={`/ofertas/${slug}`} jsonLd={...} />` combining `productSchema(product)` and `breadcrumbSchema([...], site)` (both already exist in `schema.js` — no schema changes needed). Title/description are derived from the product's own fields (title, price, brand/size), not the generic Ofertas copy.

### Unit 5 — `App.jsx` routing
Add `<Route path="ofertas/:slug" element={<ProductDetailPage />} />` inside the existing `<Route path="/" element={<Layout />}>` tree, alongside the current `ofertas` route — keeps Navbar/Footer via `Layout`.

## Error handling

- Slug doesn't match any active product → "not available" state (see Unit 4, step 4/6).
- Product has no images → same "sem imagem" placeholder already used by `ProductImageGallery` on the listing page.
- No new error states beyond what the existing listing page already handles (loading, empty, fetch error folded into "not available" on the detail page).

## Testing / Verification

No test runner is configured in this repo. Verification is manual + existing scripts, matching prior SEO work conventions:
- `npm run build` (production build succeeds, no import errors from the file moves)
- `node scripts/check-seo.mjs` (SEO data integrity)
- `npm run lint` (compare against the known pre-existing baseline: 3 errors + 1 warning in `AuthContext.jsx`/`AdminPage.jsx`)
- Manual click-through in the dev server: open a card → detail page renders correctly with correct URL/canonical; back to `/ofertas`; visit a slug for a non-existent/inactive product → "not available" state; confirm WhatsApp button and image gallery/lightbox controls on the card no longer navigate when clicked.

## Out of scope

- Changing pagination (confirmed already correct).
- "Related products" section on the detail page (declined).
- Any change to the admin dashboard or product data model.
