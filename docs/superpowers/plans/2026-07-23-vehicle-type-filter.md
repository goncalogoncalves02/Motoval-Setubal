# Filtro de Pneus por Tipo de Veículo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Perguntar ao cliente se procura pneus para carro ou mota, aplicar esse filtro através do URL e permitir trocar para carro, mota ou todos, com suporte integral no Supabase e no admin.

**Architecture:** `vehicleType.js` concentra valores, labels, normalização e aplicação da query. `PneusPage` mantém `veiculo=carro|mota|todos` como fonte de verdade, `VehicleTypePrompt` trata apenas a escolha inicial acessível e `ProductFilters` expõe a alteração posterior. Uma migração PostgreSQL compatível adiciona `vehicle_type` aos produtos e classifica os 24 registos existentes.

**Tech Stack:** React 19, React Router 7.13, Supabase JS 2.97/PostgREST, PostgreSQL 17, Vite/Rolldown, Tailwind CSS 4, Node.js ES modules.

## Global Constraints

- A escolha inicial apresenta apenas `Pneus para carro` e `Pneus para mota`.
- O diálogo é obrigatório: sem botão fechar, clique exterior ou fecho por `Escape`.
- O diálogo usa backdrop escurecido com blur, bloqueia scroll e prende o foco.
- O URL aceita apenas `veiculo=carro`, `veiculo=mota` e `veiculo=todos`; ausência ou valor inválido abre o diálogo.
- `veiculo=todos` mostra todos os produtos sem reabrir o diálogo.
- O dropdown chama-se `Veículo` e contém `Todos`, `Carro` e `Mota`.
- Selecionar novamente `Carro` ou `Mota` equivale a `Todos`.
- “Limpar filtros” resulta em `veiculo=todos`.
- O tipo de veículo é obrigatório no admin e não fica pré-selecionado em novos produtos.
- A base de dados aceita apenas `carro` e `mota`; 22 produtos existentes ficam como carro e os dois Bridgestone Battlax T33 ficam como mota.
- RLS, autenticação, storage, preços, slugs, imagens e WhatsApp não mudam.
- Não adicionar dependências.
- Não abrir PR nem fazer merge.
- O lint não pode introduzir problemas além da baseline aceite de 3 erros e 1 aviso.

---

### Task 1: Criar domínio partilhado e migração Supabase

**Files:**
- Create: `motoval-setubal/src/lib/vehicleType.js`
- Create: `motoval-setubal/supabase/migrations/20260723000100_add_vehicle_type_to_products.sql`
- Create: `motoval-setubal/scripts/check-vehicle-type.mjs`

**Interfaces:**
- Produces: `PRODUCT_VEHICLE_TYPES`, `VEHICLE_FILTER_OPTIONS`, `normalizeVehicleParam(value)`, `vehicleTypeLabel(value)`, `vehicleTypeFilterValue(value)`, `toggleVehicleType(current, next)` e `applyVehicleTypeFilter(query, value)`.
- Produces: migração SQL que adiciona `public.products.vehicle_type`.

- [ ] **Step 1: Criar o check do domínio e da migração em estado vermelho**

Criar `scripts/check-vehicle-type.mjs`:

