import { dataStore, MEMBERS_KEY, plansKey } from "./lib/store.js";
import { requireMember } from "./lib/auth.js";
import { json, methodNotAllowed, withErrorHandling } from "./lib/http.js";

export const handler = withErrorHandling(async (event, context) => {
  if (event.httpMethod !== "GET") return methodNotAllowed(["GET"]);

  const auth = requireMember(context);
  if (!auth.ok) return auth.response;

  const store = dataStore(event);
  const [members, plans] = await Promise.all([
    store.get(MEMBERS_KEY, { type: "json" }),
    store.get(plansKey(auth.user.sub), { type: "json" }),
  ]);

  const profile = members?.[auth.user.sub] ?? null;
  const allPlans = Array.isArray(plans) ? plans : [];
  const latestPlan = allPlans.length > 0 ? allPlans[allPlans.length - 1] : null;
  const history = allPlans.slice(0, -1).reverse();

  return json(200, {
    profile: profile ? { ...profile, name: profile.name || auth.user.user_metadata?.full_name || "" } : null,
    latestPlan,
    history,
  });
});
