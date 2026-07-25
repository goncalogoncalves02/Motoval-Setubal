# Repository Guidelines

## Project Structure & Module Organization

The deployable application lives in `motoval-setubal/`. React source is under `motoval-setubal/src/`: route-level views belong in `pages/`, reusable elements in `components/`, shared state in `contexts/`, browser behavior in `hooks/`, and pure helpers in `lib/`. Business copy and site metadata live in `src/data/`. Put bundled images in `src/assets/`; place files that must retain their public URL in `public/`. Lightweight regression checks are in `scripts/check-*.mjs`. Build output goes to `dist/` and must not be committed.

## Current Product State

The public tyre catalogue is named **Pneus**. Its canonical routes are `/pneus` and `/pneus/:slug`; do not reintroduce `/ofertas` in navigation, copy, canonicals, structured data, or the sitemap. `netlify.toml` owns permanent redirects from the legacy `/ofertas` routes and must keep legacy detail slugs intact.

Products have a required Supabase `vehicle_type` classification. The only stored values are `carro` and `mota`; the database migration is `supabase/migrations/20260723000100_add_vehicle_type_to_products.sql`. Keep the database constraint, `src/lib/vehicleType.js`, admin validation, and public labels aligned when changing this contract. The admin form must require the classification for new and edited products.

Whenever `/pneus` is opened without a valid `veiculo` query parameter, `VehicleTypePrompt` asks the visitor to choose car or motorcycle tyres and blocks interaction with the blurred page behind it. The choice pre-applies the vehicle filter. The visible **Tipo de veículo** filter must continue to support `Todos`, `Carro`, and `Mota`; selecting `Todos` intentionally writes `veiculo=todos`, shows every tyre, and prevents the prompt from reopening while that URL state is retained.

Catalogue state is URL-driven through `veiculo`, `marca`, `medida`, `condicao`, `preco`, and `pagina`. Brand, size, condition, and price options are faceted: each option list must reflect products compatible with the other active filters, and selections that become impossible must be reconciled safely. Product detail links preserve the listing query so visitors can return to the same filtered catalogue. Filtered catalogue URLs are `noindex`; the unfiltered `/pneus` route remains the SEO landing page.

## Build, Test, and Development Commands

Run commands from the application directory:

```bash
cd motoval-setubal
npm ci                 # install the locked dependency set
npm run dev            # start Vite on port 5173
npm run lint           # lint all JS and JSX with ESLint
npm run build          # create the production bundle and SEO output
npm run preview        # serve the built bundle locally
node scripts/check-price.mjs
node scripts/check-slug.mjs
node scripts/check-seo.mjs
node scripts/check-postgrest-filter.mjs
node scripts/check-pneus-route.mjs
node scripts/check-supabase-config.mjs
node scripts/check-vehicle-type.mjs
node scripts/check-faceted-filters.mjs
```

Run all eight check scripts before submitting changes that touch helpers, filters, pricing, URLs, Supabase configuration, or structured data.

## Coding Style & Naming Conventions

Use ES modules, JSX, two-space indentation, and the style already present in the file you edit. Name React components and their files in PascalCase (`ProductCard.jsx`), hooks with a `use` prefix (`useSwipe.js`), and utilities in camelCase. Keep route components in `pages/` and extract reusable UI into focused components. ESLint enforces recommended JavaScript, React Hooks, and Vite Fast Refresh rules; resolve warnings rather than disabling rules casually.

## Testing Guidelines

The project currently uses dependency-free Node check scripts rather than a test framework or coverage threshold. Add focused assertions to the matching `scripts/check-*.mjs` file when changing a pure helper. Name new scripts `check-<area>.mjs`, make failures exit nonzero, and run `npm run lint`, all relevant checks, and `npm run build` before opening a pull request. Manually exercise affected routes and responsive layouts in the browser.

## Commit & Pull Request Guidelines

Recent history follows scoped Conventional Commits, such as `feat(pneus): ...`, `fix(pneus): ...`, and `fix(seo): ...`. Keep commits focused and use an imperative summary. Use normal feature branches and pull requests for product work. Leave the final merge to the repository owner unless the user explicitly authorizes a direct `main` change or asks you to merge. Pull requests should explain the user-visible change, list verification performed, link relevant issues, and include before/after screenshots for visual work. Call out configuration, schema, routing, or SEO changes explicitly.

Internal agent planning artifacts are local-only. Do not force-add `.superpowers/`, `docs/superpowers/`, or other ignored planning documents to Git. The root `.gitignore` intentionally ignores `docs`.

## Security & Configuration

Copy `.env.example` to `.env` for local Supabase settings. Never commit `.env` files, service-role keys, or production secrets; only `VITE_` values intended for browser exposure belong in client configuration. The public app must remain renderable when Supabase browser variables are absent or empty: `src/lib/supabaseConfig.js` returns `null` in that case, and loading state must not wait for a client that does not exist.
