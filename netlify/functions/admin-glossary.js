import { randomUUID } from "node:crypto";
import { dataStore, GLOSSARY_KEY } from "./lib/store.js";
import { requireAdmin } from "./lib/auth.js";
import { normalizeGlossaryEntry } from "./lib/members.js";
import { json, methodNotAllowed, withErrorHandling } from "./lib/http.js";

export const handler = withErrorHandling(async (event, context) => {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const store = dataStore();

  if (event.httpMethod === "GET") {
    const glossary = (await store.get(GLOSSARY_KEY, { type: "json" })) ?? [];
    return json(200, { glossary });
  }

  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "Invalid JSON body." });
    }

    const entry = normalizeGlossaryEntry({ ...body, id: randomUUID() });
    if (!entry.name || !entry.instructions) {
      return json(400, { error: "Name and instructions are required." });
    }

    const glossary = (await store.get(GLOSSARY_KEY, { type: "json" })) ?? [];
    const next = [...glossary, entry];
    await store.setJSON(GLOSSARY_KEY, next);

    return json(201, { entry });
  }

  if (event.httpMethod === "PUT") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "Invalid JSON body." });
    }

    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return json(400, { error: "Missing id." });

    const glossary = (await store.get(GLOSSARY_KEY, { type: "json" })) ?? [];
    const index = glossary.findIndex((e) => e.id === id);
    if (index === -1) return json(404, { error: "Entry not found." });

    const entry = normalizeGlossaryEntry({ ...body, id });
    if (!entry.name || !entry.instructions) {
      return json(400, { error: "Name and instructions are required." });
    }

    glossary[index] = entry;
    await store.setJSON(GLOSSARY_KEY, glossary);

    return json(200, { entry });
  }

  if (event.httpMethod === "DELETE") {
    const id = event.queryStringParameters?.id;
    if (!id) return json(400, { error: "Missing id." });

    const glossary = (await store.get(GLOSSARY_KEY, { type: "json" })) ?? [];
    const next = glossary.filter((e) => e.id !== id);
    if (next.length === glossary.length) return json(404, { error: "Entry not found." });

    await store.setJSON(GLOSSARY_KEY, next);
    return json(200, { ok: true });
  }

  return methodNotAllowed(["GET", "POST", "PUT", "DELETE"]);
});
