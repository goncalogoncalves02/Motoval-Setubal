// Pure string helpers — no React/DOM dependencies.

export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function productSlug(product) {
  return `${slugify(product.title)}-${product.id.slice(0, 8)}`
}
