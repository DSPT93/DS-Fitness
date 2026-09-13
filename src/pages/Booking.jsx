import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "../components/Reveal";
import { fetchAvailability, submitBooking } from "../lib/api";
import { business, trainingLocations } from "../data/siteContent";
import "./Booking.css";

const CONSULTATION_OPTIONS = [
  {
    id: "in-person",
    title: "In person",
    copy: `Meet face to face in ${trainingLocations.map((l) => l.name).join(" or ")}.`,
    icon: "🤝",
  },
  {
    id: "phone",
    title: "Phone call",
    copy: "A relaxed conversation, wherever you are.",
    icon: "📞",
  },
  {
    id: "video",
    title: "Video call",
    copy: "Face to face over video, from home.",
    icon: "🎥",
  },
];

const STEP_LABELS = {
  type: "Type",
  location: "Location",
  calendar: "Time",
  details: "Your details",
  confirmed: "Confirmed",
};

function stepFlow(type) {
  return type === "in-person"
    ? ["type", "location", "calendar", "details", "confirmed"]
    : ["type", "calendar", "details", "confirmed"];
}

function formatDateLabel(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  return {
    weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
    day: date.toLocaleDateString(undefined, { day: "numeric" }),
    month: date.toLocaleDateString(undefined, { month: "short" }),
    full: date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }),
  };
}

function formatTimeLabel(time) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function encodeForm(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join("&");
}