```js
import { readFileSync } from 'node:fs'

let failures = 0
function check(label, condition) {
  if (!condition) {
    console.error('FAIL:', label)
    failures++
  }
}

let vehicleModule
try {
  vehicleModule = await import('../src/lib/vehicleType.js')
} catch {
  vehicleModule = null
}

check('vehicle type module exists', vehicleModule !== null)

if (vehicleModule) {
  const {
    PRODUCT_VEHICLE_TYPES,
    VEHICLE_FILTER_OPTIONS,
    normalizeVehicleParam,
    vehicleTypeLabel,
    vehicleTypeFilterValue,
    toggleVehicleType,
    applyVehicleTypeFilter,
  } = vehicleModule

  check(
    'database vehicle types are exact',
    JSON.stringify(PRODUCT_VEHICLE_TYPES) === JSON.stringify(['carro', 'mota'])
  )
  check(
    'filter options are ordered Todos, Carro, Mota',
    JSON.stringify(VEHICLE_FILTER_OPTIONS) === JSON.stringify([
      { value: 'todos', label: 'Todos' },
      { value: 'carro', label: 'Carro' },
      { value: 'mota', label: 'Mota' },
    ])
  )
  check('normalizes carro', normalizeVehicleParam('carro') === 'carro')
  check('normalizes mota', normalizeVehicleParam('mota') === 'mota')
  check('normalizes todos', normalizeVehicleParam('todos') === 'todos')
  check('rejects missing vehicle', normalizeVehicleParam(null) === null)
  check('rejects invalid vehicle', normalizeVehicleParam('camiao') === null)
  check('labels database values', vehicleTypeLabel('mota') === 'Mota')
  check('todos has no database filter', vehicleTypeFilterValue('todos') === null)
  check('carro has database filter', vehicleTypeFilterValue('carro') === 'carro')
  check('active selection toggles to todos', toggleVehicleType('carro', 'carro') === 'todos')
  check('selection switches vehicle', toggleVehicleType('carro', 'mota') === 'mota')

  const calls = []
  const query = {
    eq(column, value) {
      calls.push([column, value])
      return this
    },
  }
  check('filtered query identity is preserved', applyVehicleTypeFilter(query, 'mota') === query)
  check(
    'mota adds exact PostgREST filter',
    JSON.stringify(calls) === JSON.stringify([['vehicle_type', 'mota']])
  )
  calls.length = 0
  check('todos preserves query identity', applyVehicleTypeFilter(query, 'todos') === query)
  check('todos adds no PostgREST filter', calls.length === 0)
}

let migration = ''
try {
  migration = readFileSync(
    new URL('../supabase/migrations/20260723000100_add_vehicle_type_to_products.sql', import.meta.url),
    'utf8'
  )
} catch {
  migration = ''
}

check('migration adds required vehicle_type', /add column vehicle_type text not null default 'carro'/i.test(migration))
check('migration names the check constraint', migration.includes('products_vehicle_type_check'))
check(
  'migration restricts database values',
  /check\s*\(\s*vehicle_type\s+in\s*\(\s*'carro'\s*,\s*'mota'\s*\)\s*\)/i.test(migration)
)
check('migration backfills Battlax 180 as mota', migration.includes('Bridgestone Battlax T33 180/55 ZR17'))
check('migration backfills Battlax 120 as mota', migration.includes('Bridgestone Battlax T33 120/70 ZR17'))

if (failures) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}
console.log('vehicle type checks passed')
```

- [ ] **Step 2: Executar o check e confirmar o estado vermelho**

Run:

```bash
cd motoval-setubal
node scripts/check-vehicle-type.mjs
```

Expected: FAIL porque o módulo e a migração ainda não existem.

- [ ] **Step 3: Implementar o módulo puro**

Criar `src/lib/vehicleType.js`:

```js
const VEHICLE_LABELS = Object.freeze({
  todos: 'Todos',
  carro: 'Carro',
  mota: 'Mota',
})

export const PRODUCT_VEHICLE_TYPES = Object.freeze(['carro', 'mota'])

export const VEHICLE_FILTER_OPTIONS = Object.freeze(
  ['todos', ...PRODUCT_VEHICLE_TYPES].map((value) =>
    Object.freeze({ value, label: VEHICLE_LABELS[value] })
  )
)

export function normalizeVehicleParam(value) {
  return Object.hasOwn(VEHICLE_LABELS, value) ? value : null
}

export function vehicleTypeLabel(value) {
  return VEHICLE_LABELS[value] || ''
}

export function vehicleTypeFilterValue(value) {
  return PRODUCT_VEHICLE_TYPES.includes(value) ? value : null
}

export function toggleVehicleType(current, next) {
  const normalized = normalizeVehicleParam(next)
  if (!normalized || normalized === 'todos' || current === normalized) return 'todos'
  return normalized
}

export function applyVehicleTypeFilter(query, value) {
  const filterValue = vehicleTypeFilterValue(value)
  return filterValue ? query.eq('vehicle_type', filterValue) : query
}
```

- [ ] **Step 4: Criar a migração compatível**

Criar `supabase/migrations/20260723000100_add_vehicle_type_to_products.sql`:

