import { dataStore, SCHEDULE_KEY } from "./lib/store.js";
import { normalizeSchedule } from "./lib/schedule.js";
import { requireAdmin } from "./lib/auth.js";
import { json, methodNotAllowed, withErrorHandling } from "./lib/http.js";

export const handler = withErrorHandling(async (event, context) => {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const store = dataStore();

  if (event.httpMethod === "GET") {
    const raw = await store.get(SCHEDULE_KEY, { type: "json" });
    return json(200, { schedule: normalizeSchedule(raw) });
  }

  if (event.httpMethod === "PUT" || event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "Invalid JSON body." });
    }

    const schedule = normalizeSchedule(body.schedule ?? body);
    await store.setJSON(SCHEDULE_KEY, schedule);
    return json(200, { schedule });
  }

  return methodNotAllowed(["GET", "PUT"]);
});
