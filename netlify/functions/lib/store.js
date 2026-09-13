import { getStore } from "@netlify/blobs";

const STORE_NAME = "ds-fitness";

export function dataStore() {
  return getStore(STORE_NAME);
}

export const SCHEDULE_KEY = "schedule";
export const BOOKINGS_KEY = "bookings";
