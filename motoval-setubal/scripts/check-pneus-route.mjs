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
const listPage = existsSync(new URL('../src/pages/PneusPage.jsx', import.meta.url))
  ? read('../src/pages/PneusPage.jsx')
  : read('../src/pages/OfertasPage.jsx')
const detailPage = read('../src/pages/ProductDetailPage.jsx')
const productCard = read('../src/components/products/ProductCard.jsx')
const netlify = read('../netlify.toml')
const robots = read('../public/robots.txt')
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
  check(
    'page descriptions mention new and used tyres',
    pneusPage.includes('Pneus novos e usados a preços acessíveis em Palmela.') &&
      pneusPage.includes('Pneus novos e usados a preços acessíveis para carros e motos em Palmela.')
  )
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

check('React exposes /pneus', app.includes('path="pneus"'))
check('React exposes /pneus/:slug', app.includes('path="pneus/:slug"'))
check('React redirects legacy list route', app.includes('path="ofertas"') && app.includes('<LegacyPneusRedirect />'))
check('React redirects legacy detail route', app.includes('path="ofertas/:slug"'))
check('list canonical uses /pneus', listPage.includes('path="/pneus"') && !listPage.includes('path="/ofertas"'))
check('detail URLs use /pneus', detailPage.includes('path={`/pneus/${slugForProduct}`}') && !detailPage.includes('/ofertas'))
check(
  'cards preserve the listing query in /pneus detail links',
  productCard.includes('useLocation') &&
    productCard.includes('pathname: `/pneus/${productSlug(product)}`') &&
    productCard.includes('search,')
)

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
