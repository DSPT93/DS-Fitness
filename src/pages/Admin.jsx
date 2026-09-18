import { useEffect, useState } from "react";
import { openLogin, logout } from "../lib/identity";
import { useIdentityUser } from "../lib/useIdentityUser";
import { hasRole } from "../lib/roles";
import {
  fetchAdminSchedule,
  saveAdminSchedule,
  fetchAdminBookings,
  cancelAdminBooking,
  fetchAdminMembers,
  inviteAdminMember,
  updateAdminMember,
  removeAdminMember,
  fetchAdminPlans,
  createAdminPlan,
  deleteAdminPlan,
  fetchAdminGlossary,
  createAdminGlossaryEntry,
  updateAdminGlossaryEntry,
  deleteAdminGlossaryEntry,
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

const EMPTY_EXERCISE = { name: "", sets: "", reps: "", rest: "", notes: "" };

function MemberPlans({ userId, memberName, onBack }) {
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState([{ ...EMPTY_EXERCISE }]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function load() {
    fetchAdminPlans(userId)
      .then((data) => setPlans(data.plans))
      .catch((err) => setError(err.message));
  }

  useEffect(load, [userId]);

  function updateExercise(idx, field, value) {
    setExercises((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  function addExerciseRow() {
    setExercises((rows) => [...rows, { ...EMPTY_EXERCISE }]);
  }

  function removeExerciseRow(idx) {
    setExercises((rows) => rows.filter((_, i) => i !== idx));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createAdminPlan(userId, { title, notes, exercises });
      setTitle("");
      setNotes("");
      setExercises([{ ...EMPTY_EXERCISE }]);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(planId) {
    setDeletingId(planId);
    try {
      await deleteAdminPlan(userId, planId);
      setPlans((p) => p.filter((plan) => plan.id !== planId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const sorted = plans ? [...plans].reverse() : null;

  return (
    <div className="admin-panel">
      <button type="button" className="admin-back" onClick={onBack}>
        ← Back to members
      </button>
      <div className="admin-panel-header">
        <h2>{memberName}'s plans</h2>
        <p className="admin-muted">The most recent plan is what they see as their "latest plan".</p>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <form className="admin-plan-form" onSubmit={handleCreate}>
        <h3>New plan</h3>
        <label className="admin-field">
          <span>Title</span>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Notes (optional)</span>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <div className="admin-exercise-rows">
          {exercises.map((ex, idx) => (
            <div key={idx} className="admin-exercise-row">
              <input
                type="text"
                placeholder="Exercise name"
                value={ex.name}
                onChange={(e) => updateExercise(idx, "name", e.target.value)}
                className="admin-exercise-name"
              />
              <input
                type="text"
                placeholder="Sets"
                value={ex.sets}
                onChange={(e) => updateExercise(idx, "sets", e.target.value)}
              />
              <input
                type="text"
                placeholder="Reps"
                value={ex.reps}
                onChange={(e) => updateExercise(idx, "reps", e.target.value)}
              />
              <input
                type="text"
                placeholder="Rest"
                value={ex.rest}
                onChange={(e) => updateExercise(idx, "rest", e.target.value)}
              />
              <input
                type="text"
                placeholder="Notes"
                value={ex.notes}
                onChange={(e) => updateExercise(idx, "notes", e.target.value)}
                className="admin-exercise-notes"
              />
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => removeExerciseRow(idx)}
                disabled={exercises.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="admin-add-range" onClick={addExerciseRow}>
          + Add exercise
        </button>

        <button type="submit" className="btn btn-primary admin-plan-save" disabled={saving}>
          {saving ? "Saving…" : "Save plan"}
        </button>
      </form>

      <h3 className="admin-plan-history-title">Plan history</h3>
      {!sorted && <p className="admin-muted">Loading…</p>}
      {sorted && sorted.length === 0 && <p className="admin-muted">No plans yet.</p>}
      {sorted && sorted.length > 0 && (
        <div className="admin-plan-history">
          {sorted.map((plan, i) => (
            <div key={plan.id} className="admin-plan-history-item">
              <div>
                <strong>{plan.title}</strong>
                {i === 0 && <span className="admin-plan-current-badge">Current</span>}
                <span className="admin-plan-history-date">
                  {" "}
                  · {new Date(plan.createdAt).toLocaleDateString()} · {plan.exercises.length} exercises
                </span>
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => handleDelete(plan.id)}
                disabled={deletingId === plan.id}
              >
                {deletingId === plan.id ? "Removing…" : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MembersManager() {
  const [members, setMembers] = useState(null);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(null);
  const [selected, setSelected] = useState(null);

  function load() {
    fetchAdminMembers()
      .then((data) => setMembers(data.members))
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleInvite(e) {
    e.preventDefault();
    setInviting(true);
    setError(null);
    setInvited(null);
    try {
      await inviteAdminMember({ name, email });
      setInvited(`${name} <${email}>`);
      setName("");
      setEmail("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  }

  async function handleCheckin(userId, nextCheckIn) {
    try {
      await updateAdminMember({ userId, nextCheckIn });
      setMembers((list) => list.map((m) => (m.userId === userId ? { ...m, nextCheckIn } : m)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(userId, memberName) {
    if (!window.confirm(`Remove ${memberName}? They'll lose access and their plans will be deleted.`)) return;
    try {
      await removeAdminMember(userId);
      setMembers((list) => list.filter((m) => m.userId !== userId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (selected) {
    return (
      <MemberPlans userId={selected.userId} memberName={selected.name} onBack={() => setSelected(null)} />
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>Members</h2>
        <p className="admin-muted">
          Invite paying clients here — they'll get an email to set a password, then can sign in at{" "}
          <code>/members</code> to see their plans.
        </p>
      </div>

      <form className="admin-invite-form" onSubmit={handleInvite}>
        <input type="text" placeholder="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
        <input
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={inviting}>
          {inviting ? "Inviting…" : "Invite member"}
        </button>
      </form>

      {error && <p className="admin-error">{error}</p>}
      {invited && <p className="admin-success">Invited {invited} — they'll get an email shortly.</p>}
      {!members && !error && <p className="admin-muted">Loading members…</p>}
      {members && members.length === 0 && <p className="admin-muted">No members yet.</p>}

      {members && members.length > 0 && (
        <div className="admin-members-table">
          {members.map((m) => (
            <div key={m.userId} className="admin-member-row">
              <div className="admin-member-info">
                <strong>{m.name}</strong>
                <a href={`mailto:${m.email}`}>{m.email}</a>
                <span className="admin-muted">
                  {m.planCount} plan{m.planCount === 1 ? "" : "s"}
                  {m.latestPlanTitle ? ` · Latest: ${m.latestPlanTitle}` : ""}
                </span>
              </div>
              <label className="admin-member-checkin">
                <span>Next catch-up</span>
                <input
                  type="date"
                  value={m.nextCheckIn ?? ""}
                  onChange={(e) => handleCheckin(m.userId, e.target.value)}
                />
              </label>
              <div className="admin-member-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setSelected(m)}>
                  Manage plans
                </button>
                <button type="button" className="admin-icon-btn" onClick={() => handleRemove(m.userId, m.name)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_GLOSSARY_ENTRY = { name: "", category: "", instructions: "", videoUrl: "" };

function GlossaryManager() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_GLOSSARY_ENTRY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    fetchAdminGlossary()
      .then((data) => setEntries(data.glossary))
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  function startEdit(entry) {
    setEditingId(entry.id);
    setForm({ name: entry.name, category: entry.category, instructions: entry.instructions, videoUrl: entry.videoUrl });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_GLOSSARY_ENTRY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateAdminGlossaryEntry({ id: editingId, ...form });
      } else {
        await createAdminGlossaryEntry(form);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this exercise from the glossary?")) return;
    try {
      await deleteAdminGlossaryEntry(id);
      setEntries((list) => list.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>Exercise glossary</h2>
        <p className="admin-muted">Shared across all members — add instructions once, reuse them in any plan.</p>
      </div>

      <form className="admin-plan-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit exercise" : "New exercise"}</h3>
        <label className="admin-field">
          <span>Name</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="admin-field">
          <span>Category (optional)</span>
          <input
            type="text"
            placeholder="e.g. Legs, Upper body, Core"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </label>
        <label className="admin-field">
          <span>Instructions</span>
          <textarea
            rows={4}
            required
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
        </label>
        <label className="admin-field">
          <span>Video URL (optional)</span>
          <input
            type="url"
            placeholder="https://…"
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
          />
        </label>

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Add exercise"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {!entries && !error && <p className="admin-muted">Loading…</p>}
      {entries && entries.length === 0 && <p className="admin-muted">No exercises yet.</p>}

      {entries && entries.length > 0 && (
        <div className="admin-glossary-list">
          {entries.map((entry) => (
            <div key={entry.id} className="admin-glossary-row">
              <div>
                <strong>{entry.name}</strong>
                {entry.category && <span className="glossary-tag">{entry.category}</span>}
              </div>
              <div className="admin-member-actions">
                <button type="button" className="btn btn-ghost" onClick={() => startEdit(entry)}>
                  Edit
                </button>
                <button type="button" className="admin-icon-btn" onClick={() => handleDelete(entry.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const user = useIdentityUser();
  const [tab, setTab] = useState("bookings");

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

  if (!hasRole(user, "admin")) {
    return (
      <section className="section admin-page">
        <div className="container admin-login">
          <p className="eyebrow">Admin</p>
          <h1>This account isn't an admin</h1>
          <p className="admin-muted">
            You're signed in, but this account doesn't have admin access. If you're a member
            looking for your workouts, head to the <a href="/members">members area</a> instead.
          </p>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Sign out
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
          <button
            type="button"
            className={`admin-tab ${tab === "members" ? "admin-tab-active" : ""}`}
            onClick={() => setTab("members")}
          >
            Members
          </button>
          <button
            type="button"
            className={`admin-tab ${tab === "glossary" ? "admin-tab-active" : ""}`}
            onClick={() => setTab("glossary")}
          >
            Glossary
          </button>
        </div>

        {tab === "bookings" && <BookingsList />}
        {tab === "schedule" && <ScheduleEditor />}
        {tab === "members" && <MembersManager />}
        {tab === "glossary" && <GlossaryManager />}
      </div>
    </section>
  );
}
