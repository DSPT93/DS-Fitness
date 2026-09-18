// Two audiences now share Netlify Identity: the trainer (role "admin") and
// paying clients (role "member"). Registration stays invite-only (see
// README) — anyone with an account got there because the admin invited them
// — but access to admin-only and member-only data is still gated by role,
// not just "is signed in".
export function getIdentityUser(context) {
  return context?.clientContext?.user ?? null;
}

// Case-insensitive: the Netlify dashboard's "Roles" field stores whatever
// was typed verbatim, and mobile keyboards love to auto-capitalize the
// first letter — "admin" easily becomes "Admin" without anyone noticing.
function hasRole(user, role) {
  return Boolean(user?.app_metadata?.roles?.some((r) => typeof r === "string" && r.toLowerCase() === role));
}

export function requireAdmin(context) {
  const user = getIdentityUser(context);
  if (!user) {
    return { ok: false, response: { statusCode: 401, body: "Unauthorized" } };
  }
  if (!hasRole(user, "admin")) {
    return { ok: false, response: { statusCode: 403, body: "Forbidden" } };
  }
  return { ok: true, user };
}

// Member-only endpoints also accept the admin, so the trainer can see
// exactly what a client sees when troubleshooting.
export function requireMember(context) {
  const user = getIdentityUser(context);
  if (!user) {
    return { ok: false, response: { statusCode: 401, body: "Unauthorized" } };
  }
  if (!hasRole(user, "member") && !hasRole(user, "admin")) {
    return { ok: false, response: { statusCode: 403, body: "Forbidden" } };
  }
  return { ok: true, user };
}
