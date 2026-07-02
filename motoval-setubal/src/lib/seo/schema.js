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

export function productSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || '',
    image: product.images?.[0] || '',
    offers: {
      '@type': 'Offer',
      price: product.price_amount,
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
      item: productSchema(product),
    })),
  }
}
