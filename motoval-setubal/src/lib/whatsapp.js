import { site } from '../data/site'
import { formatPrice } from './price'

export function productWhatsappUrl(product) {
  const message = encodeURIComponent(
    `Olá! Tenho interesse no anúncio: "${product.title}"${product.tire_size ? ` (${product.tire_size})` : ''} pelo preço de ${formatPrice(product.price_amount)}. Poderia dar mais informações?`
  )
  return `https://wa.me/${site.whatsapp}?text=${message}`
}
