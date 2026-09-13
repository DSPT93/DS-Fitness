import { dataStore, SCHEDULE_KEY, BOOKINGS_KEY } from "./lib/store.js";
import { normalizeSchedule, computeAvailability } from "./lib/schedule.js";
import { json, methodNotAllowed } from "./lib/http.js";

export const handler = async (event) => {
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
};
