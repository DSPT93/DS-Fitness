import { dataStore, SCHEDULE_KEY, BOOKINGS_KEY } from "./lib/store.js";
import { normalizeSchedule, computeAvailability, AVAILABILITY_MODES } from "./lib/schedule.js";
import { json, methodNotAllowed, withErrorHandling } from "./lib/http.js";

export const handler = withErrorHandling(async (event) => {
  if (event.httpMethod !== "GET") return methodNotAllowed(["GET"]);

  const mode = event.queryStringParameters?.mode;
  if (!AVAILABILITY_MODES.includes(mode)) {
    return json(400, { error: `mode must be one of: ${AVAILABILITY_MODES.join(", ")}` });
  }

  const store = dataStore(event);
  const [rawSchedule, bookings] = await Promise.all([
    store.get(SCHEDULE_KEY, { type: "json" }),
    store.get(BOOKINGS_KEY, { type: "json" }),
  ]);

  const schedule = normalizeSchedule(rawSchedule);
  const days = computeAvailability(schedule, bookings ?? [], mode);

  return json(200, {
    slotDurationMinutes: schedule.slotDurationMinutes,
    days,
  });
});
