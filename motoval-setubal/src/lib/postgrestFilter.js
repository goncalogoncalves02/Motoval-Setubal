// PostgREST's or() filter syntax treats ',' and ')' as structural
// characters that separate/close filter clauses. Any value that might
// contain them must be wrapped in double quotes, with literal '\' and '"'
// inside backslash-escaped first.
// https://postgrest.org/en/stable/references/api/tables_views.html#operators
export function escapeOrValue(value) {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${escaped}"`
}