```sql
-- Add a required vehicle classification while keeping older clients compatible.
begin;

alter table public.products
add column vehicle_type text not null default 'carro';

update public.products
set vehicle_type = 'mota'
where title in (
  'Bridgestone Battlax T33 180/55 ZR17',
  'Bridgestone Battlax T33 120/70 ZR17'
);

alter table public.products
add constraint products_vehicle_type_check
check (vehicle_type in ('carro', 'mota'));

commit;
```

- [ ] **Step 5: Executar o check e confirmar o estado verde**

Run:

```bash
node scripts/check-vehicle-type.mjs
```

Expected: `vehicle type checks passed`.

- [ ] **Step 6: Fazer commit do incremento**

```bash
git add motoval-setubal/src/lib/vehicleType.js motoval-setubal/supabase/migrations/20260723000100_add_vehicle_type_to_products.sql motoval-setubal/scripts/check-vehicle-type.mjs
git commit -m "feat(pneus): adicionar domínio de tipo de veículo"
```

---

### Task 2: Integrar o filtro Veículo na listagem

**Files:**
- Modify: `motoval-setubal/scripts/check-vehicle-type.mjs`
- Modify: `motoval-setubal/src/pages/PneusPage.jsx`
- Modify: `motoval-setubal/src/components/products/ProductFilters.jsx`

**Interfaces:**
- Consumes: funções e constantes de `src/lib/vehicleType.js`.
- Produces: filtro URL-driven `veiculo=carro|mota|todos`, dropdown `Veículo` e query PostgREST filtrada.

- [ ] **Step 1: Expandir o check com contratos de integração**

Antes do bloco final de falhas em `scripts/check-vehicle-type.mjs`, adicionar:

```js
const read = (relativePath) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')

const pneusPage = read('../src/pages/PneusPage.jsx')
const productFilters = read('../src/components/products/ProductFilters.jsx')

check('page reads veiculo from URL', pneusPage.includes("searchParams.get('veiculo')"))
check('page normalizes vehicle param', pneusPage.includes('normalizeVehicleParam(vehicleParam)'))
check('page applies vehicle query filter', pneusPage.includes('applyVehicleTypeFilter(query, selectedVehicleType)'))
check('page vehicle filter participates in active state', pneusPage.includes('selectedVehicleFilter'))
check('clear filters stores todos', pneusPage.includes("new URLSearchParams({ veiculo: 'todos' })"))
check('page passes vehicle props', pneusPage.includes('selectedVehicleType={selectedVehicleType}'))
check('filters expose Veículo dropdown', productFilters.includes('label="Veículo"'))
check('filters render all vehicle options', productFilters.includes('VEHICLE_FILTER_OPTIONS.map'))
check('filters use radio behavior', productFilters.includes('shape="radio"'))
```

- [ ] **Step 2: Executar o check e confirmar o estado vermelho**

Run:

```bash
node scripts/check-vehicle-type.mjs
```

Expected: FAIL nos novos contratos de integração.

- [ ] **Step 3: Integrar o estado e a query em PneusPage**

Adicionar o import:

```js
import {
  applyVehicleTypeFilter,
  normalizeVehicleParam,
  toggleVehicleType,
  vehicleTypeFilterValue,
} from '../lib/vehicleType'
```

Depois de ler os restantes parâmetros:

```js
const vehicleParam = searchParams.get('veiculo')
const selectedVehicleType = normalizeVehicleParam(vehicleParam)
const selectedVehicleFilter = vehicleTypeFilterValue(selectedVehicleType)
```

Substituir `hasActiveFilters` por:

```js
const hasActiveFilters =
  selectedBrands.length > 0 ||
  selectedSizes.length > 0 ||
  selectedConditions.length > 0 ||
  !!selectedPriceBucket ||
  !!selectedVehicleFilter
```

Depois de criar a query base em `fetchProducts`:

```js
query = applyVehicleTypeFilter(query, selectedVehicleType)
```

Adicionar `selectedVehicleType` às dependências do effect de produtos.

Adicionar o handler:

```js
function selectVehicleType(vehicleType) {
  const next = toggleVehicleType(selectedVehicleType, vehicleType)
  updateFilters({ veiculo: next })
}
```

Substituir `clearFilters` por:

