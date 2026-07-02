// min is an exclusive lower bound, max an inclusive upper bound.
// e.g. 'ate-30' matches price_amount <= 30; '30-60' matches 30 < price_amount <= 60.
export const PRICE_BUCKETS = [
  { id: 'ate-30', label: 'Até 30€', min: null, max: 30 },
  { id: '30-60', label: '30€ – 60€', min: 30, max: 60 },
  { id: '60-100', label: '60€ – 100€', min: 60, max: 100 },
  { id: 'mais-100', label: 'Mais de 100€', min: 100, max: null },
]
