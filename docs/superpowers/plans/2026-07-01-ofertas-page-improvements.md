# Ofertas Page Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix unbounded card heights on `/ofertas` and add a dedicated, SEO-friendly `/ofertas/:slug` product detail page that cards link to.

**Architecture:** Extract the existing inline `Lightbox`/`ProductImageGallery`/`ProductCard` from `OfertasPage.jsx` into `src/components/products/`, add a `slugify`/`productSlug` utility, wrap `ProductCard` in a `react-router-dom` `<Link>` with a `line-clamp`-ed description, and build a new `ProductDetailPage` that resolves the slug against active products, reusing the extracted gallery/lightbox and the existing `productSchema`/`breadcrumbSchema` JSON-LD builders.

**Tech Stack:** React 19, React Router v7, Tailwind CSS v4 (`line-clamp-*` utility, no config file), Supabase JS, react-helmet-async via the existing `<Seo>` component.

## Global Constraints

- All user-facing copy must be in European Portuguese (pt-PT).
- Match existing Tailwind style: hardcoded arbitrary-value classes (`bg-[#0A0A0A]`, `text-[#FBE013]`, `border-[#2D2D2D]`, etc.) — there is no `tailwind.config.js`.
- No test runner is configured in this repo. Verify pure JS with plain `node` scripts following the `scripts/check-seo.mjs` pattern (a `check(label, cond)` helper, `process.exit(1)` on failure). Verify UI/route changes with `npm run lint`, `npm run build`, and manual dev-server checks.
- SEO rule: each `<head>` tag has exactly one owner. `<Seo>` (react-helmet-async) owns `title`/`description`/`canonical`/page JSON-LD. Never emit the same tag from two places.
- Reuse the existing `productSchema(product)` and `breadcrumbSchema(items, site)` builders in `src/lib/seo/schema.js` — do not redefine or duplicate schema logic.
- All commands run from `motoval-setubal/`, not the git root.
- Judge new `npm run lint` output against the known baseline: 3 pre-existing errors + 1 warning in `AuthContext.jsx`/`AdminPage.jsx` — those are not this plan's concern.

---

### Task 1: `slug.js` utility

**Files:**
- Create: `motoval-setubal/src/lib/slug.js`
- Create: `motoval-setubal/scripts/check-slug.mjs`

**Interfaces:**
- Produces: `slugify(text: string): string` — lowercase, ASCII, hyphen-separated slug (diacritics stripped).
- Produces: `productSlug(product: { id: string, title: string }): string` — `` `${slugify(product.title)}-${product.id.slice(0, 8)}` ``. Consumed by Task 3 (`ProductCard`) and Task 4 (`ProductDetailPage`).

- [ ] **Step 1: Write `src/lib/slug.js`**

```js
// Pure string helpers — no React/DOM dependencies.

export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function productSlug(product) {
  return `${slugify(product.title)}-${product.id.slice(0, 8)}`
}
```

- [ ] **Step 2: Write `scripts/check-slug.mjs`**

```js
import { slugify, productSlug } from '../src/lib/slug.js'

let failures = 0
function check(label, cond) {
  if (!cond) { console.error('FAIL:', label); failures++ }
}

check('lowercases and hyphenates', slugify('Pneu Continental 205/55 R16') === 'pneu-continental-205-55-r16')
check('strips diacritics', slugify('Alinhamento e Paralelismo Ção') === 'alinhamento-e-paralelismo-cao')
check('collapses repeated separators', slugify('Pneu -- Usado!!') === 'pneu-usado')
check('trims leading/trailing dashes', slugify('--Pneu--') === 'pneu')

const product = { id: 'a3f9c281-1234-5678-9abc-def012345678', title: 'Pneu Michelin 195/65 R15' }
check('productSlug appends 8-char id suffix', productSlug(product) === 'pneu-michelin-195-65-r15-a3f9c281')

const dup1 = { id: '11111111-aaaa-bbbb-cccc-dddddddddddd', title: 'Pneu X' }
const dup2 = { id: '22222222-aaaa-bbbb-cccc-dddddddddddd', title: 'Pneu X' }
check('same title, different id -> different slug', productSlug(dup1) !== productSlug(dup2))

if (failures) { console.error(`\n${failures} check(s) failed`); process.exit(1) }
console.log('slug checks passed')
```

