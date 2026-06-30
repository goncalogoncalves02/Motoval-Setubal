# SEO Fix & Centralization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a single JS module the source of truth for all Motoval business facts and structured data, inject SEO metadata + JSON-LD into `index.html` at build time (scraper-safe), and add a reusable per-page `<Seo>` component — fixing all known SEO inconsistencies.

**Architecture:** A pure-data `site.js` feeds pure schema-builder functions. A Vite `transformIndexHtml` plugin renders site-wide meta/JSON-LD into static HTML and emits `sitemap.xml`; a `<Seo>` React component renders per-page tags from the same builders. No SSR is added.

**Tech Stack:** React 19, Vite (`rolldown-vite@7`), `react-helmet-async@2`, Tailwind v4, Supabase. All app code lives in `motoval-setubal/`; run every command from there.

## Global Constraints

- All user-facing copy in European Portuguese (pt-PT).
- Canonical email: `motoval.setubal@gmail.com` (no other variant anywhere).
- Canonical reviews: display "300+", schema `reviewCount`/`ratingCount` = `300`, `ratingValue` = `4.9`.
- Canonical alignment price: front `25€`, front+rear `30€`; base copy says "desde 25€". Never "desde 30€".
- `og:image` = `/og-image.jpg` (owner supplies the file; do NOT create it).
- `site.js` must contain **no** React/JSX/lucide imports (it is imported by `vite.config.js` at build time).
- Site URL: `https://motovalsetubal.com`.
- Use Context7 to confirm `react-helmet-async` and Vite `transformIndexHtml` APIs before using them (per repo CLAUDE.md). `transformIndexHtml` returning `{ html, tags: HtmlTagDescriptor[] }` with `injectTo: 'head'` was confirmed valid for Vite 7 during design.
- Follow existing style: hardcoded Tailwind arbitrary-value classes, `.jsx` for components, no semicolons-optional (match surrounding file).
- Commit after each task with the shown message.

---

### Task 1: Source-of-truth data module (`site.js`)

**Files:**
- Create: `motoval-setubal/src/data/site.js`

**Interfaces:**
- Produces: `export const site` — object with keys: `siteUrl`, `ogImage`, `name`, `alternateName`, `founder`, `description`, `phoneDisplay`, `phoneE164`, `telHref`, `whatsapp`, `email`, `address` (`{ street, locality, region, postalCode, country, mapUrl, display }`), `geo` (`{ lat, lng }`), `sameAs` (string[]), `openingHours` (`{ days: string[], opens, closes }[]`), `scheduleHours` (`{ day, hours }[]`), `scheduleNote`, `reviews` (`{ ratingValue, reviewCount, bestRating, worstRating, testimonials: { text, author, rating }[] }`), `services` (`{ iconName, title, description, price, schemaName?, schemaPrice? }[]`), `faq` (`{ id, question, answer }[]`), `payment` (string[]), `areaServed` (string[]), `priceRange`, `routes` (`{ path, changefreq, priority }[]`).

- [ ] **Step 1: Create `src/data/site.js` with the full canonical data**

