import { dataStore, BOOKINGS_KEY } from "./lib/store.js";
import { requireAdmin } from "./lib/auth.js";
import { json, methodNotAllowed } from "./lib/http.js";

export const handler = async (event, context) => {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const store = dataStore();

  if (event.httpMethod === "GET") {
    const bookings = (await store.get(BOOKINGS_KEY, { type: "json" })) ?? [];
    const sorted = [...bookings].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
    return json(200, { bookings: sorted });
  }

  if (event.httpMethod === "DELETE") {
    const id = event.queryStringParameters?.id;
    if (!id) return json(400, { error: "Missing booking id." });

    const bookings = (await store.get(BOOKINGS_KEY, { type: "json" })) ?? [];
    const next = bookings.filter((b) => b.id !== id);
    if (next.length === bookings.length) return json(404, { error: "Booking not found." });

    await store.setJSON(BOOKINGS_KEY, next);
    return json(200, { ok: true });
  }

  return methodNotAllowed(["GET", "DELETE"]);
};
