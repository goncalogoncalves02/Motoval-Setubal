# Repository Guidelines

## Project Structure & Module Organization

The deployable application lives in `motoval-setubal/`. React source is under `motoval-setubal/src/`: route-level views belong in `pages/`, reusable elements in `components/`, shared state in `contexts/`, browser behavior in `hooks/`, and pure helpers in `lib/`. Business copy and site metadata live in `src/data/`. Put bundled images in `src/assets/`; place files that must retain their public URL in `public/`. Lightweight regression checks are in `scripts/check-*.mjs`. Build output goes to `dist/` and must not be committed.

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
```

Run all four check scripts before submitting changes that touch helpers, filters, pricing, URLs, or structured data.

## Coding Style & Naming Conventions

Use ES modules, JSX, two-space indentation, and the style already present in the file you edit. Name React components and their files in PascalCase (`ProductCard.jsx`), hooks with a `use` prefix (`useSwipe.js`), and utilities in camelCase. Keep route components in `pages/` and extract reusable UI into focused components. ESLint enforces recommended JavaScript, React Hooks, and Vite Fast Refresh rules; resolve warnings rather than disabling rules casually.

## Testing Guidelines

The project currently uses dependency-free Node check scripts rather than a test framework or coverage threshold. Add focused assertions to the matching `scripts/check-*.mjs` file when changing a pure helper. Name new scripts `check-<area>.mjs`, make failures exit nonzero, and run `npm run lint`, all relevant checks, and `npm run build` before opening a pull request. Manually exercise affected routes and responsive layouts in the browser.

## Commit & Pull Request Guidelines

Recent history follows scoped Conventional Commits, such as `feat(ofertas): ...`, `fix(seo): ...`, and `refactor(ofertas): ...`. Keep commits focused and use an imperative summary. Pull requests should explain the user-visible change, list verification performed, link relevant issues, and include before/after screenshots for visual work. Call out configuration, schema, routing, or SEO changes explicitly.

## Security & Configuration

Copy `.env.example` to `.env` for local Supabase settings. Never commit `.env` files, service-role keys, or production secrets; only `VITE_` values intended for browser exposure belong in client configuration.
