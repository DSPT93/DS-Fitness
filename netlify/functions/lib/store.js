import { connectLambda, getStore } from "@netlify/blobs";

const STORE_NAME = "ds-fitness";

// Our functions use the classic `handler = async (event, context) => {}`
// signature ("Lambda compatibility mode"). Netlify Blobs only auto-detects
// its environment (siteID/token) for the newer function styles — in Lambda
// compatibility mode it must be told about the current request explicitly
// via connectLambda(), or every getStore() call fails with
// MissingBlobsEnvironmentError. See https://github.com/netlify/blobs#lambda-compatibility-mode
export function dataStore(event) {
  connectLambda(event);
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
