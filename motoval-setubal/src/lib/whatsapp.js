import { site } from '../data/site'

export function productWhatsappUrl(product) {
  const message = encodeURIComponent(
    `Olá! Tenho interesse no anúncio: "${product.title}"${product.tire_size ? ` (${product.tire_size})` : ''} pelo preço de ${product.price}. Poderia dar mais informações?`
  )
  return `https://wa.me/${site.whatsapp}?text=${message}`
}