```js
function clearFilters() {
  setSearchParams(new URLSearchParams({ veiculo: 'todos' }), { replace: true })
}
```

Passar estas props a `ProductFilters`:

```jsx
selectedVehicleType={selectedVehicleType}
onSelectVehicleType={selectVehicleType}
```

- [ ] **Step 4: Adicionar o dropdown permanente em ProductFilters**

Importar:

```js
import {
  VEHICLE_FILTER_OPTIONS,
  vehicleTypeFilterValue,
} from '../../lib/vehicleType'
```

Adicionar às props:

```js
selectedVehicleType,
onSelectVehicleType,
```

Calcular:

```js
const vehicleFilterActive = Boolean(vehicleTypeFilterValue(selectedVehicleType))
const activeCount =
  selectedBrands.length +
  selectedSizes.length +
  selectedConditions.length +
  (selectedPriceBucket ? 1 : 0) +
  (vehicleFilterActive ? 1 : 0)
```

Como primeiro dropdown do grupo, adicionar:

```jsx
<FilterDropdown
  label="Veículo"
  count={vehicleFilterActive ? 1 : 0}
  isOpen={openFilter === 'veiculo'}
  onToggle={() => toggleOpenFilter('veiculo')}
  onClose={() => setOpenFilter(null)}
>
  {VEHICLE_FILTER_OPTIONS.map((option) => (
    <OptionRow
      key={option.value}
      label={option.label}
      checked={selectedVehicleType === option.value}
      onClick={() => onSelectVehicleType(option.value)}
      shape="radio"
    />
  ))}
</FilterDropdown>
```

- [ ] **Step 5: Executar checks focados**

Run:

```bash
node scripts/check-vehicle-type.mjs
node scripts/check-postgrest-filter.mjs
```

Expected: `vehicle type checks passed` e `postgrest filter escape checks passed`.

- [ ] **Step 6: Fazer commit do incremento**

```bash
git add motoval-setubal/scripts/check-vehicle-type.mjs motoval-setubal/src/pages/PneusPage.jsx motoval-setubal/src/components/products/ProductFilters.jsx
git commit -m "feat(pneus): filtrar catálogo por veículo"
```

---

### Task 3: Adicionar a escolha inicial obrigatória

**Files:**
- Create: `motoval-setubal/src/components/products/VehicleTypePrompt.jsx`
- Modify: `motoval-setubal/scripts/check-vehicle-type.mjs`
- Modify: `motoval-setubal/src/pages/PneusPage.jsx`

**Interfaces:**
- Consumes: `selectedVehicleType` normalizado e `selectVehicleType(value)` da Task 2.
- Produces: `VehicleTypePrompt({ onSelect })`.

- [ ] **Step 1: Adicionar checks do diálogo obrigatório**

Antes do bloco final em `scripts/check-vehicle-type.mjs`, adicionar:

```js
let prompt = ''
try {
  prompt = read('../src/components/products/VehicleTypePrompt.jsx')
} catch {
  prompt = ''
}

check('vehicle prompt component exists', prompt.length > 0)
check('prompt is an accessible modal', prompt.includes('role="dialog"') && prompt.includes('aria-modal="true"'))
check('prompt uses blurred backdrop', prompt.includes('backdrop-blur'))
check('prompt offers carro', prompt.includes("onSelect('carro')") && prompt.includes('Pneus para carro'))
check('prompt offers mota', prompt.includes("onSelect('mota')") && prompt.includes('Pneus para mota'))
check('prompt locks page scroll', prompt.includes("document.body.style.overflow = 'hidden'"))
check('prompt traps Tab focus', prompt.includes("event.key !== 'Tab'"))
check('page opens prompt for invalid vehicle', pneusPage.includes('selectedVehicleType === null'))
```

- [ ] **Step 2: Executar o check e confirmar o estado vermelho**

Run:

```bash
node scripts/check-vehicle-type.mjs
```

Expected: FAIL porque o diálogo e a integração ainda não existem.

- [ ] **Step 3: Criar VehicleTypePrompt**

