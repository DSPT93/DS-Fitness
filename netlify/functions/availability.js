import { dataStore, SCHEDULE_KEY, BOOKINGS_KEY } from "./lib/store.js";
import { normalizeSchedule, computeAvailability } from "./lib/schedule.js";
import { json, methodNotAllowed, withErrorHandling } from "./lib/http.js";

export const handler = withErrorHandling(async (event) => {
  if (event.httpMethod !== "GET") return methodNotAllowed(["GET"]);

  const store = dataStore();
  const [rawSchedule, bookings] = await Promise.all([
    store.get(SCHEDULE_KEY, { type: "json" }),
    store.get(BOOKINGS_KEY, { type: "json" }),
  ]);

  const schedule = normalizeSchedule(rawSchedule);
  const days = computeAvailability(schedule, bookings ?? []);

  return json(200, {
    slotDurationMinutes: schedule.slotDurationMinutes,
    days,
  });
});