```js
// Pure, serializable business data — single source of truth.
// NO React / lucide / JSX imports: this file is imported by vite.config.js at build time.

export const site = {
  siteUrl: 'https://motovalsetubal.com',
  ogImage: '/og-image.jpg',

  name: 'Motoval Setúbal',
  alternateName: 'Motoval',
  founder: 'Bruno Gonçalves',
  description:
    'Especialistas em montagem e comércio de pneus para carros e motos em Palmela. Atendimento 5 estrelas com os melhores preços da região.',

  phoneDisplay: '934 803 632',
  phoneE164: '+351934803632',
  telHref: 'tel:934803632',
  whatsapp: '351934803632',
  email: 'motoval.setubal@gmail.com',

  address: {
    street: 'Quinta das Asseadas, Lote 1, EN 252',
    locality: 'Palmela',
    region: 'Setúbal',
    postalCode: '2950-019',
    country: 'PT',
    display: 'Quinta das Asseadas, Lote 1 (EN 252), 2950-019 Palmela',
    mapUrl: 'https://maps.app.goo.gl/cSbE86MjY4KjA8RJA',
  },
  geo: { lat: 38.5623069, lng: -8.8906092 },

  sameAs: ['https://www.facebook.com/motoval.setubal01'],

  // Machine-readable for OpeningHoursSpecification
  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '13:30' },
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '15:00', closes: '19:30' },
    { days: ['Saturday'], opens: '10:00', closes: '13:30' },
  ],
  // Human-readable (pt-PT) for the schedule UI
  scheduleHours: [
    { day: 'Segunda', hours: '10:00-13:30 | 15:00-19:30' },
    { day: 'Terça', hours: '10:00-13:30 | 15:00-19:30' },
    { day: 'Quarta', hours: '10:00-13:30 | 15:00-19:30' },
    { day: 'Quinta', hours: '10:00-13:30 | 15:00-19:30' },
    { day: 'Sexta', hours: '10:00-13:30 | 15:00-19:30' },
    { day: 'Sábado', hours: '10:00-13:30' },
    { day: 'Domingo', hours: 'Fechado' },
  ],
  scheduleNote:
    'Recomendamos marcação, especialmente aos sábados. Atendemos urgências conforme disponibilidade.',

  reviews: {
    ratingValue: 4.9,
    reviewCount: 300,
    bestRating: 5,
    worstRating: 1,
    testimonials: [
      {
        text: 'A Motoval é um daqueles locais que demonstra bem como o comércio tradicional tem todos os argumentos para ser uma opção de primeira linha. A simpatia e disponibilidade do Bruno só rivaliza com a perícia e conhecimento do seu trabalho.',
        author: 'Pedro E.',
        rating: 5,
      },
      {
        text: 'Totalmente satisfeito com os serviços realizados (mudança de pneus de carro e mota). O Sr. Bruno é um excelente profissional, tentando sempre solucionar as urgências.',
        author: 'Luís O.',
        rating: 5,
      },
      {
        text: 'Hoje em vésperas de ano novo e com a oficina em limpezas ainda anuiu em auxiliar e montar um pneu da minha mota. Trabalho impecável. Precisamos de mais pessoas como o Sr. Bruno.',
        author: 'Nelson T.',
        rating: 5,
      },
    ],
  },

  // iconName maps to a lucide component in content.js; schemaPrice/schemaName feed OfferCatalog.
  services: [
    { iconName: 'Car', title: 'Montagem de Pneus - Carros', description: 'Jantes de aço, alumínio, 4x4 e runflat', price: 'Desde 15€', schemaName: 'Montagem de Pneus - Carros', schemaPrice: '15' },
    { iconName: 'Bike', title: 'Montagem de Pneus - Motos', description: 'Todas as cilindradas e estilos', price: 'Desde 25€', schemaName: 'Montagem de Pneus - Motos', schemaPrice: '25' },
    { iconName: 'Gauge', title: 'Alinhamento & Paralelismo', description: 'Controlo completo da geometria', price: 'Desde 25€', schemaName: 'Alinhamento e Paralelismo', schemaPrice: '25' },
    { iconName: 'CircleDot', title: 'Equilibragem & Calibragem', description: 'Rodagem suave e segura', price: 'Apenas 5€ por roda', schemaName: 'Equilibragem e Calibragem', schemaPrice: '5' },
    { iconName: 'Wrench', title: 'Reparação de Furos', description: 'Solução rápida e duradoura', price: 'Desde 10€', schemaName: 'Reparação de Furos', schemaPrice: '10' },
    { iconName: 'ShoppingCart', title: 'Venda de Pneus', description: 'Todas as marcas | Stock permanente', price: 'Sob orçamento' },
  ],

  faq: [
    { id: 1, question: 'Preciso de marcação?', answer: 'Recomendada, especialmente aos sábados. Atendemos urgências conforme disponibilidade.' },
    { id: 2, question: 'Fazem montagem de pneus de moto?', answer: 'Sim, todos os tipos desde 25€. Trabalhamos com todas as cilindradas e estilos de motos.' },
    { id: 3, question: 'Quanto custa o alinhamento?', answer: 'Dianteiro 25€, dianteiro+traseiro 30€. Controlo completo da geometria do veículo.' },
    { id: 4, question: 'Aceitam cartão?', answer: 'Sim, crédito, débito e pagamentos NFC. Para sua comodidade aceitamos várias formas de pagamento.' },
    { id: 5, question: 'Têm pneus em stock?', answer: 'Sim, grande diversidade. Referências especiais em 2-3 dias.' },
  ],

  payment: ['Cash', 'Credit Card', 'Debit Card', 'NFC Payment'],
  areaServed: ['Palmela', 'Setúbal', 'Aires'],
  priceRange: '€-€€',

  routes: [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/ofertas', changefreq: 'daily', priority: '0.9' },
    { path: '/contacto', changefreq: 'monthly', priority: '0.7' },
    { path: '/faq', changefreq: 'monthly', priority: '0.6' },
    { path: '/horario', changefreq: 'monthly', priority: '0.5' },
  ],
}
```

