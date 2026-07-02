import { site } from '../data/site'

// Per-page head tags: title, description, canonical, and page JSON-LD.
// React 19 hoists <title>/<meta>/<link> rendered anywhere in the tree to
// <head> natively, so no library is needed here. og:/twitter: tags are
// intentionally NOT set here — they are emitted statically by vite-plugin-seo
// for JS-less social scrapers; each head tag has exactly one owner.
export default function Seo({ title, description, path = '', jsonLd, noindex = false }) {
  const url = `${site.siteUrl}${path}`
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
  const robots = noindex
    ? 'noindex,follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </>
  )
}
