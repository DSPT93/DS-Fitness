// Mirrors the case-insensitive check in netlify/functions/lib/auth.js — the
// Netlify dashboard's "Roles" field stores whatever was typed verbatim, and
// mobile keyboards auto-capitalize the first letter, so "admin" can end up
// stored as "Admin" without anyone noticing.
export function hasRole(user, role) {
  return Boolean(user?.app_metadata?.roles?.some((r) => typeof r === "string" && r.toLowerCase() === role));
}
