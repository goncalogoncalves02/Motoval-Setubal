import { site } from '../src/data/site.js'
import {
  localBusinessSchema,
  websiteSchema,
  faqSchema,
  breadcrumbSchema,
  productSchema,
  itemListSchema,
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

const novo = productSchema({ title: 'T', price_amount: 80, condition: 'Novos', images: [] }, site)
check('Novos -> NewCondition', novo.offers.itemCondition === 'https://schema.org/NewCondition')
check('productSchema has @context (used standalone on product detail pages)', novo['@context'] === 'https://schema.org')
const usado = productSchema({ title: 'T', price_amount: 80, condition: 'Usados', images: [] }, site)
check('Usados -> UsedCondition', usado.offers.itemCondition === 'https://schema.org/UsedCondition')

const pneusRoute = site.routes.find((route) => route.path === '/pneus')
check('sitemap source includes /pneus', pneusRoute?.changefreq === 'daily' && pneusRoute?.priority === '0.9')
check('sitemap source excludes /ofertas', !site.routes.some((route) => route.path === '/ofertas'))

const pneusList = itemListSchema(
  [{ id: 1, title: 'Pneu 205/55 R16', price_amount: 50, condition: 'Usados', images: [] }],
  site
)
check('item list uses Pneus name', pneusList.name === 'Pneus Novos e Usados - Motoval Setúbal')
check('item list uses /pneus URL', pneusList.url === 'https://motovalsetubal.com/pneus')

// Every JSON-LD must be valid JSON (no undefined/circular)
for (const [name, obj] of [['biz', biz], ['website', websiteSchema(site)], ['faq', faqSchema(site.faq)]]) {
  try { JSON.parse(JSON.stringify(obj)) } catch (e) { check(`${name} serializes`, false) }
}

if (failures) { console.error(`\n${failures} check(s) failed`); process.exit(1) }
console.log('SEO schema checks passed')
