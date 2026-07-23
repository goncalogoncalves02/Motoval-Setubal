// Pure, serializable business data — single source of truth.
// NO React / lucide / JSX imports: this file is imported by vite.config.js at build time.

export const site = {
  siteUrl: 'https://motovalsetubal.com',
  ogImage: '/og-image.jpg',

  name: 'Motoval Setúbal',
  alternateName: 'Motoval',
  founder: 'Bruno Gonçalves',
  description:
    'Especialistas em montagem e comércio de pneus para carros e motos em Palmela. Atendimento 5 estrelas com os melhores preços da região.',

  phoneDisplay: '934 803 632',
  phoneE164: '+351934803632',
  telHref: 'tel:934803632',
  whatsapp: '351934803632',
  email: 'motoval.setubal@gmail.com',

  address: {
    street: 'Quinta das Asseadas, Lote 1, EN 252',
    locality: 'Palmela',
    region: 'Setúbal',
    postalCode: '2950-019',
    country: 'PT',
    display: 'Quinta das Asseadas, Lote 1 (EN 252), 2950-019 Palmela',
    mapUrl: 'https://maps.app.goo.gl/cSbE86MjY4KjA8RJA',
  },
  geo: { lat: 38.5623069, lng: -8.8906092 },

  sameAs: ['https://www.facebook.com/motoval.setubal01'],

  // Machine-readable for OpeningHoursSpecification
  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '13:30' },
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '15:00', closes: '19:30' },
    { days: ['Saturday'], opens: '10:00', closes: '13:30' },
  ],
  // Human-readable (pt-PT) for the schedule UI
  scheduleHours: [
    { day: 'Segunda', hours: '10:00-13:30 | 15:00-19:30' },
    { day: 'Terça', hours: '10:00-13:30 | 15:00-19:30' },
    { day: 'Quarta', hours: '10:00-13:30 | 15:00-19:30' },
    { day: 'Quinta', hours: '10:00-13:30 | 15:00-19:30' },
    { day: 'Sexta', hours: '10:00-13:30 | 15:00-19:30' },
    { day: 'Sábado', hours: '10:00-13:30' },
    { day: 'Domingo', hours: 'Fechado' },
  ],
  scheduleNote:
    'Recomendamos marcação, especialmente aos sábados. Atendemos urgências conforme disponibilidade.',

  reviews: {
    ratingValue: 4.9,
    reviewCount: 300,
    bestRating: 5,
    worstRating: 1,
    testimonials: [
      {
        text: 'A Motoval é um daqueles locais que demonstra bem como o comércio tradicional tem todos os argumentos para ser uma opção de primeira linha. A simpatia e disponibilidade do Bruno só rivaliza com a perícia e conhecimento do seu trabalho.',
        author: 'Pedro E.',
        rating: 5,
      },
      {
        text: 'Totalmente satisfeito com os serviços realizados (mudança de pneus de carro e mota). O Sr. Bruno é um excelente profissional, tentando sempre solucionar as urgências.',
        author: 'Luís O.',
        rating: 5,
      },
      {
        text: 'Hoje em vésperas de ano novo e com a oficina em limpezas ainda anuiu em auxiliar e montar um pneu da minha mota. Trabalho impecável. Precisamos de mais pessoas como o Sr. Bruno.',
        author: 'Nelson T.',
        rating: 5,
      },
    ],
  },

  // iconName maps to a lucide component in content.js; schemaPrice/schemaName feed OfferCatalog.
  services: [
    { iconName: 'Car', title: 'Montagem de Pneus - Carros', description: 'Jantes de aço, alumínio, 4x4 e runflat', price: 'Desde 15€', schemaName: 'Montagem de Pneus - Carros', schemaPrice: '15' },
    { iconName: 'Bike', title: 'Montagem de Pneus - Motos', description: 'Todas as cilindradas e estilos', price: 'Desde 25€', schemaName: 'Montagem de Pneus - Motos', schemaPrice: '25' },
    { iconName: 'Gauge', title: 'Alinhamento & Paralelismo', description: 'Controlo completo da geometria', price: 'Desde 25€', schemaName: 'Alinhamento e Paralelismo', schemaPrice: '25' },
    { iconName: 'CircleDot', title: 'Equilibragem & Calibragem', description: 'Rodagem suave e segura', price: 'Apenas 5€ por roda', schemaName: 'Equilibragem e Calibragem', schemaPrice: '5' },
    { iconName: 'Wrench', title: 'Reparação de Furos', description: 'Solução rápida e duradoura', price: 'Desde 10€', schemaName: 'Reparação de Furos', schemaPrice: '10' },
    { iconName: 'ShoppingCart', title: 'Venda de Pneus', description: 'Todas as marcas | Stock permanente', price: 'Sob orçamento' },
  ],

  faq: [
    { id: 1, question: 'Preciso de marcação?', answer: 'Recomendada, especialmente aos sábados. Atendemos urgências conforme disponibilidade.' },
    { id: 2, question: 'Fazem montagem de pneus de moto?', answer: 'Sim, todos os tipos desde 25€. Trabalhamos com todas as cilindradas e estilos de motos.' },
    { id: 3, question: 'Quanto custa o alinhamento?', answer: 'Dianteiro 25€, dianteiro+traseiro 30€. Controlo completo da geometria do veículo.' },
    { id: 4, question: 'Aceitam cartão?', answer: 'Sim, crédito, débito e pagamentos NFC. Para sua comodidade aceitamos várias formas de pagamento.' },
    { id: 5, question: 'Têm pneus em stock?', answer: 'Sim, grande diversidade. Referências especiais em 2-3 dias.' },
  ],

  payment: ['Cash', 'Credit Card', 'Debit Card', 'NFC Payment'],
  areaServed: ['Palmela', 'Setúbal', 'Aires'],
  priceRange: '€-€€',

  routes: [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/pneus', changefreq: 'daily', priority: '0.9' },
    { path: '/contacto', changefreq: 'monthly', priority: '0.7' },
    { path: '/faq', changefreq: 'monthly', priority: '0.6' },
    { path: '/horario', changefreq: 'monthly', priority: '0.5' },
  ],
}