- [ ] **Step 3: Run the check script and verify it fails before the implementation is correct**

This step doubles as your "does the test actually test something" check. Temporarily break the implementation (e.g. change the id slice to `.slice(0, 4)`) and confirm the script fails:

Run: `cd motoval-setubal && node scripts/check-slug.mjs`
Expected (with the deliberate `.slice(0, 4)` break): `FAIL: productSlug appends 8-char id suffix` followed by a non-zero exit.

Revert the deliberate break back to `.slice(0, 8)`.

- [ ] **Step 4: Run the check script against the correct implementation**

Run: `cd motoval-setubal && node scripts/check-slug.mjs`
Expected: `slug checks passed`, exit code 0.

- [ ] **Step 5: Commit**

```bash
cd motoval-setubal && git add src/lib/slug.js scripts/check-slug.mjs
git commit -m "feat(ofertas): add slugify/productSlug utility for product detail URLs"
```

---

### Task 2: Extract `Lightbox` and `ProductImageGallery` into `src/components/products/`

**Files:**
- Create: `motoval-setubal/src/components/products/Lightbox.jsx`
- Create: `motoval-setubal/src/components/products/ProductImageGallery.jsx`
- Modify: `motoval-setubal/src/pages/OfertasPage.jsx` (remove the inline `Lightbox` and `ProductImageGallery` definitions and their now-unused imports; import both from the new files instead)

**Interfaces:**
- Produces: `Lightbox({ images: string[], initialIndex: number, onClose: () => void })` — default export, unchanged behavior from the current inline version.
- Produces: `ProductImageGallery({ images: string[], title: string, onOpen: (index: number) => void, heightClassName?: string, roundedClassName?: string })` — default export. `heightClassName` defaults to `'h-52'` and `roundedClassName` defaults to `'rounded-t-xl'`, preserving current `OfertasPage` card behavior exactly. Task 4's `ProductDetailPage` will pass different values for a larger, fully-rounded gallery.
- Consumed by: Task 3 (`ProductCard`) and Task 4 (`ProductDetailPage`).

- [ ] **Step 1: Create `src/components/products/Lightbox.jsx`**

Move the existing `Lightbox` function (currently `src/pages/OfertasPage.jsx` lines 16-81) verbatim into its own file:

