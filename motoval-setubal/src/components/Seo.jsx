import { Helmet } from 'react-helmet-async'
import { site } from '../data/site'

// Per-page head tags consumed by JS-rendering crawlers (Google): title,
// description, canonical and page JSON-LD. og:/twitter: tags are intentionally
// NOT set here — they are emitted statically by vite-plugin-seo for JS-less
// social scrapers, so emitting them again via Helmet would only duplicate them.
export default function Seo({ title, description, path = '', jsonLd }) {
  const url = `${site.siteUrl}${path}`
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  )
}
