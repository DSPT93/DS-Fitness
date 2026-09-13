// Any confirmed Netlify Identity user is treated as an admin. This site is
// built for a single trainer, so access should be controlled by keeping
// Identity registration invite-only (see README), not by a roles system.
export function getIdentityUser(context) {
  return context?.clientContext?.user ?? null;
}

export function requireAdmin(context) {
  const user = getIdentityUser(context);
  if (!user) {
    return { ok: false, response: { statusCode: 401, body: "Unauthorized" } };
  }
  return { ok: true, user };
}
