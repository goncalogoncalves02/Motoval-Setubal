import { escapeOrValue } from '../src/lib/postgrestFilter.js'

let failures = 0
function check(label, cond) {
  if (!cond) { console.error('FAIL:', label); failures++ }
}

check('plain value gets wrapped in quotes', escapeOrValue('Michelin') === '"Michelin"')
check('comma value is safely quoted', escapeOrValue('Pirelli, Import') === '"Pirelli, Import"')
check('paren value is safely quoted', escapeOrValue('Brand)') === '"Brand)"')
check('embedded quote is escaped', escapeOrValue('Brand "X"') === '"Brand \\"X\\""')
check('embedded backslash is escaped', escapeOrValue('Brand\\X') === '"Brand\\\\X"')

if (failures) { console.error(`\n${failures} check(s) failed`); process.exit(1) }
console.log('postgrest filter escape checks passed')
