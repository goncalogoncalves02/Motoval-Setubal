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