export default function Booking() {
  const [step, setStep] = useState("type");
  const [type, setType] = useState(null);
  const [location, setLocation] = useState(null);
  const [days, setDays] = useState(null);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const flow = stepFlow(type);
  const stepIndex = Math.max(flow.indexOf(step), 0);

  useEffect(() => {
    if (step !== "calendar" || days) return;
    let cancelled = false;
    fetchAvailability()
      .then((data) => {
        if (!cancelled) setDays(data.days.filter((d) => d.slots.length > 0));
      })
      .catch((err) => {
        if (!cancelled) setAvailabilityError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [step, days]);

  const activeDay = useMemo(() => days?.find((d) => d.date === selectedDate) ?? null, [days, selectedDate]);

  function selectType(id) {
    setType(id);
    setStep(id === "in-person" ? "location" : "calendar");
  }

  function selectLocation(id) {
    setLocation(id);
    setStep("calendar");
  }

  function selectDate(date) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function selectTime(time) {
    setSelectedTime(time);
    setStep("details");
  }

  function goBack() {
    const idx = flow.indexOf(step);
    if (idx > 0) setStep(flow[idx - 1]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      date: selectedDate,
      time: selectedTime,
      type,
      location: type === "in-person" ? location : "",
      ...contact,
    };

    try {
      const { booking } = await submitBooking(payload);

      // Best-effort mirror into Netlify Forms so a notification email can be
      // configured from the Netlify dashboard. The booking itself is already
      // safely stored regardless of whether this succeeds.
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm({ "form-name": "booking", ...payload }),
      }).catch(() => {});

      setConfirmedBooking(booking);
      setStep("confirmed");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section booking-page">
      <div className="container">
        <Reveal as="p" className="eyebrow">
          Book your free consultation
        </Reveal>
        <Reveal as="h1" delay={0.05} className="booking-title">
          Let's find a time that works.
        </Reveal>

        <div className="booking-steps" aria-hidden="true">
          {flow.map((key, i) => (
            <div key={key} className={`booking-step ${i <= stepIndex ? "booking-step-active" : ""}`}>
              <span className="booking-step-dot">{i + 1}</span>
              <span className="booking-step-label">{STEP_LABELS[key]}</span>
            </div>
          ))}
        </div>

        <div className="booking-panel">
          <AnimatePresence mode="wait">
            {step === "type" && (
              <motion.div
                key="step-type"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="booking-step-title">How would you like to meet?</h2>
                <div className="booking-type-grid">
                  {CONSULTATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className="booking-type-card"
                      onClick={() => selectType(opt.id)}
                    >
                      <span className="booking-type-icon" aria-hidden="true">
                        {opt.icon}
                      </span>
                      <span className="booking-type-title">{opt.title}</span>
                      <span className="booking-type-copy">{opt.copy}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "location" && (
              <motion.div
                key="step-location"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                <button type="button" className="booking-back" onClick={goBack}>
                  ← Change meeting type
                </button>
                <h2 className="booking-step-title">Which location suits you?</h2>
                <div className="booking-location-grid">
                  {trainingLocations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      className={`booking-type-card ${location === loc.id ? "booking-type-card-active" : ""}`}
                      onClick={() => selectLocation(loc.id)}
                    >
                      <span className="booking-type-title">{loc.name}</span>
                      <span className="booking-type-copy">{loc.copy}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "calendar" && (
              <motion.div
                key="step-calendar"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                <button type="button" className="booking-back" onClick={goBack}>
                  ← {type === "in-person" ? "Change location" : "Change meeting type"}
                </button>
                <h2 className="booking-step-title">Pick a date &amp; time</h2>

                {availabilityError && (
                  <p className="booking-error">
                    Couldn't load availability right now ({availabilityError}). Please try again shortly.
                  </p>
                )}

                {!days && !availabilityError && <p className="booking-loading">Loading available times…</p>}

                {days && days.length === 0 && (
                  <p className="booking-loading">
                    No upcoming availability at the moment — please email {business.email} directly.
                  </p>
                )}

                {days && days.length > 0 && (
                  <>
                    <div className="booking-day-scroller">
                      {days.map((d) => {
                        const label = formatDateLabel(d.date);
                        return (
                          <button
                            key={d.date}
                            type="button"
                            className={`booking-day-pill ${selectedDate === d.date ? "booking-day-pill-active" : ""}`}
                            onClick={() => selectDate(d.date)}
                          >
                            <span className="booking-day-weekday">{label.weekday}</span>
                            <span className="booking-day-num">{label.day}</span>
                            <span className="booking-day-month">{label.month}</span>
                          </button>
                        );
                      })}
                    </div>

                    {activeDay && (
                      <div className="booking-slots">
                        {activeDay.slots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            className={`booking-slot ${selectedTime === time ? "booking-slot-active" : ""}`}
                            onClick={() => selectTime(time)}
                          >
                            {formatTimeLabel(time)}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {step === "details" && (
              <motion.div
                key="step-details"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                <button type="button" className="booking-back" onClick={goBack}>
                  ← Change time
                </button>
                <h2 className="booking-step-title">Your details</h2>
                <p className="booking-summary">
                  {CONSULTATION_OPTIONS.find((o) => o.id === type)?.title} consultation
                  {type === "in-person" && location && (
                    <>
                      {" "}
                      in <strong>{trainingLocations.find((l) => l.id === location)?.name}</strong>
                    </>
                  )}{" "}
                  on <strong>{selectedDate && formatDateLabel(selectedDate).full}</strong> at{" "}
                  <strong>{selectedTime && formatTimeLabel(selectedTime)}</strong>
                </p>

                <form className="booking-form" onSubmit={handleSubmit}>
                  <label className="booking-field">
                    <span>Full name</span>
                    <input
                      type="text"
                      required
                      value={contact.name}
                      onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    />
                  </label>
                  <label className="booking-field">
                    <span>Email</span>
                    <input
                      type="email"
                      required
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    />
                  </label>
                  <label className="booking-field">
                    <span>Phone (optional)</span>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    />
                  </label>
                  <label className="booking-field">
                    <span>Anything you'd like me to know? (optional)</span>
                    <textarea
                      rows={4}
                      value={contact.message}
                      onChange={(e) => setContact({ ...contact, message: e.target.value })}
                    />
                  </label>

                  {submitError && <p className="booking-error">{submitError}</p>}

                  <button type="submit" className="btn btn-primary booking-submit" disabled={submitting}>
                    {submitting ? "Booking…" : "Confirm free consultation"}
                  </button>
                </form>
              </motion.div>
            )}

            {step === "confirmed" && confirmedBooking && (
              <motion.div
                key="step-confirmed"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="booking-confirmed"
              >
                <span className="booking-confirmed-icon" aria-hidden="true">
                  ✓
                </span>
                <h2>You're booked in.</h2>
                <p>
                  Your {CONSULTATION_OPTIONS.find((o) => o.id === confirmedBooking.type)?.title.toLowerCase()}{" "}
                  consultation
                  {confirmedBooking.type === "in-person" && confirmedBooking.location && (
                    <>
                      {" "}
                      in{" "}
                      <strong>
                        {trainingLocations.find((l) => l.id === confirmedBooking.location)?.name}
                      </strong>
                    </>
                  )}{" "}
                  is confirmed for <strong>{formatDateLabel(confirmedBooking.date).full}</strong> at{" "}
                  <strong>{formatTimeLabel(confirmedBooking.time)}</strong>.
                </p>
                <p className="booking-confirmed-note">
                  I'll be in touch at {confirmedBooking.email} to confirm the details. If anything
                  comes up before then, email {business.email}.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
