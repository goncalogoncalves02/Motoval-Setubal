# Catálogo de Pneus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar integralmente a área “Ofertas” para um catálogo “Pneus” em `/pneus`, preservando os URLs antigos com redirects permanentes e atualizando conteúdo, SEO e nomes técnicos.

**Architecture:** Manter os componentes e dados de produtos atuais, alterando apenas a taxonomia e as rotas que os expõem. Centralizar os redirects de produção em `netlify.toml`, manter redirects client-side no React Router para desenvolvimento e proteger a migração com checks Node sem dependências.

**Tech Stack:** React 19, React Router 7, Vite/Rolldown, Netlify redirects, Node.js ES modules, JSON-LD.

## Global Constraints

- A listagem pública deve usar `/pneus`; o detalhe deve usar `/pneus/:slug`.
- `/ofertas` e `/ofertas/*` devem responder com redirects permanentes, preservando slug e query string.
- O catálogo deve ser apresentado como `Pneus` e `Pneus Novos e Usados`, sem linguagem pública de “ofertas especiais”.
- O layout, filtros, paginação, cartões, Supabase, preços, slugs e WhatsApp não mudam.
- `public/robots.txt` permanece inalterado e continua a apontar para `https://motovalsetubal.com/sitemap.xml`.
- Não adicionar dependências.
- Não abrir PR nem fazer merge.

---

### Task 1: Atualizar a fonte SEO do catálogo

**Files:**
- Modify: `motoval-setubal/scripts/check-seo.mjs`
- Modify: `motoval-setubal/src/data/site.js`
- Modify: `motoval-setubal/src/lib/seo/schema.js`

**Interfaces:**
- Consumes: `site.routes` e `itemListSchema(products, site)`.
- Produces: rota estática `/pneus` para o sitemap e JSON-LD `ItemList` com URL `/pneus`.

- [ ] **Step 1: Escrever checks SEO que falham**

Em `scripts/check-seo.mjs`, adicionar `itemListSchema` ao import de `schema.js`:

```js
import {
  localBusinessSchema,
  websiteSchema,
  faqSchema,
  breadcrumbSchema,
  productSchema,
  itemListSchema,
} from '../src/lib/seo/schema.js'
```

Depois dos checks de `productSchema`, adicionar:

```js
const pneusRoute = site.routes.find((route) => route.path === '/pneus')
check('sitemap source includes /pneus', pneusRoute?.changefreq === 'daily' && pneusRoute?.priority === '0.9')
check('sitemap source excludes /ofertas', !site.routes.some((route) => route.path === '/ofertas'))

const pneusList = itemListSchema(
  [{ id: 1, title: 'Pneu 205/55 R16', price_amount: 50, condition: 'Usados', images: [] }],
  site
)
check('item list uses Pneus name', pneusList.name === 'Pneus Novos e Usados - Motoval Setúbal')
check('item list uses /pneus URL', pneusList.url === 'https://motovalsetubal.com/pneus')
```

- [ ] **Step 2: Executar o check e confirmar o estado vermelho**

Run:

```bash
cd motoval-setubal
node scripts/check-seo.mjs
```

Expected: FAIL para `sitemap source includes /pneus`, `sitemap source excludes /ofertas`, `item list uses Pneus name` e `item list uses /pneus URL`.

- [ ] **Step 3: Alterar as fontes SEO mínimas**

Em `src/data/site.js`, substituir:

```js
{ path: '/ofertas', changefreq: 'daily', priority: '0.9' },
```

por:

```js
{ path: '/pneus', changefreq: 'daily', priority: '0.9' },
```

Em `src/lib/seo/schema.js`, deixar `itemListSchema` com:

```js
export function itemListSchema(products, site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Pneus Novos e Usados - Motoval Setúbal',
    url: `${site.siteUrl}/pneus`,
    numberOfItems: products.length,
    itemListElement: products.map((product, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: productSchema(product),
    })),
  }
}
```

