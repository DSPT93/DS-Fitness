import { dataStore, MEMBERS_KEY, plansKey } from "./lib/store.js";
import { requireAdmin } from "./lib/auth.js";
import { inviteMember, deleteIdentityUser } from "./lib/identityAdmin.js";
import { normalizeMemberProfile, normalizeCheckIn } from "./lib/members.js";
import { json, methodNotAllowed, withErrorHandling } from "./lib/http.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const handler = withErrorHandling(async (event, context) => {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const store = dataStore();

  if (event.httpMethod === "GET") {
    const members = (await store.get(MEMBERS_KEY, { type: "json" })) ?? {};
    const entries = await Promise.all(
      Object.entries(members).map(async ([userId, profile]) => {
        const plans = (await store.get(plansKey(userId), { type: "json" })) ?? [];
        const latestPlan = plans.length > 0 ? plans[plans.length - 1] : null;
        return { userId, ...profile, planCount: plans.length, latestPlanTitle: latestPlan?.title ?? null };
      })
    );
    entries.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return json(200, { members: entries });
  }

  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "Invalid JSON body." });
    }

    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";

    if (!name) return json(400, { error: "Name is required." });
    if (!EMAIL_RE.test(email)) return json(400, { error: "A valid email address is required." });

    let invited;
    try {
      invited = await inviteMember(context, { name, email });
    } catch (err) {
      return json(502, { error: `Couldn't invite that member: ${err.message}` });
    }

    const members = (await store.get(MEMBERS_KEY, { type: "json" })) ?? {};
    const profile = normalizeMemberProfile({ name, email, nextCheckIn: null, createdAt: new Date().toISOString() });
    members[invited.id] = profile;
    await store.setJSON(MEMBERS_KEY, members);

    return json(201, { userId: invited.id, ...profile });
  }

  if (event.httpMethod === "PUT") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "Invalid JSON body." });
    }

    const userId = typeof body.userId === "string" ? body.userId : "";
    if (!userId) return json(400, { error: "Missing userId." });

    const members = (await store.get(MEMBERS_KEY, { type: "json" })) ?? {};
    const existing = members[userId];
    if (!existing) return json(404, { error: "Member not found." });

    members[userId] = {
      ...existing,
      nextCheckIn: normalizeCheckIn(body.nextCheckIn),
      notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : existing.notes,
    };
    await store.setJSON(MEMBERS_KEY, members);

    return json(200, { userId, ...members[userId] });
  }

  if (event.httpMethod === "DELETE") {
    const userId = event.queryStringParameters?.userId;
    if (!userId) return json(400, { error: "Missing userId." });

    const members = (await store.get(MEMBERS_KEY, { type: "json" })) ?? {};
    if (!members[userId]) return json(404, { error: "Member not found." });

    delete members[userId];
    await Promise.all([
      store.setJSON(MEMBERS_KEY, members),
      store.delete(plansKey(userId)),
      deleteIdentityUser(context, userId).catch(() => {}),
    ]);

    return json(200, { ok: true });
  }

  return methodNotAllowed(["GET", "POST", "PUT", "DELETE"]);
});
