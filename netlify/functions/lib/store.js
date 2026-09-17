import { getStore } from "@netlify/blobs";

const STORE_NAME = "ds-fitness";

export function dataStore() {
  return getStore(STORE_NAME);
}

export const SCHEDULE_KEY = "schedule";
export const BOOKINGS_KEY = "bookings";

// Members-area keys. `members` is a small index of every member's profile
// data keyed by their Identity user id; each member's workout plans live
// under their own `plans:<userId>` key so a member's history can be read
// and grown independently of everyone else's. `glossary` is one shared,
// site-wide list of exercises.
export const MEMBERS_KEY = "members";
export const GLOSSARY_KEY = "glossary";

export function plansKey(userId) {
  return `plans:${userId}`;
}
