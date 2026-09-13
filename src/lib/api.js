import { getAuthToken } from "./identity";

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = await getAuthToken();
    if (!token) throw new Error("You need to be signed in to do that.");
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status}).`;
    throw new Error(message);
  }

  return data;
}

export function fetchAvailability() {
  return request("/api/availability");
}

export function submitBooking(payload) {
  return request("/api/book", { method: "POST", body: payload });
}

export function fetchAdminSchedule() {
  return request("/api/admin/schedule", { auth: true });
}

export function saveAdminSchedule(schedule) {
  return request("/api/admin/schedule", { method: "PUT", body: { schedule }, auth: true });
}

export function fetchAdminBookings() {
  return request("/api/admin/bookings", { auth: true });
}

export function cancelAdminBooking(id) {
  return request(`/api/admin/bookings?id=${encodeURIComponent(id)}`, { method: "DELETE", auth: true });
}