- [ ] **Step 4: Executar o check e confirmar o estado verde**

Run:

```bash
node scripts/check-seo.mjs
```

Expected: `SEO schema checks passed`.

- [ ] **Step 5: Fazer commit do incremento**

```bash
git add motoval-setubal/scripts/check-seo.mjs motoval-setubal/src/data/site.js motoval-setubal/src/lib/seo/schema.js
git commit -m "fix(seo): migrar catálogo para pneus"
```

---

### Task 2: Migrar rotas e redirects preservando compatibilidade

**Files:**
- Create: `motoval-setubal/scripts/check-pneus-route.mjs`
- Modify: `motoval-setubal/src/App.jsx`
- Modify: `motoval-setubal/src/pages/OfertasPage.jsx`
- Modify: `motoval-setubal/src/pages/ProductDetailPage.jsx`
- Modify: `motoval-setubal/src/components/products/ProductCard.jsx`
- Modify: `motoval-setubal/netlify.toml`
- Delete: `motoval-setubal/public/_redirects`
- Verify unchanged: `motoval-setubal/public/robots.txt`

**Interfaces:**
- Consumes: os slugs devolvidos por `productSlug(product)` e o sitemap gerado a partir de `site.routes`.
- Produces: rotas públicas `/pneus` e `/pneus/:slug`; `LegacyPneusRedirect` para compatibilidade local; redirects Netlify 301.

- [ ] **Step 1: Criar o check de rotas em estado vermelho**

Criar `scripts/check-pneus-route.mjs` com:

```js
import { existsSync, readFileSync } from 'node:fs'

let failures = 0
function check(label, condition) {
  if (!condition) {
    console.error('FAIL:', label)
    failures++
  }
}

const read = (relativePath) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')

const app = read('../src/App.jsx')
const listPage = read('../src/pages/OfertasPage.jsx')
const detailPage = read('../src/pages/ProductDetailPage.jsx')
const productCard = read('../src/components/products/ProductCard.jsx')
const netlify = read('../netlify.toml')
const robots = read('../public/robots.txt')

check('React exposes /pneus', app.includes('path="pneus"'))
check('React exposes /pneus/:slug', app.includes('path="pneus/:slug"'))
check('React redirects legacy list route', app.includes('path="ofertas"') && app.includes('<LegacyPneusRedirect />'))
check('React redirects legacy detail route', app.includes('path="ofertas/:slug"'))
check('list canonical uses /pneus', listPage.includes('path="/pneus"') && !listPage.includes('path="/ofertas"'))
check('detail URLs use /pneus', detailPage.includes('path={`/pneus/${slugForProduct}`}') && !detailPage.includes('/ofertas'))
check('cards link to /pneus', productCard.includes('to={`/pneus/${productSlug(product)}`}'))

const listRedirect = netlify.indexOf('from = "/ofertas"')
const detailRedirect = netlify.indexOf('from = "/ofertas/*"')
const spaRewrite = netlify.indexOf('from = "/*"')
check('Netlify redirects legacy list', listRedirect >= 0 && netlify.includes('to = "/pneus"'))
check('Netlify preserves legacy slug', detailRedirect >= 0 && netlify.includes('to = "/pneus/:splat"'))
check(
  'Netlify orders redirects before SPA rewrite',
  listRedirect >= 0 && detailRedirect > listRedirect && spaRewrite > detailRedirect
)
check('legacy _redirects file removed', !existsSync(new URL('../public/_redirects', import.meta.url)))
check(
  'robots points to generated sitemap',
  robots.includes('Sitemap: https://motovalsetubal.com/sitemap.xml')
)

if (failures) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}
console.log('Pneus route checks passed')
```

- [ ] **Step 2: Executar o novo check e confirmar o estado vermelho**

Run:

```bash
node scripts/check-pneus-route.mjs
```

Expected: FAIL nos checks de rotas, canonical, cartões, redirects e remoção de `_redirects`; o check do `robots.txt` deve passar.