Criar `src/components/products/VehicleTypePrompt.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import { Bike, Car } from 'lucide-react'

const OPTIONS = [
  { value: 'carro', label: 'Pneus para carro', Icon: Car },
  { value: 'mota', label: 'Pneus para mota', Icon: Bike },
]

export default function VehicleTypePrompt({ onSelect }) {
  const dialogRef = useRef(null)
  const firstButtonRef = useRef(null)

  useEffect(() => {
    const previousActive = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstButtonRef.current?.focus()

    function trapFocus(event) {
      if (event.key !== 'Tab') return
      const buttons = Array.from(
        dialogRef.current?.querySelectorAll('button:not([disabled])') || []
      )
      if (buttons.length === 0) return

      const first = buttons[0]
      const last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', trapFocus)
    return () => {
      document.removeEventListener('keydown', trapFocus)
      document.body.style.overflow = previousOverflow
      previousActive?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md px-5">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-type-title"
        className="w-full max-w-xl rounded-2xl border border-[#2D2D2D] bg-[#141414] p-6 shadow-2xl sm:p-8"
      >
        <h2 id="vehicle-type-title" className="text-center text-2xl font-bold text-white sm:text-3xl">
          Que tipo de pneus procura?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-[#9CA3AF] sm:text-base">
          Escolha uma opção para mostrarmos primeiro os pneus certos para si.
        </p>
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {OPTIONS.map(({ value, label, Icon }, index) => (
            <button
              key={value}
              ref={index === 0 ? firstButtonRef : undefined}
              type="button"
              onClick={() => onSelect(value)}
              className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-[#3D3D3D] bg-[#1A1A1A] p-5 text-white transition-colors hover:border-[#FBE013] hover:text-[#FBE013] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBE013]"
            >
              <Icon className="h-9 w-9" aria-hidden="true" />
              <span className="font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Integrar o diálogo em PneusPage**

Importar:

```js
import VehicleTypePrompt from '../components/products/VehicleTypePrompt'
```

No fim do `<main>`, depois do conteúdo e antes de fechar a tag, renderizar:

```jsx
{selectedVehicleType === null && (
  <VehicleTypePrompt onSelect={selectVehicleType} />
)}
```

- [ ] **Step 5: Executar o check**

Run:

```bash
node scripts/check-vehicle-type.mjs
```

Expected: `vehicle type checks passed`.

- [ ] **Step 6: Fazer commit do incremento**

```bash
git add motoval-setubal/src/components/products/VehicleTypePrompt.jsx motoval-setubal/scripts/check-vehicle-type.mjs motoval-setubal/src/pages/PneusPage.jsx
git commit -m "feat(pneus): pedir tipo de veículo à entrada"
```

---

### Task 4: Preservar filtros entre listagem e detalhe

**Files:**
- Modify: `motoval-setubal/scripts/check-vehicle-type.mjs`
- Modify: `motoval-setubal/src/components/products/ProductCard.jsx`
- Modify: `motoval-setubal/src/pages/ProductDetailPage.jsx`

**Interfaces:**
- Consumes: `location.search` do React Router.
- Produces: destinos `{ pathname, search }` nos cartões e links de retorno.

- [ ] **Step 1: Adicionar checks de preservação da query**

Antes do bloco final em `scripts/check-vehicle-type.mjs`, adicionar:

```js
const productCard = read('../src/components/products/ProductCard.jsx')
const productDetail = read('../src/pages/ProductDetailPage.jsx')

