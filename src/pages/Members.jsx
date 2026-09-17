import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { openLogin, logout } from "../lib/identity";
import { useIdentityUser } from "../lib/useIdentityUser";
import { fetchMemberMe, fetchMemberGlossary } from "../lib/api";
import { business } from "../data/siteContent";
import "./Members.css";

function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

function formatShortDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function ExerciseTable({ exercises }) {
  return (
    <div className="plan-exercises">
      {exercises.map((ex, i) => (
        <div key={i} className="plan-exercise-row">
          <div className="plan-exercise-name">{ex.name}</div>
          <div className="plan-exercise-meta">
            {ex.sets && <span>{ex.sets} sets</span>}
            {ex.reps && <span>{ex.reps} reps</span>}
            {ex.rest && <span>{ex.rest} rest</span>}
          </div>
          {ex.notes && <p className="plan-exercise-notes">{ex.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function PlanHistoryItem({ plan }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="history-item">
      <button type="button" className="history-item-toggle" onClick={() => setOpen((v) => !v)}>
        <span>
          <strong>{plan.title}</strong>
          <span className="history-item-date"> · {formatShortDate(plan.createdAt)}</span>
        </span>
        <span className="history-item-chevron">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="history-item-body">
          {plan.notes && <p className="plan-notes">{plan.notes}</p>}
          <ExerciseTable exercises={plan.exercises} />
        </div>
      )}
    </div>
  );
}

function Glossary({ entries }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
    );
  }, [entries, query]);

  return (
    <div className="glossary">
      <input
        type="search"
        className="glossary-search"
        placeholder="Search exercises…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {entries.length === 0 && <p className="members-muted">No exercises added yet.</p>}
      {entries.length > 0 && filtered.length === 0 && (
        <p className="members-muted">No exercises match "{query}".</p>
      )}

      <div className="glossary-list">
        {filtered.map((entry) => (
          <details key={entry.id} className="glossary-entry">
            <summary>
              <span>{entry.name}</span>
              {entry.category && <span className="glossary-tag">{entry.category}</span>}
            </summary>
            <p>{entry.instructions}</p>
            {entry.videoUrl && (
              <a href={entry.videoUrl} target="_blank" rel="noreferrer">
                Watch demo →
              </a>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [glossary, setGlossary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchMemberMe(), fetchMemberGlossary()])
      .then(([me, g]) => {
        setData(me);
        setGlossary(g.glossary);
      })
      .catch((err) => setError(err.message));
  }, []);

  const name = data?.profile?.name || user.user_metadata?.full_name || "there";

  return (
    <section className="section members-page">
      <div className="container">
        <div className="members-header">
          <div>
            <p className="eyebrow">Members Area</p>
            <h1>Welcome back, {name}.</h1>
          </div>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>

        {error && <p className="members-error">{error}</p>}
        {!data && !error && <p className="members-muted">Loading your dashboard…</p>}

        {data && !data.profile && (
          <p className="members-muted">
            We couldn't find an active membership on this account. Get in touch with{" "}
            {business.trainerName} to get set up.
          </p>
        )}

        {data && data.profile && (
          <>
            <div className="members-grid">
              <div className="members-panel members-checkin">
                <h2 className="members-panel-title">Next catch-up</h2>
                {data.profile.nextCheckIn ? (
                  <p className="checkin-date">{formatDate(data.profile.nextCheckIn)}</p>
                ) : (
                  <p className="members-muted">
                    Nothing on the calendar yet — {business.trainerName} will be in touch to book
                    one in.
                  </p>
                )}
              </div>

              <div className="members-panel members-plan">
                <h2 className="members-panel-title">Latest plan</h2>
                {data.latestPlan ? (
                  <>
                    <p className="plan-title">{data.latestPlan.title}</p>
                    <p className="plan-date">Set {formatShortDate(data.latestPlan.createdAt)}</p>
                    {data.latestPlan.notes && <p className="plan-notes">{data.latestPlan.notes}</p>}
                    <ExerciseTable exercises={data.latestPlan.exercises} />
                  </>
                ) : (
                  <p className="members-muted">
                    No plan yet — {business.trainerName} is putting your programme together.
                  </p>
                )}
              </div>
            </div>

            {data.history.length > 0 && (
              <div className="members-panel">
                <h2 className="members-panel-title">Plan history</h2>
                <div className="history-list">
                  {data.history.map((plan) => (
                    <PlanHistoryItem key={plan.id} plan={plan} />
                  ))}
                </div>
              </div>
            )}

            <div className="members-panel">
              <h2 className="members-panel-title">Exercise glossary</h2>
              {glossary && <Glossary entries={glossary} />}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function Members() {
  const user = useIdentityUser();

  if (user === undefined) {
    return (
      <section className="section members-page">
        <div className="container">
          <p className="members-muted">Loading…</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="section members-page">
        <div className="container members-login">
          <p className="eyebrow">Members Area</p>
          <h1>Your digital coaching, in one place.</h1>
          <p className="members-muted">
            This area is for active clients — your workout plans, progress history, and the
            exercise glossary all live here. Access is by invitation once you're training with
            me.
          </p>
          <div className="members-login-actions">
            <button type="button" className="btn btn-primary" onClick={openLogin}>
              Sign in
            </button>
            <Link to="/booking" className="btn btn-ghost">
              Not a member yet? Book a consultation
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const roles = user.app_metadata?.roles ?? [];

  if (roles.includes("admin") && !roles.includes("member")) {
    return (
      <section className="section members-page">
        <div className="container members-login">
          <p className="eyebrow">Members Area</p>
          <h1>You're signed in as admin</h1>
          <p className="members-muted">
            Manage members, plans and the glossary from the <Link to="/admin">admin area</Link>.
          </p>
        </div>
      </section>
    );
  }

  if (!roles.includes("member")) {
    return (
      <section className="section members-page">
        <div className="container members-login">
          <p className="eyebrow">Members Area</p>
          <h1>This account doesn't have members access</h1>
          <p className="members-muted">
            Get in touch with {business.trainerName} to be added, or sign out and use a different
            account.
          </p>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </section>
    );
  }

  return <Dashboard user={user} />;
}
