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