- [ ] **Step 2: Verify the module loads and key facts are correct**

Run: `cd motoval-setubal && node -e "import('./src/data/site.js').then(m=>{const s=m.site;console.assert(s.email==='motoval.setubal@gmail.com','email');console.assert(s.reviews.reviewCount===300,'reviews');console.assert(s.services.find(x=>x.schemaName==='Alinhamento e Paralelismo').schemaPrice==='25','align');console.log('site.js OK')})"`
Expected: prints `site.js OK` with no assertion warnings.

- [ ] **Step 3: Commit**

```bash
git add motoval-setubal/src/data/site.js
git commit -m "feat(seo): add site.js single source of truth for business data"
```

---

### Task 2: Pure JSON-LD schema builders + verification script

**Files:**
- Create: `motoval-setubal/src/lib/seo/schema.js`
- Create: `motoval-setubal/scripts/check-seo.mjs`

**Interfaces:**
- Consumes: `site` from Task 1.
- Produces (all return plain objects / arrays of objects, no side effects):
  - `localBusinessSchema(site)` → object (`@type: 'AutoRepair'`)
  - `websiteSchema(site)` → object (`@type: 'WebSite'`)
  - `faqSchema(faqItems)` → object (`@type: 'FAQPage'`)
  - `breadcrumbSchema(items)` where `items: { name, path }[]` → object (`@type: 'BreadcrumbList'`)
  - `productSchema(product, site)` → object (`@type: 'Product'`); maps `product.condition === 'Novos'` → `NewCondition`, else `UsedCondition`
  - `itemListSchema(products, site)` → object (`@type: 'ItemList'`)

- [ ] **Step 1: Create `src/lib/seo/schema.js`**

```js
// Pure JSON-LD builders. No side effects, no DOM, no React.

export function localBusinessSchema(site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    '@id': `${site.siteUrl}/#business`,
    name: site.name,
    alternateName: site.alternateName,
    description: site.description,
    url: site.siteUrl,
    logo: `${site.siteUrl}/favicon.svg`,
    image: `${site.siteUrl}${site.ogImage}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    telephone: site.phoneE164,
    email: site.email,
    openingHoursSpecification: site.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    priceRange: site.priceRange,
    paymentAccepted: site.payment,
    currenciesAccepted: 'EUR',
    areaServed: site.areaServed.map((name) => ({ '@type': 'City', name })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços de Pneus',
      itemListElement: site.services
        .filter((s) => s.schemaPrice)
        .map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.schemaName, description: s.description },
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: s.schemaPrice,
            priceCurrency: 'EUR',
            minPrice: s.schemaPrice,
          },
        })),
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(site.reviews.ratingValue),
      bestRating: String(site.reviews.bestRating),
      worstRating: String(site.reviews.worstRating),
      reviewCount: String(site.reviews.reviewCount),
      ratingCount: String(site.reviews.reviewCount),
    },
    review: site.reviews.testimonials.map((t) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: t.author },
      reviewRating: { '@type': 'Rating', ratingValue: String(t.rating) },
      reviewBody: t.text,
    })),
    sameAs: site.sameAs,
    founder: { '@type': 'Person', name: site.founder },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phoneE164,
      contactType: 'customer service',
      availableLanguage: ['Portuguese'],
    },
  }
}

export function websiteSchema(site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.siteUrl,
    description: site.description,
    publisher: { '@type': 'Organization', name: site.name },
    inLanguage: 'pt-PT',
  }
}

export function faqSchema(faqItems) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function breadcrumbSchema(items, site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${site.siteUrl}${it.path}`,
    })),
  }
}

