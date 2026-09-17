function clean(value, maxLen) {
  return typeof value === "string" ? value.trim().slice(0, maxLen) : "";
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeCheckIn(value) {
  const date = clean(value, 10);
  return DATE_RE.test(date) ? date : null;
}

export function normalizeMemberProfile(raw) {
  return {
    name: clean(raw?.name, 120),
    email: clean(raw?.email, 200),
    nextCheckIn: normalizeCheckIn(raw?.nextCheckIn),
    notes: clean(raw?.notes, 2000),
    createdAt: typeof raw?.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
}

export function normalizeExercise(raw) {
  return {
    name: clean(raw?.name, 120),
    sets: clean(raw?.sets, 20),
    reps: clean(raw?.reps, 20),
    rest: clean(raw?.rest, 20),
    notes: clean(raw?.notes, 500),
  };
}

export function normalizePlan(raw) {
  const exercises = Array.isArray(raw?.exercises)
    ? raw.exercises.map(normalizeExercise).filter((e) => e.name)
    : [];

  return {
    id: clean(raw?.id, 60),
    title: clean(raw?.title, 120) || "Untitled plan",
    notes: clean(raw?.notes, 1000),
    exercises,
    createdAt: typeof raw?.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
}

export function normalizeGlossaryEntry(raw) {
  return {
    id: clean(raw?.id, 60),
    name: clean(raw?.name, 120),
    category: clean(raw?.category, 60),
    instructions: clean(raw?.instructions, 4000),
    videoUrl: clean(raw?.videoUrl, 500),
  };
}