check('product card reads current query', productCard.includes('useLocation'))
check(
  'product card preserves query in detail link',
  productCard.includes('pathname: `/pneus/${productSlug(product)}`') &&
    productCard.includes('search,')
)
check('product detail reads current query', productDetail.includes('useLocation'))
check(
  'detail creates filtered listing destination',
  productDetail.includes("pathname: '/pneus'") && productDetail.includes('search,')
)
check('detail links use listing destination', productDetail.match(/to=\{listingDestination\}/g)?.length >= 2)
```

- [ ] **Step 2: Executar o check e confirmar o estado vermelho**

Run:

```bash
node scripts/check-vehicle-type.mjs
```

Expected: FAIL nos contratos de navegação.

- [ ] **Step 3: Preservar a query no ProductCard**

Alterar o import:

```js
import { Link, useLocation } from 'react-router-dom'
```

No componente:

```js
const { search } = useLocation()
```

Substituir o destino do `Link` por:

```jsx
to={{
  pathname: `/pneus/${productSlug(product)}`,
  search,
}}
```

- [ ] **Step 4: Preservar a query no ProductDetailPage**

Alterar o import:

```js
import { useParams, Link, useLocation } from 'react-router-dom'
```

No início do componente:

```js
const { search } = useLocation()
const listingDestination = {
  pathname: '/pneus',
  search,
}
```

Substituir o `to="/pneus"` do CTA de artigo indisponível e do link `Voltar aos Pneus` por:

```jsx
to={listingDestination}
```

Não alterar os valores `path` do componente `Seo` nem os paths do breadcrumb.

- [ ] **Step 5: Executar checks**

Run:

```bash
node scripts/check-vehicle-type.mjs
node scripts/check-pneus-route.mjs
```

Expected: `vehicle type checks passed` e `Pneus route checks passed`.

- [ ] **Step 6: Fazer commit do incremento**

```bash
git add motoval-setubal/scripts/check-vehicle-type.mjs motoval-setubal/src/components/products/ProductCard.jsx motoval-setubal/src/pages/ProductDetailPage.jsx
git commit -m "fix(pneus): preservar filtros nos detalhes"
```

---

### Task 5: Tornar o tipo obrigatório no admin

**Files:**
- Modify: `motoval-setubal/scripts/check-vehicle-type.mjs`
- Modify: `motoval-setubal/src/pages/AdminPage.jsx`

**Interfaces:**
- Consumes: `PRODUCT_VEHICLE_TYPES` e `vehicleTypeLabel(value)`.
- Produces: `vehicle_type` obrigatório nos payloads de produtos e badge administrativo.

- [ ] **Step 1: Adicionar checks do admin**

Antes do bloco final em `scripts/check-vehicle-type.mjs`, adicionar:

```js
const admin = read('../src/pages/AdminPage.jsx')

check('admin imports vehicle domain', admin.includes('PRODUCT_VEHICLE_TYPES'))
check("new admin form has no default vehicle", admin.includes("vehicle_type: ''"))
check('edit form loads vehicle type', admin.includes("vehicle_type: product.vehicle_type || ''"))
check('admin requires a vehicle type', admin.includes('PRODUCT_VEHICLE_TYPES.includes(form.vehicle_type)'))
check('admin renders vehicle select label', admin.includes('Tipo de veículo *'))
check('admin renders vehicle placeholder', admin.includes('Seleciona o tipo'))
check('admin payload includes form vehicle type', admin.includes('...form'))
check('admin list renders vehicle badge', admin.includes('vehicleTypeLabel(product.vehicle_type)'))
```

- [ ] **Step 2: Executar o check e confirmar o estado vermelho**

Run:

```bash
node scripts/check-vehicle-type.mjs
```

Expected: FAIL nos contratos do admin.

- [ ] **Step 3: Integrar o domínio no formulário**

Importar:

```js
import {
  PRODUCT_VEHICLE_TYPES,
  vehicleTypeLabel,
} from '../lib/vehicleType'
```

Substituir `EMPTY_FORM` por:

```js
const EMPTY_FORM = {
  title: '',
  price_amount: '',
  description: '',
  condition: 'Usados',
  tire_size: '',
  brand: '',
  vehicle_type: '',
}
```

Na inicialização de edição, acrescentar:

```js
vehicle_type: product.vehicle_type || '',
```

Substituir a validação por:

```js
if (
  !form.title.trim() ||
  form.price_amount === '' ||
  Number(form.price_amount) < 0 ||
  !PRODUCT_VEHICLE_TYPES.includes(form.vehicle_type)
) {
  setError('Título, preço e tipo de veículo são obrigatórios.')
  return
}
```

- [ ] **Step 4: Renderizar o select obrigatório**

Depois do grupo Preço/Condição, adicionar:

```jsx
<div>
  <label className="block text-[#9CA3AF] text-sm mb-1.5">Tipo de veículo *</label>
  <select
    value={form.vehicle_type}
    onChange={(e) => handleField('vehicle_type', e.target.value)}
    required
    className={inputClass}
  >
    <option value="" disabled>Seleciona o tipo</option>
    {PRODUCT_VEHICLE_TYPES.map((value) => (
      <option key={value} value={value}>
        {vehicleTypeLabel(value)}
      </option>
    ))}
  </select>
