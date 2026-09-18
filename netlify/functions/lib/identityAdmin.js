// Netlify injects a service-level Identity token into any function invoked
// with a valid Identity JWT, regardless of the caller's own role — it's how
// serverless functions are meant to manage Identity users. Callers of these
// helpers MUST already be gated by requireAdmin(); nothing here re-checks
// the caller's role.
function identityContext(context) {
  const identity = context?.clientContext?.identity;
  if (!identity?.url || !identity?.token) {
    throw new Error("Identity admin context unavailable.");
  }
  return identity;
}

async function identityFetch(context, path, options = {}) {
  const { url, token } = identityContext(context);
  const res = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Identity API error (${res.status}): ${text || res.statusText}`);
  }

  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : null;
}

// POST /admin/users (the endpoint we used to call here) only ever creates a
// user record — it never sends an email, regardless of what's in the body.
// The endpoint that actually sends the invite email (matching the "Invite
// users" button in the Netlify dashboard) is POST /invite, but it only
// accepts `email` and `data` (-> user_metadata) — no app_metadata/roles —
// so the member role has to be set in a second call once the user exists.
export async function inviteMember(context, { email, name }) {
  const user = await identityFetch(context, "/invite", {
    method: "POST",
    body: JSON.stringify({ email, data: { full_name: name } }),
  });

  await identityFetch(context, `/admin/users/${user.id}`, {
    method: "POST",
    body: JSON.stringify({ app_metadata: { roles: ["member"] } }),
  });

  return user;
}

export async function deleteIdentityUser(context, userId) {
  await identityFetch(context, `/admin/users/${userId}`, { method: "DELETE" });
}
