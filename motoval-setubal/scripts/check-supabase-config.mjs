import { readFileSync } from 'node:fs'

let failures = 0
function check(label, condition) {
  if (!condition) {
    console.error('FAIL:', label)
    failures++
  }
}

let configModule
try {
  configModule = await import('../src/lib/supabaseConfig.js')
} catch {
  configModule = null
}

check(
  'safe Supabase client factory is available',
  typeof configModule?.createSupabaseClient === 'function'
)

if (configModule) {
  const { createSupabaseClient } = configModule
  let calls = 0
  const client = { connected: true }
  const factory = (url, key) => {
    calls++
    return { ...client, url, key }
  }

  const missing = createSupabaseClient({}, factory)
  check('missing configuration returns null', missing === null)
  check('missing configuration does not call SDK factory', calls === 0)

  const publishable = createSupabaseClient(
    {
      VITE_SUPABASE_URL: ' https://project.supabase.co ',
      VITE_SUPABASE_PUBLISHABLE_KEY: ' publishable-key ',
      VITE_SUPABASE_ANON_KEY: 'legacy-key',
    },
    factory
  )
  check(
    'publishable key initializes the client',
    publishable?.url === 'https://project.supabase.co' &&
      publishable?.key === 'publishable-key'
  )

  const legacy = createSupabaseClient(
    {
      VITE_SUPABASE_URL: 'https://project.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'legacy-key',
    },
    factory
  )
  check('legacy anon key remains supported', legacy?.key === 'legacy-key')

  const blankPublishable = createSupabaseClient(
    {
      VITE_SUPABASE_URL: 'https://project.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: '   ',
      VITE_SUPABASE_ANON_KEY: 'legacy-key',
    },
    factory
  )
  check(
    'blank publishable key falls back to legacy anon key',
    blankPublishable?.key === 'legacy-key'
  )

  const blank = createSupabaseClient(
    {
      VITE_SUPABASE_URL: '   ',
      VITE_SUPABASE_PUBLISHABLE_KEY: '   ',
    },
    factory
  )
  check('blank configuration is treated as missing', blank === null)
}

const supabaseSource = readFileSync(new URL('../src/lib/supabase.js', import.meta.url), 'utf8')
const authSource = readFileSync(new URL('../src/contexts/AuthContext.jsx', import.meta.url), 'utf8')
const pneusSource = readFileSync(new URL('../src/pages/PneusPage.jsx', import.meta.url), 'utf8')
const detailSource = readFileSync(new URL('../src/pages/ProductDetailPage.jsx', import.meta.url), 'utf8')

check(
  'Supabase module uses the safe factory',
  supabaseSource.includes('createSupabaseClient(import.meta.env')
)
check(
  'auth starts ready and skips SDK calls without configuration',
  authSource.includes('useState(Boolean(supabase))') &&
    authSource.includes('if (!supabase) return')
)
check(
  'catalog starts ready and skips SDK calls without configuration',
  pneusSource.includes('useState(Boolean(supabase))') &&
    pneusSource.match(/if \(!supabase\) return/g)?.length >= 2
)
check(
  'product detail skips SDK calls without configuration',
  detailSource.includes("useState(supabase ? 'loading' : 'not-found')") &&
    detailSource.includes('if (!supabase) return')
)

if (failures) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}
console.log('Supabase configuration checks passed')