export function productSchema(product, site) {
  return {
    '@type': 'Product',
    name: product.title,
    description: product.description || '',
    image: product.images?.[0] || '',
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      itemCondition:
        product.condition === 'Novos'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
    },
  }
}

export function itemListSchema(products, site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ofertas de Pneus - Motoval Setúbal',
    url: `${site.siteUrl}/ofertas`,
    numberOfItems: products.length,
    itemListElement: products.map((product, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: productSchema(product, site),
    })),
  }
}
```

- [ ] **Step 2: Create `scripts/check-seo.mjs` (project's SEO test cycle)**

```js
import { site } from '../src/data/site.js'
import {
  localBusinessSchema,
  websiteSchema,
  faqSchema,
  breadcrumbSchema,
  productSchema,
} from '../src/lib/seo/schema.js'

let failures = 0
function check(label, cond) {
  if (!cond) { console.error('FAIL:', label); failures++ }
}

const biz = localBusinessSchema(site)
check('email is gmail', biz.email === 'motoval.setubal@gmail.com')
check('no outlook anywhere', !JSON.stringify(biz).includes('outlook'))
check('reviewCount 300', biz.aggregateRating.reviewCount === '300')
check('ratingValue 4.9', biz.aggregateRating.ratingValue === '4.9')
const align = biz.hasOfferCatalog.itemListElement.find(
  (o) => o.itemOffered.name === 'Alinhamento e Paralelismo'
)
check('alignment price 25', align && align.priceSpecification.price === '25')

check('website url', websiteSchema(site).url === 'https://motovalsetubal.com')
check('faq has entries', faqSchema(site.faq).mainEntity.length === site.faq.length)
check('breadcrumb builds', breadcrumbSchema([{ name: 'X', path: '/x' }], site).itemListElement[0].item === 'https://motovalsetubal.com/x')

const novo = productSchema({ title: 'T', price: '80€', condition: 'Novos', images: [] }, site)
check('Novos -> NewCondition', novo.offers.itemCondition === 'https://schema.org/NewCondition')
const usado = productSchema({ title: 'T', price: '80€', condition: 'Usados', images: [] }, site)
check('Usados -> UsedCondition', usado.offers.itemCondition === 'https://schema.org/UsedCondition')

// Every JSON-LD must be valid JSON (no undefined/circular)
for (const [name, obj] of [['biz', biz], ['website', websiteSchema(site)], ['faq', faqSchema(site.faq)]]) {
  try { JSON.parse(JSON.stringify(obj)) } catch (e) { check(`${name} serializes`, false) }
}

