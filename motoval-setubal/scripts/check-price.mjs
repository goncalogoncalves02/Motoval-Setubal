import { formatPrice } from '../src/lib/price.js'
import { PRICE_BUCKETS } from '../src/lib/priceBuckets.js'

let failures = 0
function check(label, cond) {
  if (!cond) { console.error('FAIL:', label); failures++ }
}

check('integer amount has no decimals', formatPrice(35) === '35 €')
check('decimal amount uses pt-PT comma', formatPrice(35.5) === '35,50 €')
check('zero formats correctly', formatPrice(0) === '0 €')
check('null returns empty string', formatPrice(null) === '')
check('undefined returns empty string', formatPrice(undefined) === '')

check('exactly 4 price buckets', PRICE_BUCKETS.length === 4)
check('bucket ids are unique', new Set(PRICE_BUCKETS.map((b) => b.id)).size === 4)
check('first bucket has no lower bound', PRICE_BUCKETS[0].min === null)
check('last bucket has no upper bound', PRICE_BUCKETS[PRICE_BUCKETS.length - 1].max === null)
check('buckets chain min->max with no gaps', PRICE_BUCKETS.every((b, i) => i === 0 || b.min === PRICE_BUCKETS[i - 1].max))

if (failures) { console.error(`\n${failures} check(s) failed`); process.exit(1) }
console.log('price checks passed')