```jsx
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function Lightbox({ images, initialIndex, onClose }) {
  const [current, setCurrent] = useState(initialIndex)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % images.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [images.length, onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-9999 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[current]}
          alt={`Foto ${current + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />

        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-[#1A1A1A] hover:bg-[#2D2D2D] text-white rounded-full p-2 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
              className="absolute left-2 bg-black/60 hover:bg-black/90 text-white rounded-full p-2 transition-colors"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-2 bg-black/60 hover:bg-black/90 text-white rounded-full p-2 transition-colors"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
```

- [ ] **Step 2: Create `src/components/products/ProductImageGallery.jsx`**

Move the existing `ProductImageGallery` function (currently `src/pages/OfertasPage.jsx` lines 85-142), parameterizing the hardcoded `h-52` height and `rounded-t-xl` rounding, and adding `e.stopPropagation()` on the main image click (needed once `ProductCard` becomes a `<Link>` in Task 3 — without it, clicking the main photo would both open the lightbox and navigate):

```jsx
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

export default function ProductImageGallery({
  images,
  title,
  onOpen,
  heightClassName = 'h-52',
  roundedClassName = 'rounded-t-xl',
}) {
  const [current, setCurrent] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className={`w-full ${heightClassName} bg-[#1A1A1A] flex items-center justify-center ${roundedClassName}`}>
        <span className="text-[#4A4A4A] text-sm">Sem imagem</span>
      </div>
    )
  }

  return (
    <div className={`relative w-full ${heightClassName} ${roundedClassName} overflow-hidden bg-[#0A0A0A] group`}>
      <img
        src={images[current]}
        alt={`${title} - foto ${current + 1}`}
        className="w-full h-full object-cover cursor-zoom-in"
        onClick={(e) => { e.stopPropagation(); onOpen(current) }}
      />

      <div
        className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center cursor-zoom-in pointer-events-none"
      >
        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length) }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors z-10"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors z-10"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-[#FBE013]' : 'bg-white/50'}`}
                aria-label={`Ver foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Update `src/pages/OfertasPage.jsx`**

Remove the `Lightbox` function (lines 16-81), the `ProductImageGallery` function (lines 85-142), and the now-unused `createPortal` import and unused lucide icons (`ChevronLeft`, `ChevronRight`, `X`, `ZoomIn` are no longer referenced directly in this file — `MessageCircle`, `Tag`, `Ruler`, `Award` are still used by the not-yet-extracted `ProductCard`, so leave those for now). Replace the top of the file with:

```jsx
import { useEffect, useState } from 'react'
import { MessageCircle, Tag, Ruler, Award } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Seo from '../components/Seo'
import { itemListSchema } from '../lib/seo/schema'
import { site } from '../data/site'
import AnimatedSection from '../components/ui/AnimatedSection'
import SectionTitle from '../components/ui/SectionTitle'
import Pagination from '../components/ui/Pagination'
import Lightbox from '../components/products/Lightbox'
import ProductImageGallery from '../components/products/ProductImageGallery'
```

Leave the `ProductCard`, `SkeletonCard`, and `OfertasPage` functions below untouched for now (`ProductCard` still references the `Lightbox`/`ProductImageGallery` names, which now resolve via import instead of local definition).

- [ ] **Step 4: Verify**

Run: `cd motoval-setubal && npm run lint && npm run build`
Expected: lint output matches the known baseline (3 pre-existing errors + 1 warning in `AuthContext.jsx`/`AdminPage.jsx`, nothing new), build succeeds.

Run: `cd motoval-setubal && grep -c "function Lightbox\|function ProductImageGallery" src/pages/OfertasPage.jsx`
Expected: `0` (both are gone from this file, now imported).

- [ ] **Step 5: Commit**

```bash
cd motoval-setubal && git add src/components/products/Lightbox.jsx src/components/products/ProductImageGallery.jsx src/pages/OfertasPage.jsx
git commit -m "refactor(ofertas): extract Lightbox and ProductImageGallery into src/components/products/"
```

---

### Task 3: Extract `ProductCard`, make it a clickable `Link`, clamp the description

**Files:**
- Create: `motoval-setubal/src/components/products/ProductCard.jsx`
- Modify: `motoval-setubal/src/pages/OfertasPage.jsx` (remove the inline `ProductCard` definition and its now-unused imports; import it from the new file)

**Interfaces:**
- Consumes: `Lightbox` and `ProductImageGallery` default exports from Task 2 (`../components/products/Lightbox`, `./ProductImageGallery`), `productSlug` from Task 1 (`../../lib/slug`).
- Produces: `ProductCard({ product })` — default export, same prop shape as before (`product` is a full Supabase `products` row). Consumed by `OfertasPage.jsx` (unchanged call site: `<ProductCard product={product} />`).

- [ ] **Step 1: Create `src/components/products/ProductCard.jsx`**

Move the existing `ProductCard` function (currently `src/pages/OfertasPage.jsx` lines 146-214), wrapping the outer `<div>` in a `react-router-dom` `<Link>` to the product's detail page, adding `line-clamp-3` to the description, and stopping propagation on the WhatsApp link so it doesn't also trigger navigation:

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Tag, Ruler, Award } from 'lucide-react'
import ProductImageGallery from './ProductImageGallery'
import Lightbox from './Lightbox'
import { productSlug } from '../../lib/slug'

export default function ProductCard({ product }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no anúncio: "${product.title}"${product.tire_size ? ` (${product.tire_size})` : ''} pelo preço de ${product.price}. Poderia dar mais informações?`
  )

  return (
    <>
      <Link
        to={`/ofertas/${productSlug(product)}`}
        className="bg-[#141414] border border-[#2D2D2D] rounded-xl overflow-hidden hover:border-[#FBE013]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col"
      >
        <ProductImageGallery
          images={product.images}
          title={product.title}
          onOpen={(index) => setLightboxIndex(index)}
        />

        <div className="p-5 flex flex-col flex-1 gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FBE013] bg-[#FBE013]/10 px-2 py-1 rounded-full mb-2">
              <Tag className="w-3 h-3" />
              {product.condition || 'Usados'}
            </span>
            <h3 className="text-white font-semibold text-base leading-snug">{product.title}</h3>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-[#9CA3AF]">
            {product.tire_size && (
              <span className="flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" />
                {product.tire_size}
              </span>
            )}
            {product.brand && (
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                {product.brand}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-[#9CA3AF] text-sm leading-relaxed line-clamp-3">{product.description}</p>
          )}

          <div className="mt-auto pt-3 border-t border-[#2D2D2D] flex items-center justify-between">
            <span className="text-[#FBE013] font-bold text-lg">{product.price}</span>
            <a
              href={`https://wa.me/351934803632?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors min-h-[40px]"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar
            </a>
          </div>
        </div>
      </Link>

      {lightboxIndex !== null && product.images?.length > 0 && (
        <Lightbox
          images={product.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Update `src/pages/OfertasPage.jsx`**

Remove the `ProductCard` function (lines 144-214) and its now-unused imports. The top of the file becomes:

```jsx
import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Seo from '../components/Seo'
import { itemListSchema } from '../lib/seo/schema'
import { site } from '../data/site'
import AnimatedSection from '../components/ui/AnimatedSection'
import SectionTitle from '../components/ui/SectionTitle'
import Pagination from '../components/ui/Pagination'
import ProductCard from '../components/products/ProductCard'
```

(`Lightbox` and `ProductImageGallery` imports added in Task 2 are removed here too — `OfertasPage.jsx` no longer references them directly once `ProductCard` owns that composition. `MessageCircle` stays: it's still used by the empty-state "Falar connosco" button further down in the file.)

Leave `SkeletonCard` and the `OfertasPage` component (the rest of the file) untouched.

- [ ] **Step 3: Verify**

Run: `cd motoval-setubal && npm run lint && npm run build`
Expected: lint matches baseline, build succeeds.

Run: `cd motoval-setubal && grep -c "function ProductCard" src/pages/OfertasPage.jsx`
Expected: `0`.

Run: `cd motoval-setubal && grep -q "line-clamp-3" src/components/products/ProductCard.jsx && grep -q "react-router-dom" src/components/products/ProductCard.jsx && echo CARD_OK`
Expected: `CARD_OK`.

- [ ] **Step 4: Commit**

```bash
cd motoval-setubal && git add src/components/products/ProductCard.jsx src/pages/OfertasPage.jsx
git commit -m "feat(ofertas): make product cards clickable links with clamped descriptions"
```

---

### Task 4: `ProductDetailPage`

**Files:**
- Create: `motoval-setubal/src/pages/ProductDetailPage.jsx`

**Interfaces:**
- Consumes: `productSlug` (Task 1, `../lib/slug`), `ProductImageGallery` and `Lightbox` (Task 2, `../components/products/*`), `supabase` (`../lib/supabase`), `Seo` (`../components/Seo`), `productSchema`/`breadcrumbSchema` (`../lib/seo/schema`), `site` (`../data/site`), `AnimatedSection` (`../components/ui/AnimatedSection`).
- Produces: default export `ProductDetailPage()` — a route element reading `slug` via `useParams()`. Consumed by Task 5 (`App.jsx`).

- [ ] **Step 1: Write `src/pages/ProductDetailPage.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MessageCircle, Tag, Ruler, Award, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Seo from '../components/Seo'
import { productSchema, breadcrumbSchema } from '../lib/seo/schema'
import { site } from '../data/site'
import { productSlug } from '../lib/slug'
import AnimatedSection from '../components/ui/AnimatedSection'
import ProductImageGallery from '../components/products/ProductImageGallery'
import Lightbox from '../components/products/Lightbox'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [status, setStatus] = useState('loading') // 'loading' | 'found' | 'not-found'
  const [product, setProduct] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setProduct(null)

    async function fetchProduct() {
      const { data: candidates, error: listError } = await supabase
        .from('products')
        .select('id, title')
        .eq('is_active', true)

      if (cancelled) return
      if (listError || !candidates) {
        setStatus('not-found')
        return
      }

      const match = candidates.find((p) => productSlug(p) === slug)
      if (!match) {
        setStatus('not-found')
        return
      }

      const { data: full, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', match.id)
        .single()

      if (cancelled) return
      if (productError || !full) {
        setStatus('not-found')
        return
      }
      setProduct(full)
      setStatus('found')
    }

    fetchProduct()
    return () => { cancelled = true }
  }, [slug])

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-[#0A0A0A] pt-20 pb-24">
        <div className="max-w-5xl mx-auto px-5 sm:px-10 lg:px-12 pt-12 animate-pulse">
          <div className="w-full h-80 bg-[#1A1A1A] rounded-xl mb-6" />
          <div className="h-6 bg-[#2D2D2D] rounded w-1/2 mb-3" />
          <div className="h-4 bg-[#2D2D2D] rounded w-1/3" />
        </div>
      </main>
    )
  }

  if (status === 'not-found') {
    return (
      <main className="min-h-screen bg-[#0A0A0A] pt-20 pb-24">
        <Seo
          title="Artigo não disponível | Motoval Setúbal"
          description="Este artigo já não está disponível. Consulta as nossas ofertas atuais de pneus em Palmela."
          path="/ofertas"
        />
        <div className="max-w-3xl mx-auto px-5 text-center py-24">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-white text-xl font-semibold mb-2">Este artigo já não está disponível</h1>
          <p className="text-[#9CA3AF] text-sm max-w-sm mx-auto mb-6">
            Pode já ter sido vendido ou removido. Consulta as nossas ofertas atuais.
          </p>
          <Link
            to="/ofertas"
            className="inline-flex items-center gap-2 bg-[#FBE013] hover:bg-[#E5C800] text-black font-semibold px-5 py-3 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Ver Ofertas
          </Link>
        </div>
      </main>
    )
  }

  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no anúncio: "${product.title}"${product.tire_size ? ` (${product.tire_size})` : ''} pelo preço de ${product.price}. Poderia dar mais informações?`
  )
  const slugForProduct = productSlug(product)

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-20 pb-24">
      <Seo
        title={`${product.title} - ${product.price} | Motoval Setúbal`}
        description={`${product.title}${product.tire_size ? ` (${product.tire_size})` : ''} por ${product.price}. Pneus ${product.condition === 'Novos' ? 'novos' : 'usados'} em Palmela, contacta-nos via WhatsApp.`}
        path={`/ofertas/${slugForProduct}`}
        jsonLd={[
          productSchema(product),
          breadcrumbSchema(
            [
              { name: 'Início', path: '/' },
              { name: 'Ofertas', path: '/ofertas' },
              { name: product.title, path: `/ofertas/${slugForProduct}` },
            ],
            site
          ),
        ]}
      />
      <div className="max-w-5xl mx-auto px-5 sm:px-10 lg:px-12">
        <AnimatedSection animation="fadeUp" className="pt-8 pb-6">
          <Link
            to="/ofertas"
            className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#FBE013] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar às Ofertas
          </Link>
        </AnimatedSection>

        <AnimatedSection animation="fadeUp" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductImageGallery
            images={product.images}
            title={product.title}
            onOpen={(index) => setLightboxIndex(index)}
            heightClassName="h-72 sm:h-96"
            roundedClassName="rounded-xl"
          />

          <div className="flex flex-col gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FBE013] bg-[#FBE013]/10 px-2 py-1 rounded-full mb-2">
                <Tag className="w-3 h-3" />
                {product.condition || 'Usados'}
              </span>
              <h1 className="text-white font-semibold text-2xl leading-snug">{product.title}</h1>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-[#9CA3AF]">
              {product.tire_size && (
                <span className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  {product.tire_size}
                </span>
              )}
              {product.brand && (
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {product.brand}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-[#9CA3AF] text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            <div className="mt-auto pt-4 border-t border-[#2D2D2D] flex items-center justify-between">
              <span className="text-[#FBE013] font-bold text-2xl">{product.price}</span>
              <a
                href={`https://wa.me/351934803632?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                Contactar
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {lightboxIndex !== null && product.images?.length > 0 && (
        <Lightbox
          images={product.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </main>
  )
}
```

- [ ] **Step 2: Verify**

Run: `cd motoval-setubal && npm run lint && npm run build`
Expected: lint matches baseline, build succeeds (this alone catches import typos/missing exports before the route even exists).

- [ ] **Step 3: Commit**

```bash
cd motoval-setubal && git add src/pages/ProductDetailPage.jsx
git commit -m "feat(ofertas): add ProductDetailPage with per-product SEO and not-found state"
```

---

### Task 5: Wire the route and run the full verification sweep

**Files:**
- Modify: `motoval-setubal/src/App.jsx`

**Interfaces:**
- Consumes: `ProductDetailPage` default export from Task 4.

- [ ] **Step 1: Add the route in `src/App.jsx`**

Add the import alongside the other page imports:

```jsx
import ProductDetailPage from './pages/ProductDetailPage';
```

Add the route inside the existing `<Route path="/" element={<Layout />}>` block, immediately after the `ofertas` route:

```jsx
            <Route path="ofertas" element={<OfertasPage />} />
            <Route path="ofertas/:slug" element={<ProductDetailPage />} />
```

- [ ] **Step 2: Verify the route resolves — automated checks**

Run: `cd motoval-setubal && npm run lint && npm run build && node scripts/check-seo.mjs && node scripts/check-slug.mjs`
Expected: lint matches baseline, build succeeds, `SEO schema checks passed`, `slug checks passed`.

- [ ] **Step 3: Manual dev-server verification**

Run: `cd motoval-setubal && npm run dev` (leave running)

In a browser, check each of these (there must be at least one active product in Supabase — if there is none, temporarily activate one via `/admin` for this check):

1. Open `/ofertas`. Confirm cards are visually consistent in height even for products with long vs. short descriptions (long descriptions should truncate with `…` after 3 lines, not stretch the card).
2. Click anywhere on a card's body (not the WhatsApp button or image). Confirm it navigates to `/ofertas/<slug>` and the URL matches the pattern `slugified-title-<8-char-id>`.
3. On the detail page, confirm: full untruncated description is visible, image gallery/lightbox controls (prev/next/dots/zoom) still work, "Voltar às Ofertas" link returns to `/ofertas`, and the WhatsApp button opens `wa.me` with the product's title/price prefilled.
4. Back on `/ofertas`, click a card's WhatsApp button directly. Confirm it opens WhatsApp and does **not** navigate to the detail page first.
5. Click a card's image to open the lightbox. Confirm it opens the lightbox and does **not** navigate to the detail page.
6. Visit a made-up URL, e.g. `/ofertas/produto-inexistente-00000000`. Confirm the "Este artigo já não está disponível" state renders with a working "Ver Ofertas" link.
7. View page source (or `curl` the dev server) for a product detail page and confirm `<title>` and the `Product`/`BreadcrumbList` JSON-LD reflect that specific product (not the generic Ofertas copy).

Stop the dev server once all checks pass.

- [ ] **Step 4: Commit**

```bash
cd motoval-setubal && git add src/App.jsx
git commit -m "feat(ofertas): wire /ofertas/:slug product detail route"
```
