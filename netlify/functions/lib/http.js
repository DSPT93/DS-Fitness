export function json(statusCode, data) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

export function methodNotAllowed(allowed) {
  return {
    statusCode: 405,
    headers: { Allow: allowed.join(", ") },
    body: "Method Not Allowed",
  };
}

// Wraps a handler so an unexpected error becomes a readable JSON error
// response instead of a bare 502 with no explanation. Netlify Functions
// don't otherwise give the client any detail on a crash.
export function withErrorHandling(handler) {
  return async (event, context) => {
    try {
      return await handler(event, context);
    } catch (err) {
      console.error(err);
      return json(500, { error: err.message || "Unexpected server error." });
    }
  };
}
