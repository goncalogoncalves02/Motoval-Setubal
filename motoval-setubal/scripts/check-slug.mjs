import { slugify, productSlug } from '../src/lib/slug.js'

let failures = 0
function check(label, cond) {
  if (!cond) { console.error('FAIL:', label); failures++ }
}

check('lowercases and hyphenates', slugify('Pneu Continental 205/55 R16') === 'pneu-continental-205-55-r16')
check('strips diacritics', slugify('Alinhamento e Paralelismo Ção') === 'alinhamento-e-paralelismo-cao')
check('collapses repeated separators', slugify('Pneu -- Usado!!') === 'pneu-usado')
check('trims leading/trailing dashes', slugify('--Pneu--') === 'pneu')

const product = { id: 'a3f9c281-1234-5678-9abc-def012345678', title: 'Pneu Michelin 195/65 R15' }
check('productSlug appends 8-char id suffix', productSlug(product) === 'pneu-michelin-195-65-r15-a3f9c281')

const dup1 = { id: '11111111-aaaa-bbbb-cccc-dddddddddddd', title: 'Pneu X' }
const dup2 = { id: '22222222-aaaa-bbbb-cccc-dddddddddddd', title: 'Pneu X' }
check('same title, different id -> different slug', productSlug(dup1) !== productSlug(dup2))

if (failures) { console.error(`\n${failures} check(s) failed`); process.exit(1) }
console.log('slug checks passed')
