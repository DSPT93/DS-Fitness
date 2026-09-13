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
