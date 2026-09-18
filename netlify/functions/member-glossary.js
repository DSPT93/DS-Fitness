import { dataStore, GLOSSARY_KEY } from "./lib/store.js";
import { requireMember } from "./lib/auth.js";
import { json, methodNotAllowed, withErrorHandling } from "./lib/http.js";

export const handler = withErrorHandling(async (event, context) => {
  if (event.httpMethod !== "GET") return methodNotAllowed(["GET"]);

  const auth = requireMember(context);
  if (!auth.ok) return auth.response;

  const store = dataStore();
  const glossary = (await store.get(GLOSSARY_KEY, { type: "json" })) ?? [];

  return json(200, { glossary });
});
