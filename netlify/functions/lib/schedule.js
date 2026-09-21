export const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const WEEKDAY_LABELS = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

export const CONSULTATION_TYPES = ["in-person", "phone", "video"];

// Keep in sync with `trainingLocations` in src/data/siteContent.js.
export const TRAINING_LOCATION_IDS = ["chiswick", "bush-hill-park"];

// Availability is tracked separately per mode so a day can be, say,
// phone-only, in-person-only at one location, or any combination — each
// mode has its own independently editable weekly hours. Phone and video
// share the same "phone" availability (David is either free for a remote
// call at a given time or he isn't; which remote format the client picks
// doesn't change that), while each physical location is tracked on its own
// since he can only be in one place at a time.
export const AVAILABILITY_MODES = ["chiswick", "bush-hill-park", "phone"];

export const AVAILABILITY_MODE_LABELS = {
  chiswick: "Chiswick (in person)",
  "bush-hill-park": "Bush Hill Park (in person)",
  phone: "Phone / video",
};

// Maps a booking's { type, location } to the availability mode that governs
// it. In-person consultations are governed by their location; phone and
// video both draw from the shared "phone" mode.
export function modeFor(type, location) {
  return type === "in-person" ? location : "phone";
}

function emptyWeek() {
  return Object.fromEntries(WEEKDAYS.map((day) => [day, []]));
}

export const DEFAULT_SCHEDULE = {
  slotDurationMinutes: 30,
  horizonDays: 28,
  // Empty by default rather than seeded with example hours — showing made-up
  // availability to clients before it's actually configured would be worse
  // than showing none.
  weekly: Object.fromEntries(AVAILABILITY_MODES.map((mode) => [mode, emptyWeek()])),
  blockedDates: [],
};

function normalizeWeek(raw) {
  const week = emptyWeek();
  for (const day of WEEKDAYS) {
    const ranges = Array.isArray(raw?.[day]) ? raw[day] : [];
    week[day] = ranges
      .filter((r) => r && typeof r.start === "string" && typeof r.end === "string")
      .map((r) => ({ start: r.start, end: r.end }));
  }
  return week;
}

export function normalizeSchedule(raw) {
  if (!raw || typeof raw !== "object") return structuredClone(DEFAULT_SCHEDULE);

  const weekly = {};
  for (const mode of AVAILABILITY_MODES) {
    weekly[mode] = normalizeWeek(raw.weekly?.[mode]);
  }

  return {
    slotDurationMinutes: Number(raw.slotDurationMinutes) > 0 ? Number(raw.slotDurationMinutes) : DEFAULT_SCHEDULE.slotDurationMinutes,
    horizonDays: Number(raw.horizonDays) > 0 ? Math.min(Number(raw.horizonDays), 90) : DEFAULT_SCHEDULE.horizonDays,
    weekly,
    blockedDates: Array.isArray(raw.blockedDates) ? raw.blockedDates.filter((d) => typeof d === "string") : [],
  };
}

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Builds the list of bookable days/slots for the next `schedule.horizonDays`
 * days, for a single availability mode (a location, or "phone"). Excludes
 * blocked dates, and any slot already taken by a booking in ANY mode — David
 * can only run one consultation at a time regardless of its type, so a
 * booking in one mode blocks that date/time across every other mode too.
 */
export function computeAvailability(schedule, bookings, mode, { now = new Date() } = {}) {
  const bookedSet = new Set(bookings.map((b) => `${b.date}T${b.time}`));
  const blockedSet = new Set(schedule.blockedDates);
  const week = schedule.weekly[mode] ?? emptyWeek();
  const days = [];

  for (let offset = 0; offset < schedule.horizonDays; offset++) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const dateKey = toDateKey(date);
    const weekday = WEEKDAYS[date.getDay()];

    if (blockedSet.has(dateKey)) {
      days.push({ date: dateKey, weekday, slots: [] });
      continue;
    }

    const ranges = week[weekday] ?? [];
    const slots = [];

    for (const range of ranges) {
      const start = timeToMinutes(range.start);
      const end = timeToMinutes(range.end);
      for (let t = start; t + schedule.slotDurationMinutes <= end; t += schedule.slotDurationMinutes) {
        const time = minutesToTime(t);
        if (bookedSet.has(`${dateKey}T${time}`)) continue;
        if (offset === 0) {
          const slotDate = new Date(date);
          slotDate.setHours(Math.floor(t / 60), t % 60, 0, 0);
          if (slotDate <= now) continue;
        }
        slots.push(time);
      }
    }

    days.push({ date: dateKey, weekday, slots });
  }

  return days;
}

export function isSlotAvailable(schedule, bookings, date, time, mode) {
  const days = computeAvailability(schedule, bookings, mode, { now: new Date() });
  const day = days.find((d) => d.date === date);
  return Boolean(day && day.slots.includes(time));
}
