import { randomUUID } from "node:crypto";
import { dataStore, MEMBERS_KEY, plansKey } from "./lib/store.js";
import { requireAdmin } from "./lib/auth.js";
import { normalizePlan } from "./lib/members.js";
import { json, methodNotAllowed } from "./lib/http.js";

export const handler = async (event, context) => {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const store = dataStore();

  if (event.httpMethod === "GET") {
    const userId = event.queryStringParameters?.userId;
    if (!userId) return json(400, { error: "Missing userId." });

    const plans = (await store.get(plansKey(userId), { type: "json" })) ?? [];
    return json(200, { plans });
  }

  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "Invalid JSON body." });
    }

    const userId = typeof body.userId === "string" ? body.userId : "";
    if (!userId) return json(400, { error: "Missing userId." });

    const members = (await store.get(MEMBERS_KEY, { type: "json" })) ?? {};
    if (!members[userId]) return json(404, { error: "Member not found." });

    const plan = normalizePlan({ ...body.plan, id: randomUUID(), createdAt: new Date().toISOString() });
    if (plan.exercises.length === 0) {
      return json(400, { error: "A plan needs at least one exercise." });
    }

    const existing = (await store.get(plansKey(userId), { type: "json" })) ?? [];
    const next = [...existing, plan];
    await store.setJSON(plansKey(userId), next);

    return json(201, { plan });
  }

  if (event.httpMethod === "DELETE") {
    const userId = event.queryStringParameters?.userId;
    const planId = event.queryStringParameters?.planId;
    if (!userId || !planId) return json(400, { error: "Missing userId or planId." });

    const existing = (await store.get(plansKey(userId), { type: "json" })) ?? [];
    const next = existing.filter((p) => p.id !== planId);
    if (next.length === existing.length) return json(404, { error: "Plan not found." });

    await store.setJSON(plansKey(userId), next);
    return json(200, { ok: true });
  }

  return methodNotAllowed(["GET", "POST", "DELETE"]);
};