- [ ] **Step 3: Implementar as rotas React e compatibilidade local**

Em `src/App.jsx`, importar `Navigate`, `useLocation` e `useParams`, criar o redirect e substituir o bloco das rotas de catálogo:

```jsx
import { BrowserRouter, Navigate, Routes, Route, useLocation, useParams } from 'react-router-dom';

function LegacyPneusRedirect() {
  const { slug } = useParams();
  const { search } = useLocation();
  const destination = slug ? `/pneus/${slug}` : '/pneus';

  return <Navigate to={`${destination}${search}`} replace />;
}
```

```jsx
<Route path="pneus" element={<OfertasPage />} />
<Route path="pneus/:slug" element={<ProductDetailPage />} />
<Route path="ofertas" element={<LegacyPneusRedirect />} />
<Route path="ofertas/:slug" element={<LegacyPneusRedirect />} />
```

Em `src/pages/OfertasPage.jsx`, mudar apenas o canonical:

```jsx
path="/pneus"
```

Em `src/components/products/ProductCard.jsx`, mudar o destino:

```jsx
to={`/pneus/${productSlug(product)}`}
```

Em `src/pages/ProductDetailPage.jsx`, substituir todos os destinos e paths `/ofertas` por `/pneus`, incluindo canonical, breadcrumb e links. Manter temporariamente nesta task o texto `Ofertas`, que será migrado na Task 3.

- [ ] **Step 4: Consolidar os redirects no Netlify**

Em `netlify.toml`, substituir o bloco de redirects existente por:

```toml
# Preserva os URLs antigos do catálogo com redirects permanentes
[[redirects]]
  from = "/ofertas"
  to = "/pneus"
  status = 301

[[redirects]]
  from = "/ofertas/*"
  to = "/pneus/:splat"
  status = 301

# Redireciona todas as rotas restantes para a SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Remover `public/_redirects` com `apply_patch`; não alterar `public/robots.txt`.

- [ ] **Step 5: Executar o check e confirmar o estado verde**

Run:

```bash
node scripts/check-pneus-route.mjs
node scripts/check-seo.mjs
```

Expected: `Pneus route checks passed` e `SEO schema checks passed`.

- [ ] **Step 6: Fazer commit do incremento**

```bash
git add motoval-setubal/scripts/check-pneus-route.mjs motoval-setubal/src/App.jsx motoval-setubal/src/pages/OfertasPage.jsx motoval-setubal/src/pages/ProductDetailPage.jsx motoval-setubal/src/components/products/ProductCard.jsx motoval-setubal/netlify.toml motoval-setubal/public/_redirects
git commit -m "feat(pneus): migrar rotas com redirects permanentes"
```

---

### Task 3: Migrar conteúdo público e nomes técnicos

**Files:**
- Modify: `motoval-setubal/scripts/check-pneus-route.mjs`
- Move: `motoval-setubal/src/pages/OfertasPage.jsx` → `motoval-setubal/src/pages/PneusPage.jsx`
- Move: `motoval-setubal/src/components/OfertasTeaser.jsx` → `motoval-setubal/src/components/PneusTeaser.jsx`
- Modify: `motoval-setubal/src/App.jsx`
- Modify: `motoval-setubal/src/pages/HomePage.jsx`
- Modify: `motoval-setubal/src/pages/PneusPage.jsx`
- Modify: `motoval-setubal/src/pages/ProductDetailPage.jsx`
- Modify: `motoval-setubal/src/components/PneusTeaser.jsx`
- Modify: `motoval-setubal/src/components/Navbar.jsx`
- Modify: `motoval-setubal/src/components/Footer.jsx`
- Modify: `motoval-setubal/src/components/Hero.jsx`
- Modify: `motoval-setubal/src/data/content.js`
- Modify: `motoval-setubal/src/pages/AdminPage.jsx`

**Interfaces:**
- Consumes: `pneusTeaser` de `src/data/content.js`.
- Produces: `PneusPage`, `PneusTeaser` e toda a nomenclatura pública “Pneus”.

- [ ] **Step 1: Expandir o check com requisitos de conteúdo e nomes**

No topo de `scripts/check-pneus-route.mjs`, depois da declaração de `robots`, adicionar:

```js
const pneusPageUrl = new URL('../src/pages/PneusPage.jsx', import.meta.url)
const oldPageUrl = new URL('../src/pages/OfertasPage.jsx', import.meta.url)
const pneusTeaserUrl = new URL('../src/components/PneusTeaser.jsx', import.meta.url)
const oldTeaserUrl = new URL('../src/components/OfertasTeaser.jsx', import.meta.url)

