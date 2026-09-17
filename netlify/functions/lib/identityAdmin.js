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

// Creating a user via the admin API sends the same invite email as the
// "Invite users" button in the Netlify dashboard.
export async function inviteMember(context, { email, name }) {
  const data = await identityFetch(context, "/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      user_metadata: { full_name: name },
      app_metadata: { roles: ["member"] },
    }),
  });
  return data;
}

export async function deleteIdentityUser(context, userId) {
  await identityFetch(context, `/admin/users/${userId}`, { method: "DELETE" });
}