</div>
```

O payload existente usa `...form`, portanto passa a enviar `vehicle_type` em inserts e updates sem duplicação.

- [ ] **Step 5: Mostrar o badge na lista**

Dentro do grupo de badges de cada produto, depois do estado, adicionar:

```jsx
{product.vehicle_type && (
  <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-300">
    {vehicleTypeLabel(product.vehicle_type)}
  </span>
)}
```

- [ ] **Step 6: Executar checks focados**

Run:

```bash
node scripts/check-vehicle-type.mjs
node scripts/check-supabase-config.mjs
```

Expected: `vehicle type checks passed` e `Supabase configuration checks passed`.

- [ ] **Step 7: Fazer commit do incremento**

```bash
git add motoval-setubal/scripts/check-vehicle-type.mjs motoval-setubal/src/pages/AdminPage.jsx
git commit -m "feat(admin): exigir tipo de veículo nos pneus"
```

---

## Controller Gate: Verificação local, migração remota e QA

Esta fase ocorre apenas depois de as Tasks 1–5 terem revisão de especificação e qualidade aprovada.

- [ ] **Step 1: Executar a gate local completa**

```bash
cd motoval-setubal
npm run lint
node scripts/check-price.mjs
node scripts/check-slug.mjs
node scripts/check-seo.mjs
node scripts/check-postgrest-filter.mjs
node scripts/check-pneus-route.mjs
node scripts/check-supabase-config.mjs
node scripts/check-vehicle-type.mjs
npm run build
cd ..
git diff --check main...HEAD
```

Expected:

- todos os sete checks Node e o build terminam com exit code 0;
- o lint apresenta no máximo a baseline já aceite de 3 erros e 1 aviso;
- `git diff --check main...HEAD` não produz output.

- [ ] **Step 2: Confirmar que a migração ainda não foi aplicada**

No projeto Supabase `zujywcjxwcomaygrqrmh`, listar migrations e a tabela `public.products`. Prosseguir apenas se `vehicle_type` ainda não existir e `add_vehicle_type_to_products` ainda não estiver registada.

- [ ] **Step 3: Aplicar exatamente a migração versionada**

Usar `apply_migration` no projeto `zujywcjxwcomaygrqrmh`:

```text
name: add_vehicle_type_to_products
query: conteúdo exato de supabase/migrations/20260723000100_add_vehicle_type_to_products.sql
```

- [ ] **Step 4: Verificar esquema e dados remotos**

Confirmar via `list_tables(verbose=true)`:

- `vehicle_type` é `text`;
- `vehicle_type` é obrigatório;
- default é `carro`.

Executar:

```sql
select vehicle_type, count(*)::integer as product_count
from public.products
group by vehicle_type
order by vehicle_type;
```

Expected:

```text
carro: 22
mota: 2
```

Executar:

```sql
select count(*)::integer as invalid_count
from public.products
where vehicle_type is null
   or vehicle_type not in ('carro', 'mota');
```

Expected: `invalid_count = 0`.

- [ ] **Step 5: Executar advisors**

Executar advisors de `security` e `performance`. Registar qualquer finding novo relacionado com esta migração; não corrigir findings preexistentes fora do âmbito sem aprovação.

- [ ] **Step 6: Verificar no browser**

Com `npm run dev`, verificar:

1. `/pneus` abre o diálogo obrigatório.
2. Não fecha por backdrop nem `Escape`; Tab circula nas duas opções.
3. Carro cria `?veiculo=carro` e mostra apenas carros.
4. Mota cria `?veiculo=mota` e mostra os dois Battlax.
5. Dropdown troca entre Todos, Carro e Mota.
6. Clicar novamente na opção ativa resulta em `?veiculo=todos`.
7. “Limpar filtros” mantém `?veiculo=todos`.
8. Detalhe e retorno preservam a query.
9. Admin exige o tipo, guarda-o e mostra o badge.
10. Repetir os fluxos em mobile e desktop.

- [ ] **Step 7: Fazer code review global**

Gerar o pacote desde `git merge-base main HEAD` até `HEAD`, enviar a um reviewer amplo e corrigir/rever todos os findings Critical ou Important antes de concluir.