check('PneusPage exists', existsSync(pneusPageUrl))
check('OfertasPage was removed', !existsSync(oldPageUrl))
check('PneusTeaser exists', existsSync(pneusTeaserUrl))
check('OfertasTeaser was removed', !existsSync(oldTeaserUrl))

if (existsSync(pneusPageUrl) && existsSync(pneusTeaserUrl)) {
  const pneusPage = read('../src/pages/PneusPage.jsx')
  const pneusTeaser = read('../src/components/PneusTeaser.jsx')
  const navbar = read('../src/components/Navbar.jsx')
  const footer = read('../src/components/Footer.jsx')
  const hero = read('../src/components/Hero.jsx')
  const content = read('../src/data/content.js')
  const home = read('../src/pages/HomePage.jsx')
  const admin = read('../src/pages/AdminPage.jsx')

  check('page exports PneusPage', pneusPage.includes('export default function PneusPage()'))
  check('page H1 uses Pneus', pneusPage.includes('title="Pneus Novos e Usados"'))
  check('page empty state uses Pneus', pneusPage.includes('Brevemente novos pneus disponíveis'))
  check('page title uses Palmela', pneusPage.includes("'Pneus Novos e Usados em Palmela | Motoval Setúbal'"))
  check('navbar uses Pneus', navbar.includes('{ label: "Pneus", href: "/pneus" }'))
  check('footer uses Pneus link', footer.includes('to="/pneus"') && footer.includes('Pneus'))
  check('teaser consumes pneusTeaser', pneusTeaser.includes('pneusTeaser'))
  check('teaser content source renamed', content.includes('export const pneusTeaser'))
  check('teaser content uses Pneus CTA', content.includes('cta: "Ver Todos os Pneus"'))
  check('home imports PneusTeaser', home.includes("import PneusTeaser from '../components/PneusTeaser'"))
  check('hero targets pneus teaser', hero.includes('#pneus-teaser'))
  check('admin section uses Pneus', admin.includes('className="text-white font-semibold text-lg">Pneus</h2>'))
  check('detail copy uses Pneus', detailPage.includes('Voltar aos Pneus') && detailPage.includes('Ver Pneus'))
}
```

Atualizar a leitura inicial da página para tolerar a futura mudança de nome:

```js
const listPage = existsSync(new URL('../src/pages/PneusPage.jsx', import.meta.url))
  ? read('../src/pages/PneusPage.jsx')
  : read('../src/pages/OfertasPage.jsx')