if (failures) { console.error(`\n${failures} check(s) failed`); process.exit(1) }
console.log('SEO schema checks passed')
```

- [ ] **Step 3: Run the check — expect failures impossible now, must pass**

Run: `cd motoval-setubal && node scripts/check-seo.mjs`
Expected: `SEO schema checks passed` and exit code 0.

- [ ] **Step 4: Commit**

```bash
git add motoval-setubal/src/lib/seo/schema.js motoval-setubal/scripts/check-seo.mjs
git commit -m "feat(seo): add pure JSON-LD schema builders and check-seo script"
```

---

### Task 3: Refactor `content.js` to consume `site.js`

**Files:**
- Modify: `motoval-setubal/src/data/content.js`

**Interfaces:**
- Consumes: `site` from Task 1.
- Produces: unchanged public exports (`hero`, `services`, `about`, `testimonials`, `schedule`, `contact`, `faq`, `footer`, `nav`, `ofertasTeaser`) so existing components keep working. `services.items[].icon` remains a lucide component; `schedule.hours`, `faq`, and the contact email now derive from `site`.

- [ ] **Step 1: Update the top of `content.js` to import site and build an icon map**

Replace the existing import line and `services` export. Keep all other exports, but change the values that duplicate business facts to read from `site`.

```js
import { Car, Bike, Gauge, CircleDot, Wrench, ShoppingCart } from 'lucide-react';
import { site } from './site';

const serviceIcons = { Car, Bike, Gauge, CircleDot, Wrench, ShoppingCart };

export const services = {
  title: "Os Nossos Serviços",
  subtitle: "Soluções completas para o seu veículo, com qualidade e preços justos",
  items: site.services.map((s, i) => ({
    id: i + 1,
    icon: serviceIcons[s.iconName],
    title: s.title,
    description: s.description,
    price: s.price,
  })),
};
```

- [ ] **Step 2: Point `schedule`, `faq`, and `contact` email at `site`**

```js
export const schedule = {
  title: "Horário de Funcionamento",
  subtitle: "Estamos aqui para o ajudar. Recomendamos marcação, especialmente aos sábados.",
  hours: site.scheduleHours,
  note: site.scheduleNote,
};

export const faq = {
  title: "Perguntas Frequentes",
  items: site.faq,
};
```

In the existing `contact.items` array, change the email item's `value` to `site.email` and its `href` to `` `mailto:${site.email}` ``. Leave the other contact items unchanged.

- [ ] **Step 3: Verify build and lint pass and email propagated**

Run: `cd motoval-setubal && npm run lint && npm run build`
Expected: lint clean, build succeeds.
Run: `cd motoval-setubal && node -e "import('./src/data/content.js').then(m=>{console.assert(m.faq.items.length===5);console.assert(m.contact.items.find(i=>i.id==='email').value==='motoval.setubal@gmail.com');console.log('content OK')})"`
Expected: `content OK`.

- [ ] **Step 4: Commit**

```bash
git add motoval-setubal/src/data/content.js
git commit -m "refactor(seo): source content.js business facts from site.js"
```

---

### Task 4: Build-time SEO plugin + index.html reduction + sitemap

**Files:**
- Create: `motoval-setubal/vite-plugin-seo.js`
- Modify: `motoval-setubal/vite.config.js`
- Modify: `motoval-setubal/index.html` (remove hardcoded JSON-LD, OG/Twitter, meta description blocks)
- Delete: `motoval-setubal/public/sitemap.xml` (now generated)

**Interfaces:**
- Consumes: `site`, `localBusinessSchema`, `websiteSchema` from Tasks 1–2.
- Produces: a default-exported `seoPlugin()` returning a Vite plugin object.

- [ ] **Step 1: Create `vite-plugin-seo.js`**

```js
import { site } from './src/data/site.js'
import { localBusinessSchema, websiteSchema } from './src/lib/seo/schema.js'

const ld = (obj) => ({
  tag: 'script',
  attrs: { type: 'application/ld+json' },
  children: JSON.stringify(obj),
  injectTo: 'head',
})

const meta = (attrs) => ({ tag: 'meta', attrs, injectTo: 'head' })

