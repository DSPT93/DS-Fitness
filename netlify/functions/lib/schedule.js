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

export const DEFAULT_SCHEDULE = {
  slotDurationMinutes: 30,
  horizonDays: 28,
  weekly: {
    sun: [],
    mon: [
      { start: "06:00", end: "09:00" },
      { start: "17:00", end: "20:00" },
    ],
    tue: [
      { start: "06:00", end: "09:00" },
      { start: "17:00", end: "20:00" },
    ],
    wed: [
      { start: "06:00", end: "09:00" },
      { start: "17:00", end: "20:00" },
    ],
    thu: [
      { start: "06:00", end: "09:00" },
      { start: "17:00", end: "20:00" },
    ],
    fri: [
      { start: "06:00", end: "09:00" },
      { start: "17:00", end: "20:00" },
    ],
    sat: [{ start: "09:00", end: "12:00" }],
  },
  blockedDates: [],
};

export function normalizeSchedule(raw) {
  if (!raw || typeof raw !== "object") return structuredClone(DEFAULT_SCHEDULE);

  const weekly = {};
  for (const day of WEEKDAYS) {
    const ranges = Array.isArray(raw.weekly?.[day]) ? raw.weekly[day] : [];
    weekly[day] = ranges
      .filter((r) => r && typeof r.start === "string" && typeof r.end === "string")
      .map((r) => ({ start: r.start, end: r.end }));
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
 * days, excluding blocked dates, already-booked slots, and (for today) any
 * slot that has already started.
 */
export function computeAvailability(schedule, bookings, { now = new Date() } = {}) {
  const bookedSet = new Set(bookings.map((b) => `${b.date}T${b.time}`));
  const blockedSet = new Set(schedule.blockedDates);
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

    const ranges = schedule.weekly[weekday] ?? [];
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

export function isSlotAvailable(schedule, bookings, date, time) {
  const days = computeAvailability(schedule, bookings, { now: new Date() });
  const day = days.find((d) => d.date === date);
  return Boolean(day && day.slots.includes(time));
}
