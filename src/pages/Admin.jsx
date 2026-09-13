import { useEffect, useState } from "react";
import identity, { initIdentity, openLogin, logout } from "../lib/identity";
import {
  fetchAdminSchedule,
  saveAdminSchedule,
  fetchAdminBookings,
  cancelAdminBooking,
} from "../lib/api";
import { trainingLocations } from "../data/siteContent";
import "./Admin.css";

const LOCATION_NAMES = Object.fromEntries(trainingLocations.map((l) => [l.id, l.name]));

const WEEKDAYS = [
  ["mon", "Monday"],
  ["tue", "Tuesday"],
  ["wed", "Wednesday"],
  ["thu", "Thursday"],
  ["fri", "Friday"],
  ["sat", "Saturday"],
  ["sun", "Sunday"],
];

const CONSULTATION_LABELS = {
  "in-person": "In person",
  phone: "Phone call",
  video: "Video call",
};

function ScheduleEditor() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [newBlockedDate, setNewBlockedDate] = useState("");

  useEffect(() => {
    fetchAdminSchedule()
      .then((data) => setSchedule(data.schedule))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="admin-muted">Loading your schedule…</p>;
  if (!schedule) return <p className="admin-error">{error || "Couldn't load schedule."}</p>;

  function updateRange(day, idx, field, value) {
    setSchedule((s) => {
      const ranges = s.weekly[day].map((r, i) => (i === idx ? { ...r, [field]: value } : r));
      return { ...s, weekly: { ...s.weekly, [day]: ranges } };
    });
  }

  function addRange(day) {
    setSchedule((s) => ({
      ...s,
      weekly: { ...s.weekly, [day]: [...s.weekly[day], { start: "09:00", end: "17:00" }] },
    }));
  }

  function removeRange(day, idx) {
    setSchedule((s) => ({
      ...s,
      weekly: { ...s.weekly, [day]: s.weekly[day].filter((_, i) => i !== idx) },
    }));
  }

  function addBlockedDate() {
    if (!newBlockedDate) return;
    setSchedule((s) =>
      s.blockedDates.includes(newBlockedDate)
        ? s
        : { ...s, blockedDates: [...s.blockedDates, newBlockedDate].sort() }
    );
    setNewBlockedDate("");
  }

  function removeBlockedDate(date) {
    setSchedule((s) => ({ ...s, blockedDates: s.blockedDates.filter((d) => d !== date) }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSavedAt(null);
    try {
      const { schedule: saved } = await saveAdminSchedule(schedule);
      setSchedule(saved);
      setSavedAt(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>Weekly availability</h2>
        <p className="admin-muted">
          Set the hours you're free for free consultations each week. Clients will only ever see
          slots inside these windows that aren't already booked.
        </p>
      </div>

      <label className="admin-slot-duration">
        <span>Consultation length (minutes)</span>
        <input
          type="number"
          min={10}
          max={180}
          step={5}
          value={schedule.slotDurationMinutes}
          onChange={(e) => setSchedule((s) => ({ ...s, slotDurationMinutes: Number(e.target.value) }))}
        />
      </label>

      <div className="admin-week-grid">
        {WEEKDAYS.map(([key, label]) => (
          <div key={key} className="admin-day-row">
            <div className="admin-day-name">{label}</div>
            <div className="admin-day-ranges">
              {schedule.weekly[key].length === 0 && <span className="admin-muted">Unavailable</span>}
              {schedule.weekly[key].map((range, idx) => (
                <div key={idx} className="admin-range">
                  <input
                    type="time"
                    value={range.start}
                    onChange={(e) => updateRange(key, idx, "start", e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={range.end}
                    onChange={(e) => updateRange(key, idx, "end", e.target.value)}
                  />
                  <button type="button" className="admin-icon-btn" onClick={() => removeRange(key, idx)}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" className="admin-add-range" onClick={() => addRange(key)}>
                + Add time range
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-blocked-dates">
        <h3>Blocked dates</h3>
        <p className="admin-muted">Holidays or days off — no slots will be offered on these dates.</p>
        <div className="admin-blocked-add">
          <input type="date" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)} />
          <button type="button" className="btn btn-ghost" onClick={addBlockedDate}>
            Add
          </button>
        </div>
        {schedule.blockedDates.length > 0 && (
          <ul className="admin-blocked-list">
            {schedule.blockedDates.map((date) => (
              <li key={date}>
                {date}
                <button type="button" className="admin-icon-btn" onClick={() => removeBlockedDate(date)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="admin-error">{error}</p>}
      {savedAt && <p className="admin-success">Saved {savedAt.toLocaleTimeString()}.</p>}

      <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save availability"}
      </button>
    </div>
  );
}

function BookingsList() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  function load() {
    fetchAdminBookings()
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleCancel(id) {
    setCancellingId(id);
    try {
      await cancelAdminBooking(id);
      setBookings((b) => b.filter((booking) => booking.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>Upcoming bookings</h2>
        <p className="admin-muted">Consultations booked through the website.</p>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {!bookings && !error && <p className="admin-muted">Loading bookings…</p>}
      {bookings && bookings.length === 0 && <p className="admin-muted">No bookings yet.</p>}

      {bookings && bookings.length > 0 && (
        <div className="admin-bookings-table">
          {bookings.map((b) => (
            <div key={b.id} className={`admin-booking-row ${b.date < today ? "admin-booking-past" : ""}`}>
              <div className="admin-booking-when">
                <strong>{b.date}</strong>
                <span>{b.time}</span>
              </div>
              <div className="admin-booking-type">
                {CONSULTATION_LABELS[b.type] ?? b.type}
                {b.location && <span> · {LOCATION_NAMES[b.location] ?? b.location}</span>}
              </div>
              <div className="admin-booking-contact">
                <strong>{b.name}</strong>
                <a href={`mailto:${b.email}`}>{b.email}</a>
                {b.phone && <span>{b.phone}</span>}
                {b.message && <p className="admin-booking-message">{b.message}</p>}
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => handleCancel(b.id)}
                disabled={cancellingId === b.id}
              >
                {cancellingId === b.id ? "Cancelling…" : "Cancel"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState(undefined);
  const [tab, setTab] = useState("bookings");

  useEffect(() => {
    const onInit = (u) => setUser(u ?? null);
    const onLogin = (u) => {
      setUser(u);
      identity.close();
    };
    const onLogout = () => setUser(null);

    identity.on("init", onInit);
    identity.on("login", onLogin);
    identity.on("logout", onLogout);
    initIdentity();

    // The widget's `init` event depends on reaching this site's Identity
    // endpoint. If that's slow, unreachable, or Identity isn't enabled yet,
    // fall back to whatever the widget already knows rather than leaving
    // the page stuck on "Loading..." forever.
    const fallback = setTimeout(() => {
      setUser((current) => (current === undefined ? identity.currentUser() ?? null : current));
    }, 2000);

    return () => {
      clearTimeout(fallback);
      identity.off("init", onInit);
      identity.off("login", onLogin);
      identity.off("logout", onLogout);
    };
  }, []);

  if (user === undefined) {
    return (
      <section className="section admin-page">
        <div className="container">
          <p className="admin-muted">Loading…</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="section admin-page">
        <div className="container admin-login">
          <p className="eyebrow">Admin</p>
          <h1>Sign in to manage bookings</h1>
          <p className="admin-muted">
            This area is for the business owner only. If you're a client looking to book a
            consultation, head back to the <a href="/booking">booking page</a>.
          </p>
          <button type="button" className="btn btn-primary" onClick={openLogin}>
            Sign in
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}.</h1>
          </div>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>

        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${tab === "bookings" ? "admin-tab-active" : ""}`}
            onClick={() => setTab("bookings")}
          >
            Bookings
          </button>
          <button
            type="button"
            className={`admin-tab ${tab === "schedule" ? "admin-tab-active" : ""}`}
            onClick={() => setTab("schedule")}
          >
            Availability
          </button>
        </div>

        {tab === "bookings" ? <BookingsList /> : <ScheduleEditor />}
      </div>
    </section>
  );
}