export default function seoPlugin() {
  const homeDesc =
    'Montagem de pneus para carros e motos em Palmela, Aires. Atendimento 5 estrelas com 4.9★. Alinhamento desde 25€, equilibragem 5€, reparação de furos. Ligue 934 803 632.'
  const ogImage = `${site.siteUrl}${site.ogImage}`

  return {
    name: 'motoval-seo',
    transformIndexHtml(html) {
      const tags = [
        meta({ name: 'description', content: homeDesc }),
        meta({ property: 'og:type', content: 'website' }),
        meta({ property: 'og:title', content: `${site.name} | Especialistas em Pneus para Carros e Motos` }),
        meta({ property: 'og:description', content: homeDesc }),
        meta({ property: 'og:url', content: `${site.siteUrl}/` }),
        meta({ property: 'og:image', content: ogImage }),
        meta({ name: 'twitter:card', content: 'summary_large_image' }),
        meta({ name: 'twitter:title', content: `${site.name} | Especialistas em Pneus` }),
        meta({ name: 'twitter:description', content: homeDesc }),
        meta({ name: 'twitter:image', content: ogImage }),
        ld(localBusinessSchema(site)),
        ld(websiteSchema(site)),
      ]
      return { html, tags }
    },
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      const urls = site.routes
        .map(
          (r) =>
            `  <url>\n    <loc>${site.siteUrl}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
        )
        .join('\n')
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml })
    },
  }
}
```

- [ ] **Step 2: Wire the plugin into `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import seoPlugin from './vite-plugin-seo.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoPlugin()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

- [ ] **Step 3: Reduce `index.html`**

Remove from `index.html` `<head>`: the `<meta name="description">`, all `og:*` and `twitter:*` meta tags, the `<meta name="theme-color">` duplication is fine to keep, and **all three `<script type="application/ld+json">` blocks** (LocalBusiness, FAQPage, WebSite). Keep: doctype, `<html lang>`, charset, favicons, `apple-touch-icon`, manifest, viewport, keywords/author/robots, geo meta, the `<title>`, and `theme-color`. The plugin now injects description/OG/Twitter/JSON-LD. (FAQ JSON-LD moves to the `/faq` route in Task 6.)

- [ ] **Step 4: Delete the static sitemap (now generated)**

```bash
git rm motoval-setubal/public/sitemap.xml
```

- [ ] **Step 5: Build and verify injected static SEO + generated sitemap**

Run: `cd motoval-setubal && npm run build`
Expected: build succeeds.
Run: `cd motoval-setubal && grep -c 'application/ld+json' dist/index.html && grep -c 'AutoRepair' dist/index.html && grep -c 'motoval.setubal@gmail.com' dist/index.html && grep -c 'og:image' dist/index.html && test -f dist/sitemap.xml && echo SITEMAP_OK && ! grep -q 'outlook' dist/index.html && ! grep -q '142' dist/index.html && echo NO_STALE`
Expected: counts ≥ 1 for ld+json/AutoRepair/email/og:image, `SITEMAP_OK`, and `NO_STALE` printed.

- [ ] **Step 6: Commit**

```bash
git add motoval-setubal/vite-plugin-seo.js motoval-setubal/vite.config.js motoval-setubal/index.html
git commit -m "feat(seo): inject site-wide meta/JSON-LD at build time and generate sitemap"
```

---

### Task 5: Reusable `<Seo>` component

**Files:**
- Create: `motoval-setubal/src/components/Seo.jsx`

**Interfaces:**
- Consumes: `site` from Task 1, `react-helmet-async`.
- Produces: default-exported `Seo` component. Props: `{ title, description, path = '', image, type = 'website', jsonLd }`. `jsonLd` may be a single object or an array of objects.

- [ ] **Step 1: Create `src/components/Seo.jsx`**

```jsx
import { Helmet } from 'react-helmet-async'
import { site } from '../data/site'

export default function Seo({ title, description, path = '', image, type = 'website', jsonLd }) {
  const url = `${site.siteUrl}${path}`
  const img = `${site.siteUrl}${image || site.ogImage}`
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  )
}
```

- [ ] **Step 2: Verify lint passes**

Run: `cd motoval-setubal && npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add motoval-setubal/src/components/Seo.jsx
git commit -m "feat(seo): add reusable per-page Seo component"
```

---

### Task 6: Adopt `<Seo>` across pages + fix Ofertas condition bug

**Files:**
- Modify: `motoval-setubal/src/pages/HomePage.jsx`
- Modify: `motoval-setubal/src/pages/OfertasPage.jsx`
- Modify: `motoval-setubal/src/pages/FAQPage.jsx`
- Modify: `motoval-setubal/src/pages/ContactPage.jsx`
- Modify: `motoval-setubal/src/pages/SchedulePage.jsx`

**Interfaces:**
- Consumes: `Seo` (Task 5), `faqSchema`, `breadcrumbSchema`, `itemListSchema` (Task 2), `site` (Task 1).

- [ ] **Step 1: HomePage — replace `<Helmet>` with `<Seo>`**

Remove the `import { Helmet } from 'react-helmet-async'` and the `<Helmet>…</Helmet>` block; add `import Seo from '../components/Seo'`. Render at the top of the fragment:

```jsx
<Seo
  title="Motoval Setúbal | Especialistas em Pneus para Carros e Motos em Palmela"
  description="Montagem de pneus para carros e motos em Palmela, Aires. Atendimento 5 estrelas com 4.9★. Alinhamento desde 25€, equilibragem 5€, reparação de furos. Ligue 934 803 632."
  path="/"
/>
```

- [ ] **Step 2: OfertasPage — use `<Seo>` + `itemListSchema`, delete inline schema/Helmet**

Remove `import { Helmet } from 'react-helmet-async'` and the entire inline `schemaItemList` object and the `<Helmet>` block. Add `import Seo from '../components/Seo'` and `import { itemListSchema } from '../lib/seo/schema'`. Keep `pageTitle`/`pageDescription` logic. Render (inside the returned `<main>`, replacing the old `<Helmet>`):

```jsx
<Seo
  title={pageTitle}
  description={pageDescription}
  path="/ofertas"
  jsonLd={!loading && products.length > 0 ? itemListSchema(products, site) : undefined}
/>
```

Add `import { site } from '../data/site'`. The condition bug is fixed centrally in `productSchema` (Task 2), so no `=== 'Novo'` comparison remains in this file. Confirm by search.

- [ ] **Step 3: FAQPage — `<Seo>` + `faqSchema`**

Replace the `<Helmet>` block with:

```jsx
<Seo
  title="Perguntas Frequentes | Motoval Setúbal - Pneus em Palmela"
  description="Perguntas frequentes sobre a Motoval Setúbal: marcações, preços de alinhamento, montagem de pneus de moto, formas de pagamento e stock disponível."
  path="/faq"
  jsonLd={faqSchema(faq.items)}
/>
```

Add `import Seo from '../components/Seo'` and `import { faqSchema } from '../lib/seo/schema'` (the page already imports `faq` from `../data/content`). Remove the `Helmet` import.

- [ ] **Step 4: ContactPage — `<Seo>` + breadcrumb**

Replace the `<Helmet>` block with:

```jsx
<Seo
  title="Contactos | Motoval Setúbal - Palmela"
  description="Contacta a Motoval Setúbal em Palmela. Ligue 934 803 632, envie WhatsApp ou venha a Quinta das Asseadas, Lote 1, Aires. Aberto de Segunda a Sábado."
  path="/contacto"
  jsonLd={breadcrumbSchema([{ name: 'Início', path: '/' }, { name: 'Contactos', path: '/contacto' }], site)}
/>
```

Add imports: `Seo`, `{ breadcrumbSchema }` from `../lib/seo/schema`, `{ site }` from `../data/content` is wrong — import `site` from `../data/site`. Remove the `Helmet` import.

- [ ] **Step 5: SchedulePage — `<Seo>` + breadcrumb**

Replace the `<Helmet>` block with:

```jsx
<Seo
  title="Horário | Motoval Setúbal - Palmela"
  description="Horário da Motoval Setúbal em Palmela: Segunda a Sexta 10h-13h30 e 15h-19h30, Sábado 10h-13h30. Recomendamos marcação, especialmente aos sábados."
  path="/horario"
  jsonLd={breadcrumbSchema([{ name: 'Início', path: '/' }, { name: 'Horário', path: '/horario' }], site)}
/>
```

Add imports: `Seo`, `{ breadcrumbSchema }` from `../lib/seo/schema`, `{ site }` from `../data/site`. Remove the `Helmet` import.

- [ ] **Step 6: Verify lint + build + no stale comparison**

Run: `cd motoval-setubal && npm run lint && npm run build && node scripts/check-seo.mjs`
Expected: all clean/pass.
Run: `cd motoval-setubal && ! grep -rn "=== 'Novo'" src/ && ! grep -rn "outlook" src/ && echo CLEAN`
Expected: `CLEAN`.

- [ ] **Step 7: Commit**

```bash
git add motoval-setubal/src/pages/
git commit -m "feat(seo): adopt Seo component across pages and fix product condition mapping"
```

---

### Task 7: Fix admin login placeholder email

**Files:**
- Modify: `motoval-setubal/src/pages/AdminPage.jsx`

- [ ] **Step 1: Update placeholder**

In `LoginView`, change the email input `placeholder="motovalsetubal@gmail.com"` to `placeholder="motoval.setubal@gmail.com"`.

- [ ] **Step 2: Verify lint**

Run: `cd motoval-setubal && npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add motoval-setubal/src/pages/AdminPage.jsx
git commit -m "fix(seo): correct admin login placeholder email"
```

---

### Task 8: Full verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Run the complete gate**

Run: `cd motoval-setubal && npm run lint && npm run build && node scripts/check-seo.mjs`
Expected: lint clean, build succeeds, `SEO schema checks passed`.

- [ ] **Step 2: Assert no stale facts survive anywhere in source or build output**

Run: `cd motoval-setubal && ! grep -rIn "outlook" src/ index.html && ! grep -rIn "desde 30€\|Desde 30€" src/ index.html && ! grep -rIn "reviewCount\": \"142\"\|142+ avalia" src/ index.html dist/ && grep -q 'motoval.setubal@gmail.com' dist/index.html && grep -q 'NewCondition\|UsedCondition' src/lib/seo/schema.js && echo ALL_CLEAN`
Expected: `ALL_CLEAN`.

- [ ] **Step 3: Confirm generated sitemap content**

Run: `cd motoval-setubal && grep -c '<loc>' dist/sitemap.xml`
Expected: `5`.

- [ ] **Step 4: Final commit if anything was adjusted (otherwise skip)**

```bash
git add -A && git commit -m "chore(seo): final verification adjustments" || echo "nothing to commit"
```

---

## Self-Review

**Spec coverage:** site.js (Unit 1 → Task 1); schema.js (Unit 2 → Task 2); content.js refactor (→ Task 3); Vite plugin + index.html reduction + sitemap (Unit 3 → Task 4); Seo component (Unit 4 → Task 5); page adoption + condition fix (Unit 5 → Task 6); admin placeholder (Unit 6 → Task 7); verification (spec §7 → Tasks 2,4,6,8). All six defects mapped: email (1,3,7,8), condition bug (2,6), reviews (1,2), alignment (1,2,4), address (1), og:image (4,5). Build-time sitemap (in-scope decision → Task 4). No SSR / no per-product pages / no test framework — honored.

**Placeholder scan:** No TBD/TODO; every code step shows full code; verification steps give exact commands + expected output.

**Type consistency:** `breadcrumbSchema(items, site)` defined with two args in Task 2 and always called with `(items, site)` in Task 6. `productSchema(product, site)`/`itemListSchema(products, site)` consistent. `Seo` props match usage. `site.services[].schemaName/schemaPrice` used identically in Task 1 data and Task 2 builder. `serviceIcons`/`iconName` consistent between Task 1 and Task 3.
