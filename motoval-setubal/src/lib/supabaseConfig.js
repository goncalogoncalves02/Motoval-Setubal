export function createSupabaseClient(env, factory) {
  const url = env.VITE_SUPABASE_URL?.trim()
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim()
  const key = publishableKey || anonKey

  if (!url || !key) return null

  return factory(url, key)
}