```

- [ ] **Step 2: Executar o check e confirmar o estado vermelho**

Run:

```bash
node scripts/check-pneus-route.mjs
```

Expected: FAIL nos checks de nomes de ficheiro, conteúdo, navegação, teaser, admin e detalhe.

- [ ] **Step 3: Renomear ficheiros e imports com `apply_patch`**

Usar os moves do `apply_patch`:

```text
*** Update File: motoval-setubal/src/pages/OfertasPage.jsx
*** Move to: motoval-setubal/src/pages/PneusPage.jsx
```

```text
*** Update File: motoval-setubal/src/components/OfertasTeaser.jsx
*** Move to: motoval-setubal/src/components/PneusTeaser.jsx
```

Aplicar estes imports/usos:

```jsx
// App.jsx
import PneusPage from './pages/PneusPage';
<Route path="pneus" element={<PneusPage />} />
```

```jsx
// HomePage.jsx
import PneusTeaser from '../components/PneusTeaser';
<PneusTeaser />
```

```jsx
// PneusTeaser.jsx
import { pneusTeaser } from '../data/content'
const PneusTeaser = () => (
  <section id="pneus-teaser" className="bg-[#0A0A0A] py-8 sm:py-10">
```

Substituir todos os acessos `ofertasTeaser.*` por `pneusTeaser.*` e exportar:

```jsx
export default PneusTeaser
```

- [ ] **Step 4: Aplicar a nova nomenclatura e copy**

Em `src/data/content.js`, usar:

```js
export const pneusTeaser = {
  badge: "Para Carros e Motos",
  title: "Pneus Novos e Usados",
  subtitle: "Pneus a preços acessíveis — carros e motos. Stock limitado, atualizado regularmente.",
  cta: "Ver Todos os Pneus",
  href: "/pneus"
};
```

Em `src/pages/PneusPage.jsx`, usar:

```js
export default function PneusPage() {
```

```js
const pageTitle = !loading && totalCount > 0
  ? currentPage > 1
    ? `Pneus Novos e Usados — Página ${currentPage} | Motoval Setúbal`
    : `${totalCount} Pneus Novos e Usados | Motoval Setúbal`
  : 'Pneus Novos e Usados em Palmela | Motoval Setúbal'
```

```jsx
<SectionTitle
  title="Pneus Novos e Usados"
  subtitle="Pneus a preços acessíveis. Stock limitado, contacta-nos para mais informações."
/>
```

```jsx
<h2 className="text-white text-xl font-semibold mb-2">Brevemente novos pneus disponíveis</h2>
```

Em `src/pages/ProductDetailPage.jsx`, usar as frases:

```jsx
description="Este artigo já não está disponível. Consulta os nossos pneus disponíveis em Palmela."
```

```jsx
Pode já ter sido vendido ou removido. Consulta os nossos pneus disponíveis.
```

```jsx
Ver Pneus
```

```js
{ name: 'Pneus', path: '/pneus' },
```

```jsx
Voltar aos Pneus
```

Em `Navbar.jsx`:

```js
{ label: "Pneus", href: "/pneus" },
```

Em `Footer.jsx`, usar `to="/pneus"` e texto `Pneus`.

Em `Hero.jsx`, usar:

```js
const element = document.querySelector("#pneus-teaser");
```

Em `AdminPage.jsx`, usar:

```jsx
<h2 className="text-white font-semibold text-lg">Pneus</h2>
```

- [ ] **Step 5: Executar checks focados e corrigir apenas divergências da especificação**

Run:

```bash
node scripts/check-pneus-route.mjs
node scripts/check-seo.mjs
```

Expected: `Pneus route checks passed` e `SEO schema checks passed`.

- [ ] **Step 6: Executar a gate completa**

Run:

```bash
npm run lint
node scripts/check-price.mjs
node scripts/check-slug.mjs
node scripts/check-seo.mjs
node scripts/check-postgrest-filter.mjs
node scripts/check-pneus-route.mjs
npm run build
```

Expected: todos os comandos terminam com exit code 0.

Do root do repositório, executar:

```bash
rg -n '/ofertas|Ofertas|ofertas' motoval-setubal/src motoval-setubal/public motoval-setubal/netlify.toml
rg -n '<loc>.*(pneus|ofertas)' motoval-setubal/dist/sitemap.xml
git diff --check
```

Expected:

- a primeira pesquisa encontra `/ofertas` apenas nas rotas de compatibilidade de `App.jsx` e nos redirects 301 de `netlify.toml`;
- o sitemap contém `https://motovalsetubal.com/pneus` e não contém `/ofertas`;
- `git diff --check` não produz output.

- [ ] **Step 7: Fazer commit do incremento**

```bash
git add motoval-setubal
git commit -m "refactor(pneus): atualizar conteúdo e nomes internos"
```

