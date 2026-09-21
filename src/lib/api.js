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

export function fetchAvailability(mode) {
  return request(`/api/availability?mode=${encodeURIComponent(mode)}`);
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

// Members area

export function fetchMemberMe() {
  return request("/api/member/me", { auth: true });
}

export function fetchMemberGlossary() {
  return request("/api/member/glossary", { auth: true });
}

export function fetchAdminMembers() {
  return request("/api/admin/members", { auth: true });
}

export function inviteAdminMember(payload) {
  return request("/api/admin/members", { method: "POST", body: payload, auth: true });
}

export function updateAdminMember(payload) {
  return request("/api/admin/members", { method: "PUT", body: payload, auth: true });
}

export function removeAdminMember(userId) {
  return request(`/api/admin/members?userId=${encodeURIComponent(userId)}`, { method: "DELETE", auth: true });
}

export function fetchAdminPlans(userId) {
  return request(`/api/admin/plans?userId=${encodeURIComponent(userId)}`, { auth: true });
}

export function createAdminPlan(userId, plan) {
  return request("/api/admin/plans", { method: "POST", body: { userId, plan }, auth: true });
}

export function deleteAdminPlan(userId, planId) {
  return request(
    `/api/admin/plans?userId=${encodeURIComponent(userId)}&planId=${encodeURIComponent(planId)}`,
    { method: "DELETE", auth: true }
  );
}

export function fetchAdminGlossary() {
  return request("/api/admin/glossary", { auth: true });
}

export function createAdminGlossaryEntry(entry) {
  return request("/api/admin/glossary", { method: "POST", body: entry, auth: true });
}

export function updateAdminGlossaryEntry(entry) {
  return request("/api/admin/glossary", { method: "PUT", body: entry, auth: true });
}

export function deleteAdminGlossaryEntry(id) {
  return request(`/api/admin/glossary?id=${encodeURIComponent(id)}`, { method: "DELETE", auth: true });
}
