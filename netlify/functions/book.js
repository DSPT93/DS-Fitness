import { randomUUID } from "node:crypto";
import { dataStore, SCHEDULE_KEY, BOOKINGS_KEY } from "./lib/store.js";
import {
  normalizeSchedule,
  isSlotAvailable,
  CONSULTATION_TYPES,
  TRAINING_LOCATION_IDS,
} from "./lib/schedule.js";
import { json, methodNotAllowed, withErrorHandling } from "./lib/http.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, maxLen) {
  return typeof value === "string" ? value.trim().slice(0, maxLen) : "";
}

export const handler = withErrorHandling(async (event) => {
  if (event.httpMethod !== "POST") return methodNotAllowed(["POST"]);

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const date = clean(body.date, 10);
  const time = clean(body.time, 5);
  const type = clean(body.type, 20);
  const location = clean(body.location, 40);
  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);
  const message = clean(body.message, 1000);

  if (!DATE_RE.test(date) || !TIME_RE.test(time)) {
    return json(400, { error: "A valid date and time are required." });
  }
  if (!CONSULTATION_TYPES.includes(type)) {
    return json(400, { error: "Consultation type must be in-person, phone, or video." });
  }
  if (type === "in-person" && !TRAINING_LOCATION_IDS.includes(location)) {
    return json(400, { error: "Please choose a valid location for an in-person consultation." });
  }
  if (!name) {
    return json(400, { error: "Name is required." });
  }
  if (!EMAIL_RE.test(email)) {
    return json(400, { error: "A valid email address is required." });
  }

  const store = dataStore(event);
  const [rawSchedule, bookings] = await Promise.all([
    store.get(SCHEDULE_KEY, { type: "json" }),
    store.get(BOOKINGS_KEY, { type: "json" }),
  ]);
  const schedule = normalizeSchedule(rawSchedule);
  const existingBookings = bookings ?? [];

  if (!isSlotAvailable(schedule, existingBookings, date, time)) {
    return json(409, { error: "That slot is no longer available. Please choose another time." });
  }

  const booking = {
    id: randomUUID(),
    date,
    time,
    type,
    location: type === "in-person" ? location : "",
    name,
    email,
    phone,
    message,
    createdAt: new Date().toISOString(),
  };

  await store.setJSON(BOOKINGS_KEY, [...existingBookings, booking]);

  return json(201, { booking });
});
